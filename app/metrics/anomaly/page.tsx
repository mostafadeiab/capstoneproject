'use client';

import { useState, useEffect } from 'react';
import NavBar from "@/components/NavBar";
import { parse } from 'papaparse';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

type AnomalyData = {
  timestamp: string;
  date: string;
  device: string;
  volume: number;
  isAnomaly: boolean;
};

type GroupedAnomaly = {
  date: string;
  fixtures: {
    device: string;
    volume: number;
    timestamp: string;
  }[];
};

export default function Anomaly() {
  const [data, setData] = useState<AnomalyData[]>([]);
  const [groupedAnomalies, setGroupedAnomalies] = useState<GroupedAnomaly[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [dateRangeTotal, setDateRangeTotal] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/Anomaly.csv');
      const csvText = await response.text();
      
      const results = parse(csvText, {
        header: true,
        skipEmptyLines: true,
      });

      const formattedData = results.data
        .map((row: any) => ({
          timestamp: row['Timestamp'],
          date: row['Timestamp'].split(' ')[0],
          device: row['Device Name'],
          volume: parseFloat(row['Volume Used (L)']),
          isAnomaly: row['Anomaly'] === '1'
        }))
        .filter((item: AnomalyData) => item.isAnomaly);

      setData(formattedData);

      // Group anomalies by date
      const grouped = formattedData.reduce((acc: { [key: string]: GroupedAnomaly }, curr) => {
        if (!acc[curr.date]) {
          acc[curr.date] = {
            date: curr.date,
            fixtures: []
          };
        }
        acc[curr.date].fixtures.push({
          device: curr.device,
          volume: curr.volume,
          timestamp: curr.timestamp
        });
        return acc;
      }, {});

      setGroupedAnomalies(Object.values(grouped).sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      ));
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      const filteredData = data.filter(item => {
        const itemDate = new Date(item.date);
        return itemDate >= start && itemDate <= end;
      });

      const total = filteredData.reduce((sum, item) => sum + item.volume, 0);
      setDateRangeTotal(Number(total.toFixed(2)));
    }
  }, [data, startDate, endDate]);

  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      
      <main className="max-w-7xl mx-auto px-8 py-16">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Anomaly Detection</h1>
        
        {/* Date Range Selection */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Date Range Analysis</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                min={startDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="flex items-end">
              <div className="bg-gray-100 rounded-lg p-4 w-full">
                <p className="text-sm text-gray-600">Total Anomalous Usage:</p>
                <p className="text-2xl font-bold text-primary">{dateRangeTotal} L</p>
              </div>
            </div>
          </div>
        </div>

        {/* Anomalies List */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Detected Anomalies</h2>
          
          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
          ) : groupedAnomalies.length > 0 ? (
            <div className="space-y-4">
              {groupedAnomalies.map((group) => (
                <div key={group.date} className="border rounded-lg overflow-hidden">
                  <button
                    onClick={() => setSelectedDate(selectedDate === group.date ? '' : group.date)}
                    className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 flex justify-between items-center"
                  >
                    <span className="font-medium">{group.date}</span>
                    <span className="text-primary font-medium">
                      {group.fixtures.length} anomalies detected
                    </span>
                  </button>
                  
                  {selectedDate === group.date && (
                    <div className="p-4 space-y-3">
                      {group.fixtures.map((fixture, idx) => (
                        <div key={idx} className="flex justify-between items-center bg-gray-50 p-3 rounded">
                          <div>
                            <p className="font-medium">{fixture.device.replace(/_/g, ' ')}</p>
                            <p className="text-sm text-gray-600">{fixture.timestamp}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-semibold text-primary">{fixture.volume.toFixed(2)} L</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-600 py-8">No anomalies detected</p>
          )}
        </div>
      </main>
    </div>
  );
} 