import React, { useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { LineChart, CalendarRange, Flame, HeartPulse, Droplet } from 'lucide-react';
import { motion } from 'framer-motion';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function Analytics({ telemetryContext }) {
  const { historicalData } = telemetryContext;
  const [timeframe, setTimeframe] = useState('realtime'); // 'realtime', 'day24h', 'week7d'

  // Fetch selected timeframe data
  const dataSrc = historicalData[timeframe] || historicalData.realtime;

  // Chart styling helper
  const createChartConfig = (label, dataPoints, borderColor, bgColor) => {
    return {
      labels: dataSrc.labels,
      datasets: [
        {
          label: label,
          data: dataPoints,
          borderColor: borderColor,
          backgroundColor: bgColor,
          borderWidth: 2,
          pointRadius: timeframe === 'realtime' ? 3 : 2,
          pointHoverRadius: 5,
          tension: 0.35,
          fill: true,
        }
      ]
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: '#11101e',
        titleColor: '#94a3b8',
        bodyColor: '#ffffff',
        borderColor: 'rgba(255,255,255,0.08)',
        borderWidth: 1,
        padding: 10,
        cornerRadius: 8,
        displayColors: false
      }
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(255,255,255,0.02)'
        },
        ticks: {
          color: '#94a3b8',
          font: { size: 9 },
          maxRotation: 0
        }
      },
      y: {
        grid: {
          color: 'rgba(255,255,255,0.04)'
        },
        ticks: {
          color: '#94a3b8',
          font: { size: 9 }
        }
      }
    }
  };

  // 1. Heart Rate dataset
  const bpmData = createChartConfig(
    'Heart Rate (BPM)',
    dataSrc.bpm,
    '#10b981', // Emerald
    'rgba(16, 185, 129, 0.05)'
  );

  // 2. SpO2 dataset
  const spo2Data = createChartConfig(
    'Oxygen (SpO2)',
    dataSrc.spo2,
    '#06b6d4', // Cyan
    'rgba(6, 182, 212, 0.05)'
  );

  // 3. Body Temperature dataset
  const tempData = createChartConfig(
    'Body Temp (°C)',
    dataSrc.temp,
    '#f43f5e', // Rose
    'rgba(244, 63, 94, 0.05)'
  );

  const timeframes = [
    { id: 'realtime', label: 'Real-Time' },
    { id: 'day24h', label: 'Last 24 Hours' },
    { id: 'week7d', label: 'Last 7 Days' }
  ];

  return (
    <div className="space-y-6">
      
      {/* Timeframe selector navbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#1b1936] border border-white/5 p-4 rounded-xl shadow-md">
        <div className="flex items-center gap-2.5">
          <LineChart className="h-5.5 w-5.5 text-indigo-400" />
          <h2 className="text-base font-bold text-white uppercase tracking-wider">Historical Vitals Analytics</h2>
        </div>

        <div className="flex items-center bg-[#0c0a1f]/60 p-1 rounded-lg border border-white/5 text-xs font-bold uppercase">
          {timeframes.map((tf) => (
            <button
              key={tf.id}
              onClick={() => setTimeframe(tf.id)}
              className={`px-3 py-1.5 rounded-md transition-all duration-200 ${
                timeframe === tf.id 
                  ? 'bg-indigo-600 text-white shadow-sm' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tf.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Trends Line Charts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* BPM Card Chart */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl bg-[#1b1936] border border-white/5 p-5 shadow-xl flex flex-col h-[320px]"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <HeartPulse className="h-4.5 w-4.5 text-emerald-400" />
              Heart Rate Trend
            </span>
            <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">BPM</span>
          </div>
          <div className="flex-grow relative h-full">
            <Line data={bpmData} options={chartOptions} />
          </div>
        </motion.div>

        {/* SpO2 Card Chart */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-xl bg-[#1b1936] border border-white/5 p-5 shadow-xl flex flex-col h-[320px]"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <Droplet className="h-4.5 w-4.5 text-cyan-400" />
              SpO2 Saturation Trend
            </span>
            <span className="text-[10px] text-cyan-400 font-bold bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">%</span>
          </div>
          <div className="flex-grow relative h-full">
            <Line data={spo2Data} options={chartOptions} />
          </div>
        </motion.div>

        {/* Core Body Temp Card Chart */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-xl bg-[#1b1936] border border-white/5 p-5 shadow-xl flex flex-col h-[320px]"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <Flame className="h-4.5 w-4.5 text-rose-500" />
              Core Body Temp Trend
            </span>
            <span className="text-[10px] text-rose-500 font-bold bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">°C</span>
          </div>
          <div className="flex-grow relative h-full">
            <Line data={tempData} options={chartOptions} />
          </div>
        </motion.div>

      </div>

      <div className="rounded-xl bg-[#1b1936]/40 border border-white/5 p-4 text-xs text-slate-400 uppercase font-semibold text-center">
        Data points are accumulated automatically via the Firebase connection stream during monitoring cycles.
      </div>
      
    </div>
  );
}
