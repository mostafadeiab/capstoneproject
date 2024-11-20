'use client';

import { useState, useEffect } from 'react';
import { parse } from 'papaparse';
import {
  BarChart,
  Bar,
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

type ForecastData = {
  timestamp: string;
  device: string;
  volume: number;
};

type AggregatedData = {
  date: string;
  volume: number;
};

type TimeRange = '24hours' | '48hours' | '72hours';

// Define type for CSV row data
type CSVRowData = {
  Timestamp: string;
  'Device Name': string;
  'Volume Used (L)': string;
  [key: string]: string;
};

export default function Forecast() {
  const [data, setData] = useState<ForecastData[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string>('all');
  const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRange>('24hours');
  const [startDate, setStartDate] = useState<string>('');
  const [filteredData, setFilteredData] = useState<AggregatedData[]>([]);
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

  const aggregateDataByHour = (data: ForecastData[]) => {
    const aggregated = data.reduce((acc: { [key: string]: number }, curr) => {
      const date = new Date(curr.timestamp);
      const hourKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:00`;
      acc[hourKey] = (acc[hourKey] || 0) + curr.volume;
      return acc;
    }, {});

    return Object.entries(aggregated).map(([date, volume]) => ({
      date,
      volume: Number(volume.toFixed(2))
    })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  const loadData = async () => {
    try {
      const response = await fetch('/Forecast.csv');
      const csvText = await response.text();

      const results = parse<CSVRowData>(csvText, {
        header: true,
        skipEmptyLines: true,
      });

      const formattedData = results.data.map((row: CSVRowData) => ({
        timestamp: row.Timestamp,
        device: row['Device Name'],
        volume: parseFloat(row['Volume Used (L)'])
      }));

      setData(formattedData);
      
      if (formattedData.length > 0 && formattedData[0].timestamp) {
        const dateStr = formattedData[0].timestamp.split(' ')[0];
        setStartDate(dateStr);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (!data.length || !startDate) return;

    const startDateTime = new Date(startDate);
    const endDateTime = new Date(startDate);

    switch (selectedTimeRange) {
      case '24hours':
        endDateTime.setHours(endDateTime.getHours() + 24);
        break;
      case '48hours':
        endDateTime.setHours(endDateTime.getHours() + 48);
        break;
      case '72hours':
        endDateTime.setHours(endDateTime.getHours() + 72);
        break;
    }

    let filtered = data.filter(item => {
      const itemDate = new Date(item.timestamp);
      return itemDate >= startDateTime && itemDate <= endDateTime;
    });

    if (selectedDevice !== 'all') {
      filtered = filtered.filter(item => item.device === selectedDevice);
    }

    const total = filtered.reduce((sum, item) => sum + item.volume, 0);
    setTotalUsage(Number(total.toFixed(2)));

    const aggregatedData = aggregateDataByHour(filtered);
    setFilteredData(aggregatedData);
  }, [data, selectedDevice, selectedTimeRange, startDate]);

  // Modify the calculateFixtureTotals function
  const calculateFixtureTotals = () => {
    if (!data.length) return {};
    
    return devices
      .filter(device => device !== 'all')
      .reduce((acc: { [key: string]: number }, device) => {
        const filteredData = data.filter(item => {
          const itemDate = new Date(item.timestamp);
          const startDateTime = new Date(startDate);
          const endDateTime = new Date(startDate);
          
          switch (selectedTimeRange) {
            case '24hours':
              endDateTime.setHours(endDateTime.getHours() + 24);
              break;
            case '48hours':
              endDateTime.setHours(endDateTime.getHours() + 48);
              break;
            case '72hours':
              endDateTime.setHours(endDateTime.getHours() + 72);
              break;
          }
          
          // Only include data for the selected device or all devices
          return (selectedDevice === 'all' || item.device === selectedDevice) && 
                 item.device === device && 
                 itemDate >= startDateTime && 
                 itemDate <= endDateTime;
        });
        
        acc[device] = Number(filteredData.reduce((sum, item) => sum + item.volume, 0).toFixed(2));
        return acc;
      }, {});
  };

  const fixtureTotals = calculateFixtureTotals();

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

  // Prepare data for pie chart
  const pieChartData = Object.entries(fixtureTotals).map(([device, volume], index) => ({
    name: `${fixtureDetails[device as keyof typeof fixtureDetails].name} (${fixtureDetails[device as keyof typeof fixtureDetails].location})`,
    value: volume,
    color: COLORS[index % COLORS.length]
  }));

  return (
    <div>
      <div className="space-y-8">
        {/* Controls at the top */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Fixture</label>
            <select
              value={selectedDevice}
              onChange={(e) => setSelectedDevice(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2"
            >
              <option value="all">All Fixtures</option>
              {devices.filter(device => device !== 'all').map(device => (
                <option key={device} value={device}>
                  {device.charAt(0).toUpperCase() + device.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Time Period</label>
            <select
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value as TimeRange)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2"
            >
              <option value="24hours">Next 24 Hours</option>
              <option value="48hours">Next 48 Hours</option>
              <option value="72hours">Next 72 Hours</option>
            </select>
          </div>
        </div>

        {/* Usage Overview Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Pie Chart */}
          <div className="bg-white rounded-lg shadow-md p-6">
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

          {/* Individual Fixture Cards */}
          <div className="grid grid-cols-2 gap-4 content-start">
            {Object.entries(fixtureTotals).map(([deviceId, volume], index) => {
              const details = fixtureDetails[deviceId as keyof typeof fixtureDetails];
              return (
                <div key={deviceId} className="bg-white rounded-lg shadow p-4">
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

        {/* Total Usage Card */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">Total Forecasted Usage</h2>
              <p className="text-gray-600">Next {selectedTimeRange.replace(/\d+/, match => match + ' ')}</p>
              <p className="text-sm text-gray-500 mt-1">Data for a 3-person household</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-primary">{totalUsage} L</p>
              <p className="text-sm text-gray-600">
                {selectedDevice === 'all' ? 'All fixtures' : selectedDevice.replace(/_/g, ' ')}
              </p>
            </div>
          </div>
        </div>

        {/* Bar Chart */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Usage Trend</h3>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={filteredData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  interval={0}
                  tickFormatter={(value) => value.split(' ')[1]} // Only show time
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
                  labelFormatter={(label) => `Time: ${label}`}
                />
                <Legend />
                <Bar
                  dataKey="volume"
                  name="Hourly Water Usage"
                  fill="#00A4CC"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
} 