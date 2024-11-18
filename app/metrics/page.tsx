'use client';

import { useState } from 'react';
import NavBar from "@/components/NavBar";
import Forecast from './forecast/page';
import CurrentUse from './current/page';
import Anomaly from './anomaly/page';

type MetricView = 'forecast' | 'current' | 'anomaly';

export default function Metrics() {
  const [activeView, setActiveView] = useState<MetricView>('forecast');

  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      
      <main className="max-w-7xl mx-auto px-8 py-16">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Metrics Dashboard</h1>

        {/* Metric Selection Buttons */}
        <div className="flex gap-4 mb-8 border-b border-gray-200">
          <button
            onClick={() => setActiveView('forecast')}
            className={`px-6 py-3 transition-colors relative ${
              activeView === 'forecast'
                ? 'text-primary font-semibold after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-primary'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Forecast
          </button>
          <button
            onClick={() => setActiveView('current')}
            className={`px-6 py-3 transition-colors relative ${
              activeView === 'current'
                ? 'text-primary font-semibold after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-primary'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Current Use
          </button>
          <button
            onClick={() => setActiveView('anomaly')}
            className={`px-6 py-3 transition-colors relative ${
              activeView === 'anomaly'
                ? 'text-primary font-semibold after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-primary'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Anomaly
          </button>
        </div>

        {/* Content Area */}
        <div>
          {activeView === 'forecast' && (
            <div className="content-wrapper">
              <Forecast hideNav={true} />
            </div>
          )}
          {activeView === 'current' && (
            <div className="content-wrapper">
              <CurrentUse hideNav={true} />
            </div>
          )}
          {activeView === 'anomaly' && (
            <div className="content-wrapper">
              <Anomaly hideNav={true} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
} 