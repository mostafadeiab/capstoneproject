'use client';

import { useState, useEffect } from 'react';
import NavBar from "@/components/NavBar";
import { parse } from 'papaparse';

type DemoData = {
  Timestamp: string;
  'Device Name': string;
  'Start Time': string;
  'End Time': string;
  'Duration (s)': string;
  'Flow Rate (L/min)': string;
  'Volume Used (L)': string;
  'Event ID': string;
  Occupants: string;
};

export default function Demo() {
  const [staticData, setStaticData] = useState<DemoData[]>([]);
  const [addedData, setAddedData] = useState<DemoData[]>([]);
  const [addedRowsCount, setAddedRowsCount] = useState(0);

  // Load initial data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const response = await fetch('/Demo.csv');
      const csvText = await response.text();
      
      const results = parse<DemoData>(csvText, {
        header: true,
        skipEmptyLines: true,
      });

      if (results.data && results.data.length > 0) {
        setStaticData(results.data);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const generateEventId = () => {
    const num = Math.floor(Math.random() * 1000).toString().padStart(5, '0');
    return `EVT${num}`;
  };

  const formatNumber = (num: number, decimals: number = 2) => {
    return num.toFixed(decimals);
  };

  const getCurrentTorontoTime = () => {
    const options: Intl.DateTimeFormatOptions = {
      timeZone: 'America/Toronto',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    };

    const formatter = new Intl.DateTimeFormat('en-CA', options);
    const parts = formatter.formatToParts(new Date());
    
    const timestamp = `${parts.find(p => p.type === 'year')?.value}-${parts.find(p => p.type === 'month')?.value}-${parts.find(p => p.type === 'day')?.value} ${parts.find(p => p.type === 'hour')?.value}:${parts.find(p => p.type === 'minute')?.value}`;
    const time = `${parts.find(p => p.type === 'hour')?.value}:${parts.find(p => p.type === 'minute')?.value}:${parts.find(p => p.type === 'second')?.value}`;
    
    return { timestamp, time };
  };

  const addNewRow = () => {
    const { timestamp, time } = getCurrentTorontoTime();
    
    // Calculate random duration between 4 and 5 seconds
    const duration = Math.random() * (5 - 4) + 4;
    
    // Calculate end time by adding duration to current time
    const endDate = new Date(new Date().getTime() + duration * 1000);
    const endTime = endDate.toTimeString().split(' ')[0];
    
    // Generate random flow rate between 4 and 5.5
    const flowRate = Math.random() * (5.5 - 4) + 4;
    
    // Generate random volume between 0.8 and 1.12
    const volume = Math.random() * (1.12 - 0.8) + 0.8;

    const newRow: DemoData = {
      'Timestamp': timestamp,
      'Device Name': 'toilet',
      'Start Time': time,
      'End Time': endTime,
      'Duration (s)': formatNumber(duration, 1),
      'Flow Rate (L/min)': formatNumber(flowRate, 2),
      'Volume Used (L)': formatNumber(volume, 3),
      'Event ID': generateEventId(),
      'Occupants': '3'
    };

    setAddedData(prev => [...prev, newRow]);
    setAddedRowsCount(prev => prev + 1);
  };

  const clearAddedRows = () => {
    setAddedData([]);
    setAddedRowsCount(0);
  };

  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      
      <main className="max-w-7xl mx-auto px-8 py-16">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Demo Data</h1>
          <div className="flex gap-4">
            <button
              onClick={addNewRow}
              className="bg-primary hover:bg-primary-dark text-white px-6 py-2 rounded-lg transition-colors flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
              </svg>
              Refresh ({addedRowsCount} rows added)
            </button>
            <button
              onClick={clearAddedRows}
              className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Clear Added Rows
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {staticData.length > 0 && Object.keys(staticData[0]).map((header) => (
                    <th
                      key={header}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {/* Static Data */}
                {staticData.map((row, index) => (
                  <tr key={`static-${index}`}>
                    {Object.values(row).map((value, cellIndex) => (
                      <td
                        key={cellIndex}
                        className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                      >
                        {value}
                      </td>
                    ))}
                  </tr>
                ))}
                
                {/* Added Data */}
                {addedData.map((row, index) => (
                  <tr key={`added-${index}`} className="bg-green-50">
                    {Object.values(row).map((value, cellIndex) => (
                      <td
                        key={cellIndex}
                        className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                      >
                        {value}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
} 