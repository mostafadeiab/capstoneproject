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

type ForecastData = {
  timestamp: string;
  device: string;
  volume: number;
};

type AggregatedData = {
  date: string;
  volume: number;
};

type TimeRange = '1week' | '1month' | '3months' | '6months' | '1year';

export default function Forecast() {
  const [data, setData] = useState<ForecastData[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string>('all');
  const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRange>('1week');
  const [startDate, setStartDate] = useState<string>('');
  const [filteredData, setFilteredData] = useState<AggregatedData[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const devices = [
    'all',
    'bathroom_sink',
    'bathroom_sink_2',
    'toilet',
    'toilet_2',
    'washing_machine',
    'dishwasher',
    'shower',
    'kitchen_sink'
  ];

  const aggregateDataByDay = (data: ForecastData[]) => {
    const aggregated = data.reduce((acc: { [key: string]: number }, curr) => {
      const date = curr.timestamp.split(' ')[0]; // Get just the date part
      acc[date] = (acc[date] || 0) + curr.volume;
      return acc;
    }, {});

    return Object.entries(aggregated).map(([date, volume]) => ({
      date,
      volume: Number(volume.toFixed(2)) // Round to 2 decimal places
    })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  const loadData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/Forecast.csv');
      const csvText = await response.text();
      
      const results = parse(csvText, {
        header: true,
        skipEmptyLines: true,
      });

      const formattedData = results.data.map((row: any) => ({
        timestamp: row['Timestamp'],
        device: row['Device Name'],
        volume: parseFloat(row['Volume Used (L)'])
      }));

      setData(formattedData);
      
      // Set initial start date
      if (formattedData.length > 0 && formattedData[0].timestamp) {
        const dateStr = formattedData[0].timestamp.split(' ')[0];
        setStartDate(dateStr);
      }
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
    if (!data.length || !startDate) return;

    const startDateTime = new Date(startDate);
    let endDateTime = new Date(startDate);

    switch (selectedTimeRange) {
      case '1week':
        endDateTime.setDate(endDateTime.getDate() + 7);
        break;
      case '1month':
        endDateTime.setMonth(endDateTime.getMonth() + 1);
        break;
      case '3months':
        endDateTime.setMonth(endDateTime.getMonth() + 3);
        break;
      case '6months':
        endDateTime.setMonth(endDateTime.getMonth() + 6);
        break;
      case '1year':
        endDateTime.setFullYear(endDateTime.getFullYear() + 1);
        break;
    }

    let filtered = data.filter(item => {
      const itemDate = new Date(item.timestamp);
      return itemDate >= startDateTime && itemDate <= endDateTime;
    });

    if (selectedDevice !== 'all') {
      filtered = filtered.filter(item => item.device === selectedDevice);
    }

    const aggregatedData = aggregateDataByDay(filtered);
    setFilteredData(aggregatedData);
  }, [data, selectedDevice, selectedTimeRange, startDate]);

  const handleClearData = () => {
    setFilteredData([]);
  };

  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      
      <main className="max-w-7xl mx-auto px-8 py-16">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Water Usage Forecast</h1>
          <div className="flex gap-4">
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
            <button
              onClick={handleClearData}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 2a1 1 0 00-1 1v1a1 1 0 001 1h1v11a3 3 0 003 3h8a3 3 0 003-3V5h1a1 1 0 001-1V3a1 1 0 00-1-1H4zm3 14V5h8v11a1 1 0 01-1 1H8a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
              Clear Graph
            </button>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Time Range Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Time Period
              </label>
              <select
                value={selectedTimeRange}
                onChange={(e) => setSelectedTimeRange(e.target.value as TimeRange)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="1week">1 Week</option>
                <option value="1month">1 Month</option>
                <option value="3months">3 Months</option>
                <option value="6months">6 Months</option>
                <option value="1year">1 Year</option>
              </select>
            </div>

            {/* Device Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fixture Type
              </label>
              <select
                value={selectedDevice}
                onChange={(e) => setSelectedDevice(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {devices.map(device => (
                  <option key={device} value={device}>
                    {device === 'all' ? 'All Fixtures' : device.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            </div>

            {/* Start Date Selector */}
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
          </div>
        </div>

        {/* Chart */}
        <div className="bg-white rounded-lg shadow-md p-6">
          {filteredData.length > 0 ? (
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={filteredData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date"
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                  />
                  <YAxis 
                    label={{ 
                      value: 'Volume (Litres)', 
                      angle: -90, 
                      position: 'insideLeft' 
                    }}
                  />
                  <Tooltip 
                    formatter={(value: number) => [`${value.toFixed(2)} L`, 'Water Usage']}
                    labelFormatter={(label) => `Date: ${label}`}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="volume"
                    name="Daily Water Usage"
                    stroke="#00A4CC"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-600">
              No data available for the selected period
            </div>
          )}
        </div>
      </main>
    </div>
  );
} 