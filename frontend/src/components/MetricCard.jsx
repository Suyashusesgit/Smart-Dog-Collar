import React from 'react';
import { motion } from 'framer-motion';

export default function MetricCard({ label, value, unit, icon: Icon, status, themeColor = 'slate', timestamp }) {
  
  // Theme color definitions matching veterinary/tactical schema
  const colorMap = {
    emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20 shadow-emerald-950/20',
    cyan: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20 shadow-cyan-950/20',
    rose: 'text-rose-500 bg-rose-500/10 border-rose-500/20 shadow-rose-950/20',
    orange: 'text-orange-500 bg-orange-500/10 border-orange-500/20 shadow-orange-950/20',
    slate: 'text-slate-400 bg-slate-500/10 border-slate-500/20 shadow-slate-950/20'
  };

  const statusBorderMap = {
    Normal: 'border-emerald-500/30',
    Warning: 'border-amber-500/30',
    Critical: 'border-rose-500/40 bg-rose-950/20 animate-pulse-slow'
  };

  const statusBadgeMap = {
    Normal: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    Warning: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
    Critical: 'bg-rose-500/10 text-rose-400 border border-rose-500/20 animate-pulse'
  };

  const activeThemeClass = colorMap[themeColor] || colorMap.slate;
  const statusBorderClass = statusBorderMap[status] || 'border-white/5';
  const statusBadgeClass = statusBadgeMap[status] || 'bg-slate-500/10 text-slate-400 border border-slate-500/20';

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 100, damping: 15 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={`relative flex flex-col justify-between rounded-xl bg-[#1b1936] border p-5 shadow-xl transition-all duration-300 ${statusBorderClass}`}
    >
      {/* Top row: Icon and status badge */}
      <div className="flex items-center justify-between mb-4">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl transition-colors ${
          status === 'Critical' ? 'bg-rose-500/20 text-rose-500' : activeThemeClass
        }`}>
          <Icon className={`h-5.5 w-5.5 ${status === 'Critical' && label === 'Heart Rate' ? 'animate-pulse text-rose-500' : ''}`} />
        </div>
        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${statusBadgeClass}`}>
          {status}
        </span>
      </div>

      {/* Middle row: Label and value */}
      <div className="text-left mt-2">
        <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
          {label}
        </span>
        <div className="flex items-baseline gap-1 mt-1">
          <span className={`text-4.5xl font-extrabold tracking-tight transition-colors ${
            status === 'Critical' ? 'text-rose-500' : 'text-white'
          }`}>
            {typeof value === 'number' ? value.toFixed(1).replace('.0', '') : value}
          </span>
          <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider ml-1">
            {unit}
          </span>
        </div>
      </div>

      {/* Bottom row: Last update timestamp */}
      <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[9px] text-slate-500 font-semibold uppercase tracking-wider">
        <span>Updates Live</span>
        <span>{timestamp ? `Last: ${timestamp}` : 'Syncing...'}</span>
      </div>
    </motion.div>
  );
}
