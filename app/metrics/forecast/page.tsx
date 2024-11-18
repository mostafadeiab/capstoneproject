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
  const [isLoading, setIsLoading] = useState(false);
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
    setIsLoading(true);
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

  const handleClearData = () => {
    setFilteredData([]);
  };

  return (
    <div>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Total Forecasted Usage</h2>
            <p className="text-gray-600">Next {selectedTimeRange.replace(/\d+/, match => match + ' ')}</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-primary">{totalUsage} L</p>
            <p className="text-sm text-gray-600">
              {selectedDevice === 'all' ? 'All fixtures' : selectedDevice.replace(/_/g, ' ')}
            </p>
          </div>
        </div>

        {/* Rest of your component content without the NavBar and main wrapper */}
      </div>
    </div>
  );
} 