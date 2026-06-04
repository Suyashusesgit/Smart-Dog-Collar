import React from 'react';
import { Thermometer, Flame, Heart, Droplet } from 'lucide-react';

export default function Dashboard({ vitals }) {
  const bpm = vitals?.bpm ?? 72;
  const spo2 = vitals?.spo2 ?? 98.5;
  const bodyTemp = vitals?.bodyTemp ?? 28.3;
  const ambientTemp = vitals?.ambientTemp ?? 29.6;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      
      {/* 1. Ambient Temp Card */}
      <div className="flex flex-col items-center justify-center rounded-xl bg-[#1b1936] border border-white/5 py-5 px-3 text-center transition-all hover:border-pink-500/20">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-pink-500/10 text-pink-500 mb-2">
          <Thermometer className="h-6 w-6" />
        </div>
        <span className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">Ambient Temp</span>
        <span className="text-3xl font-bold tracking-tight text-rose-500 mt-1">
          {ambientTemp > 0 ? ambientTemp.toFixed(1) : '--.-'}
        </span>
        <span className="text-[11px] text-slate-400 font-semibold uppercase mt-0.5">°C</span>
      </div>

      {/* 2. Object Temp Card */}
      <div className="flex flex-col items-center justify-center rounded-xl bg-[#1b1936] border border-white/5 py-5 px-3 text-center transition-all hover:border-orange-500/20">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-500/10 text-orange-500 mb-2">
          <Flame className="h-6 w-6" />
        </div>
        <span className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">Object Temp</span>
        <span className="text-3xl font-bold tracking-tight text-orange-500 mt-1">
          {bodyTemp > 0 ? bodyTemp.toFixed(1) : '--.-'}
        </span>
        <span className="text-[11px] text-slate-400 font-semibold uppercase mt-0.5">°C</span>
      </div>

      {/* 3. Pulse Card */}
      <div className="flex flex-col items-center justify-center rounded-xl bg-[#1b1936] border border-white/5 py-5 px-3 text-center transition-all hover:border-rose-500/20">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-500/10 text-rose-500 mb-2">
          <Heart className={`h-6 w-6 ${bpm > 0 ? 'animate-pulse' : ''}`} />
        </div>
        <span className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">Pulse</span>
        <span className="text-3xl font-bold tracking-tight text-emerald-400 mt-1">
          {bpm > 0 ? bpm : '--'}
        </span>
        <span className="text-[11px] text-slate-400 font-semibold uppercase mt-0.5">BPM</span>
      </div>

      {/* 4. SpO2 Card */}
      <div className="flex flex-col items-center justify-center rounded-xl bg-[#1b1936] border border-white/5 py-5 px-3 text-center transition-all hover:border-sky-500/20">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-500/10 text-sky-500 mb-2">
          <Droplet className="h-6 w-6" />
        </div>
        <span className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">SpO2</span>
        <span className="text-3xl font-bold tracking-tight text-emerald-400 mt-1">
          {spo2 > 0 ? spo2.toFixed(1) : '--.-'}
        </span>
        <span className="text-[11px] text-slate-400 font-semibold uppercase mt-0.5">%</span>
      </div>

    </div>
  );
}
