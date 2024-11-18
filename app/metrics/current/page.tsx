'use client';

import { useState, useEffect } from 'react';
import { parse } from 'papaparse';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
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

  // Add colors for the pie chart
  const COLORS = [
    '#00A4CC', // Primary blue
    '#4DB6AC', // Teal
    '#81C784', // Green
    '#FFB74D', // Orange
    '#FF8A65', // Coral
    '#BA68C8', // Purple
    '#4FC3F7', // Light blue
    '#9575CD'  // Purple-blue
  ];

  // Add function to calculate individual fixture totals
  const calculateFixtureTotals = () => {
    if (!data.length) return {};
    
    return devices
      .filter(device => device !== 'all')
      .reduce((acc: { [key: string]: number }, device) => {
        let filtered = [...data];

        if (viewMode === 'all-time') {
          const startDateTime = new Date();
          const now = new Date();

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
            return (selectedDevice === 'all' || item.device === selectedDevice) && 
                   item.device === device && 
                   itemDate >= startDateTime && 
                   itemDate <= now;
          });
        } else {
          const billingStart = new Date(startDate);
          const billingEnd = new Date(endDate);
          
          filtered = filtered.filter(item => {
            const itemDate = new Date(item.timestamp);
            return (selectedDevice === 'all' || item.device === selectedDevice) && 
                   item.device === device && 
                   itemDate >= billingStart && 
                   itemDate <= billingEnd;
          });
        }
        
        acc[device] = Number(filtered.reduce((sum, item) => sum + item.volume, 0).toFixed(2));
        return acc;
      }, {});
  };

  const fixtureTotals = calculateFixtureTotals();

  // Add fixture mapping
  const fixtureDetails = {
    'bathroom_sink': { name: 'Bathroom Sink', location: 'Master Bedroom' },
    'bathroom_sink_2': { name: 'Bathroom Sink', location: 'Powder Room' },
    'toilet': { name: 'Toilet', location: 'Master Bedroom' },
    'toilet_2': { name: 'Toilet', location: 'Powder Room' },
    'shower': { name: 'Shower', location: 'Master Bedroom' },
    'kitchen_sink': { name: 'Kitchen Sink', location: 'Kitchen' },
    'dishwasher': { name: 'Dishwasher', location: 'Kitchen' },
    'washing_machine': { name: 'Washing Machine', location: 'Basement' }
  };

  // Update the pieChartData preparation
  const pieChartData = Object.entries(fixtureTotals).map(([device, volume], index) => ({
    name: `${fixtureDetails[device as keyof typeof fixtureDetails].name} (${fixtureDetails[device as keyof typeof fixtureDetails].location})`,
    value: volume,
    color: COLORS[index % COLORS.length]
  }));

  return (
    <div>
      <div className="space-y-8">
        {/* Controls at the top with gradient background */}
        <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl p-6 shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">View Mode</label>
              <select
                value={viewMode}
                onChange={(e) => setViewMode(e.target.value as 'all-time' | 'billing-period')}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 bg-white/80 backdrop-blur-sm"
              >
                <option value="all-time">All Time</option>
                <option value="billing-period">Billing Period</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Fixture</label>
              <select
                value={selectedDevice}
                onChange={(e) => setSelectedDevice(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 bg-white/80 backdrop-blur-sm"
              >
                <option value="all">All Fixtures</option>
                {devices.filter(device => device !== 'all').map(device => (
                  <option key={device} value={device}>
                    {device.replace('_', ' ')}
                  </option>
                ))}
              </select>
            </div>

            {viewMode === 'all-time' ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Time Period</label>
                <select
                  value={selectedTimeRange}
                  onChange={(e) => setSelectedTimeRange(e.target.value as TimeRange)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 bg-white/80 backdrop-blur-sm"
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    min={earliestDate}
                    max={endDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 bg-white/80 backdrop-blur-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    min={startDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 bg-white/80 backdrop-blur-sm"
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Total Usage Card with gradient */}
        <div className="bg-gradient-to-br from-primary/20 via-accent/20 to-primary/20 rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">Total Water Usage</h2>
              <p className="text-gray-600">
                {viewMode === 'all-time' 
                  ? `Last ${selectedTimeRange.replace(/\d+/, match => match + ' ')}`
                  : 'Selected billing period'}
              </p>
              <p className="text-sm text-gray-500 mt-1">Data for a 3-person household</p>
            </div>
            <div className="text-right">
              <p className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
                {totalUsage} L
              </p>
              <p className="text-sm text-gray-600">
                {selectedDevice === 'all' ? 'All fixtures' : selectedDevice.replace(/_/g, ' ')}
              </p>
            </div>
          </div>
        </div>

        {/* Usage Overview Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Pie Chart with gradient background */}
          <div className="bg-gradient-to-br from-white via-gray-50 to-gray-100 rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Usage Distribution</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => `${value.toFixed(2)} L`}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {pieChartData.map((entry, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-sm text-gray-600">{entry.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Individual Fixture Cards with gradient backgrounds */}
          <div className="grid grid-cols-2 gap-4 content-start">
            {Object.entries(fixtureTotals).map(([deviceId, volume], index) => {
              const details = fixtureDetails[deviceId as keyof typeof fixtureDetails];
              return (
                <div 
                  key={deviceId} 
                  className="bg-gradient-to-br from-white via-gray-50 to-gray-100 rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow"
                >
                  <h3 className="font-semibold text-gray-800">{details.name}</h3>
                  <p className="text-sm text-gray-500 mb-2">{details.location}</p>
                  <p className="text-xl font-bold" style={{ color: COLORS[index % COLORS.length] }}>
                    {volume.toFixed(1)} L
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Line Chart with gradient background */}
        <div className="bg-gradient-to-br from-white via-gray-50 to-gray-100 rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Usage Trend</h3>
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
        </div>
      </div>
    </div>
  );
} 