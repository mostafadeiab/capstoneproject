'use client';

import { useState, useEffect } from 'react';
import { parse } from 'papaparse';

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

type CSVRowData = {
  Timestamp: string;
  'Device Name': string;
  'Volume Used (L)': string;
  Anomaly: string;
  [key: string]: string;
};

export default function Anomaly() {
  const [data, setData] = useState<AnomalyData[]>([]);
  const [groupedAnomalies, setGroupedAnomalies] = useState<GroupedAnomaly[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [dateRangeTotal, setDateRangeTotal] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const loadData = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch('/Anomaly.csv');
      const csvText = await response.text();

      const results = parse<CSVRowData>(csvText, {
        header: true,
        skipEmptyLines: true,
      });

      if (results.errors && results.errors.length > 0) {
        const errorMessage = results.errors.map(err => err.message).join(', ');
        throw new Error(`Failed to parse CSV data: ${errorMessage}`);
      }

      const formattedData = results.data
        .filter((row): row is CSVRowData => Boolean(row && row.Timestamp && row['Device Name']))
        .map((row) => ({
          timestamp: row.Timestamp.trim(),
          date: row.Timestamp.split(' ')[0],
          device: row['Device Name'].trim(),
          volume: parseFloat(row['Volume Used (L)']),
          isAnomaly: row.Anomaly === '1'
        }))
        .filter((item) => item.isAnomaly);

      if (formattedData.length === 0) {
        setError('No anomaly data found');
        return;
      }

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

      const sortedGroups = Object.values(grouped).sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      setGroupedAnomalies(sortedGroups);

      // Set initial date range if data exists
      if (formattedData.length > 0) {
        const dates = formattedData.map(d => new Date(d.date));
        const earliest = new Date(Math.min(...dates.map(d => d.getTime())));
        const latest = new Date(Math.max(...dates.map(d => d.getTime())));
        setStartDate(earliest.toISOString().split('T')[0]);
        setEndDate(latest.toISOString().split('T')[0]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
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
    <div>
      <div className="space-y-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}
        
        {/* Date Range Selection */}
        <div className="bg-white rounded-lg shadow-md p-6">
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
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Detected Anomalies</h2>
            <button
              onClick={loadData}
              disabled={isLoading}
              className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors flex items-center gap-2"
            >
              {isLoading ? (
                <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                </svg>
              )}
              Refresh Data
            </button>
          </div>
          
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
      </div>
    </div>
  );
} 