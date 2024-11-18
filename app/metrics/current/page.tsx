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
import currentData from '@/data/Current.csv';

type UsageData = {
  timestamp: string;
  device: string;
  volume: number;
};

type AggregatedData = {
  date: string;
  volume: number;
};

type ViewMode = 'all-time' | 'billing-period';
type TimeRange = 'today' | '1week' | '1month' | '3months' | '6months' | '1year';

// Define type for CSV row data
type CSVRowData = {
  Timestamp: string;
  'Device Name': string;
  'Volume Used (L)': string;
  [key: string]: string;
};

export default function CurrentUse() {
  const [data, setData] = useState<UsageData[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('all-time');
  const [selectedDevice, setSelectedDevice] = useState<string>('all');
  const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRange>('today');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [filteredData, setFilteredData] = useState<AggregatedData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [earliestDate, setEarliestDate] = useState<string>('');
  const [totalUsage, setTotalUsage] = useState<number>(0);

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

  const timeRanges = [
    { value: 'today', label: 'Today' },
    { value: '1week', label: 'Last 7 Days' },
    { value: '1month', label: 'Last 30 Days' },
    { value: '3months', label: 'Last 3 Months' },
    { value: '6months', label: 'Last 6 Months' },
    { value: '1year', label: 'Last 12 Months' }
  ];

  const aggregateDataByDay = (data: UsageData[]) => {
    const aggregated = data.reduce((acc: { [key: string]: number }, curr) => {
      const date = curr.timestamp.split(' ')[0];
      acc[date] = (acc[date] || 0) + curr.volume;
      return acc;
    }, {});

    return Object.entries(aggregated).map(([date, volume]) => ({
      date,
      volume: Number(volume.toFixed(2))
    })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  const loadData = async () => {
    setIsLoading(true);
    try {
      const results = parse<CSVRowData>(currentData, {
        header: true,
        skipEmptyLines: true,
      });

      const formattedData = results.data.map((row: CSVRowData) => ({
        timestamp: row.Timestamp,
        device: row['Device Name'],
        volume: parseFloat(row['Volume Used (L)'])
      }));

      setData(formattedData);
      
      if (formattedData.length > 0) {
        const dates = formattedData.map(d => new Date(d.timestamp.split(' ')[0]));
        const earliest = new Date(Math.min(...dates.map(d => d.getTime())));
        setEarliestDate(earliest.toISOString().split('T')[0]);
        setStartDate(earliest.toISOString().split('T')[0]);
        setEndDate(new Date().toISOString().split('T')[0]);
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
    if (!data.length) return;

    let filtered = [...data];
    const now = new Date();

    if (viewMode === 'all-time') {
      const startDateTime = new Date();

      switch (selectedTimeRange) {
        case 'today':
          startDateTime.setHours(0, 0, 0, 0);
          break;
        case '1week':
          startDateTime.setDate(startDateTime.getDate() - 7);
          break;
        case '1month':
          startDateTime.setMonth(startDateTime.getMonth() - 1);
          break;
        case '3months':
          startDateTime.setMonth(startDateTime.getMonth() - 3);
          break;
        case '6months':
          startDateTime.setMonth(startDateTime.getMonth() - 6);
          break;
        case '1year':
          startDateTime.setFullYear(startDateTime.getFullYear() - 1);
          break;
      }

      filtered = filtered.filter(item => {
        const itemDate = new Date(item.timestamp);
        return itemDate >= startDateTime && itemDate <= now;
      });
    } else {
      // Billing period mode
      const billingStart = new Date(startDate);
      const billingEnd = new Date(endDate);
      
      filtered = filtered.filter(item => {
        const itemDate = new Date(item.timestamp);
        return itemDate >= billingStart && itemDate <= billingEnd;
      });
    }

    if (selectedDevice !== 'all') {
      filtered = filtered.filter(item => item.device === selectedDevice);
    }

    const total = filtered.reduce((sum, item) => sum + item.volume, 0);
    setTotalUsage(Number(total.toFixed(2)));

    const aggregatedData = aggregateDataByDay(filtered);
    setFilteredData(aggregatedData);
  }, [data, viewMode, selectedDevice, selectedTimeRange, startDate, endDate]);

  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      
      <main className="max-w-7xl mx-auto px-8 py-16">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Current Water Usage</h1>
          <p className="text-gray-600 mt-2">Data for a 3-person household</p>
        </div>
        
        {/* Total Usage Display */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">Total Water Usage</h2>
              <p className="text-gray-600">
                {viewMode === 'all-time' 
                  ? `Last ${selectedTimeRange.replace(/\d+/, match => match + ' ')}`
                  : 'Selected billing period'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-primary">{totalUsage} L</p>
              <p className="text-sm text-gray-600">
                {selectedDevice === 'all' ? 'All fixtures' : selectedDevice.replace(/_/g, ' ')}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* View Mode Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                View Mode
              </label>
              <select
                value={viewMode}
                onChange={(e) => setViewMode(e.target.value as ViewMode)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all-time">All Time</option>
                <option value="billing-period">Billing Period</option>
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

            {viewMode === 'all-time' ? (
              /* Time Range Selector for All Time */
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Time Period
                </label>
                <select
                  value={selectedTimeRange}
                  onChange={(e) => setSelectedTimeRange(e.target.value as TimeRange)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {timeRanges.map(range => (
                    <option key={range.value} value={range.value}>
                      {range.label}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <>
                {/* Date Range Selectors for Billing Period */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    min={earliestDate}
                    max={endDate}
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
                    max={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Chart */}
        <div className="bg-white rounded-lg shadow-md p-6">
          {isLoading ? (
            <div className="flex justify-center items-center h-[400px]">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
          ) : filteredData.length > 0 ? (
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