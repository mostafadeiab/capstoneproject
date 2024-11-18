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
  ResponsiveContainer
} from 'recharts';
import forecastData from '@/data/Forecast.csv';

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
  const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRange>('1week');
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

  const aggregateDataByDay = (data: ForecastData[]) => {
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
      const results = parse<CSVRowData>(forecastData, {
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

    const total = filtered.reduce((sum, item) => sum + item.volume, 0);
    setTotalUsage(Number(total.toFixed(2)));

    const aggregatedData = aggregateDataByDay(filtered);
    setFilteredData(aggregatedData);
  }, [data, selectedDevice, selectedTimeRange, startDate]);

  return (
    <div>
      <div className="space-y-8">
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

        {/* Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Fixture</label>
            <select
              value={selectedDevice}
              onChange={(e) => setSelectedDevice(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2"
            >
              {devices.map(device => (
                <option key={device} value={device}>
                  {device === 'all' ? 'All Fixtures' : device.replace(/_/g, ' ')}
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
              <option value="1week">Next 7 Days</option>
              <option value="1month">Next 30 Days</option>
              <option value="3months">Next 3 Months</option>
              <option value="6months">Next 6 Months</option>
              <option value="1year">Next 12 Months</option>
            </select>
          </div>
        </div>

        {/* Chart */}
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
  );
} 