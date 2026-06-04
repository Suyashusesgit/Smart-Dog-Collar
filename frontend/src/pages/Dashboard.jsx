import React from 'react';
import { motion } from 'framer-motion';
import { Thermometer, Flame, HeartPulse, Droplet, Clock, ShieldCheck, MapPin, Activity, CalendarDays } from 'lucide-react';
import MetricCard from '../components/MetricCard';
import ProfileCard from '../components/ProfileCard';
import MapComponent from '../maps/MapComponent';

export default function Dashboard({ telemetryContext }) {
  const {
    telemetry,
    stats,
    timeline,
    overallStatus,
    classifyBpm,
    classifySpo2,
    classifyTemp
  } = telemetryContext;

  const { bpm, spo2, bodyTemp, ambientTemp, lat, lng, timestamp } = telemetry;

  // Format dynamic time
  const timeString = new Date(timestamp).toLocaleTimeString();

  // Rules Classification states
  const bpmStatus = classifyBpm(bpm);
  const spo2Status = classifySpo2(spo2);
  const tempStatus = classifyTemp(bodyTemp);

  // Status Banner colors
  const bannerColors = {
    Normal: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
    Warning: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
    Critical: 'bg-rose-500/15 border-rose-500/40 text-rose-500 animate-pulse'
  };

  const activeBannerClass = bannerColors[overallStatus] || bannerColors.Normal;

  return (
    <div className="space-y-6">
      
      {/* 1. Large Rules-Engine Status Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`w-full p-4 rounded-xl border flex flex-col sm:flex-row items-center justify-between gap-4 backdrop-blur-md shadow-md ${activeBannerClass}`}
      >
        <div className="flex items-center gap-3">
          <div className={`h-11 w-11 rounded-lg flex items-center justify-center font-bold text-lg border ${
            overallStatus === 'Normal' ? 'bg-emerald-500/10 border-emerald-500/20' : 
            overallStatus === 'Warning' ? 'bg-amber-500/10 border-amber-500/20' :
            'bg-rose-500/10 border-rose-500/20'
          }`}>
            {overallStatus.charAt(0)}
          </div>
          <div>
            <h3 className="text-sm font-extrabold uppercase tracking-widest">
              Subject Operative Status: {overallStatus}
            </h3>
            <p className="text-xs opacity-80 mt-0.5 font-medium">
              {overallStatus === 'Normal' ? 'All physiological telemetry streams nominal.' : 
               overallStatus === 'Warning' ? 'Minor physiological vital fluctuations detected. Monitor closely.' :
               'CRITICAL EXERTION ALERT! Vital thresholds breached. Emergency dispatch recommended.'}
            </p>
          </div>
        </div>

        <div className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 opacity-80 bg-slate-900/40 px-3 py-1.5 rounded-lg border border-white/5">
          <Clock className="h-4 w-4" />
          <span>Last Sync: {timeString}</span>
        </div>
      </motion.div>

      {/* 2. Biometric Metrics Grid (4 Cards) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Heart Rate"
          value={bpm}
          unit="BPM"
          icon={HeartPulse}
          status={bpmStatus}
          themeColor="emerald"
          timestamp={timeString}
        />
        <MetricCard
          label="SpO2 Level"
          value={spo2}
          unit="%"
          icon={Droplet}
          status={spo2Status}
          themeColor="cyan"
          timestamp={timeString}
        />
        <MetricCard
          label="Core Body Temp"
          value={bodyTemp}
          unit="°C"
          icon={Flame}
          status={tempStatus}
          themeColor="rose"
          timestamp={timeString}
        />
        <MetricCard
          label="Ambient Temp"
          value={ambientTemp}
          unit="°C"
          icon={Thermometer}
          status="Normal"
          themeColor="orange"
          timestamp={timeString}
        />
      </div>

      {/* 3. Map View Section */}
      <div className="w-full">
        <MapComponent lat={lat} lng={lng} timestamp={timeString} alertStatus={overallStatus === 'Critical'} />
      </div>

      {/* 4. Details Row: Profile, Stats, Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: MWD Operative Profile */}
        <div className="lg:col-span-1">
          <ProfileCard alertStatus={overallStatus === 'Critical'} />
        </div>

        {/* Center: Dashboard Statistics */}
        <div className="lg:col-span-1 rounded-xl bg-[#1b1936] border border-white/5 p-5 shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <Activity className="h-5 w-5 text-indigo-400" />
              Monitoring Statistics
            </h3>
            
            <div className="space-y-4">
              <div className="flex justify-between border-b border-white/5 pb-2 text-xs">
                <span className="text-slate-400">Total Monitored Hours</span>
                <span className="font-bold text-white">{stats.totalHours.toFixed(1)} Hours</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2 text-xs">
                <span className="text-slate-400">Average Heart Rate</span>
                <span className="font-bold text-emerald-400">{stats.avgBpm} BPM</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2 text-xs">
                <span className="text-slate-400">Average Oxygen (SpO2)</span>
                <span className="font-bold text-cyan-400">{stats.avgSpo2}%</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2 text-xs">
                <span className="text-slate-400">Average Core Temp</span>
                <span className="font-bold text-rose-400">{stats.avgTemp.toFixed(1)}°C</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Last GPS Coordinate</span>
                <span className="font-bold text-white text-[10px] font-mono">
                  {lat.toFixed(4)}, {lng.toFixed(4)}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-white/5 text-[10px] text-slate-400 uppercase font-semibold flex justify-between items-center">
            <span>Tracking Agent: Active</span>
            <ShieldCheck className="h-4.5 w-4.5 text-emerald-400" />
          </div>
        </div>

        {/* Right: Activity Timeline */}
        <div className="lg:col-span-1 rounded-xl bg-[#1b1936] border border-white/5 p-5 shadow-xl flex flex-col h-full">
          <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-indigo-400" />
            Activity Timeline
          </h3>
          
          <div className="space-y-3 flex-grow overflow-y-auto max-h-[220px] pr-1 scrollbar-thin">
            {timeline.map((event) => (
              <div key={event.id} className="flex gap-3 text-left">
                <div className="relative flex flex-col items-center">
                  <div className={`h-2.5 w-2.5 rounded-full ${
                    event.type === 'alert' ? 'bg-rose-500 animate-ping' : 
                    event.type === 'location' ? 'bg-indigo-400' :
                    event.type === 'health' ? 'bg-emerald-400' : 'bg-slate-500'
                  }`} />
                  <div className="w-0.5 bg-white/5 flex-grow mt-1" />
                </div>
                <div className="flex-grow">
                  <p className="text-[11px] font-bold text-slate-200">{event.event}</p>
                  <span className="text-[9px] text-slate-400 font-semibold">{event.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
