import React from 'react';
import { AlertTriangle, ShieldCheck, HeartPulse, Droplet, Flame, Trash2, BellRing } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Alerts({ telemetryContext }) {
  const {
    telemetry,
    alerts,
    clearAlertHistory,
    classifyBpm,
    classifySpo2,
    classifyTemp
  } = telemetryContext;

  const bpmStatus = classifyBpm(telemetry.bpm);
  const spo2Status = classifySpo2(telemetry.spo2);
  const tempStatus = classifyTemp(telemetry.bodyTemp);

  const getStatusColor = (status) => {
    if (status === 'Critical') return 'border-rose-500 bg-rose-950/20 text-rose-400';
    if (status === 'Warning') return 'border-amber-500 bg-amber-950/15 text-amber-400';
    return 'border-emerald-500 bg-emerald-950/10 text-emerald-400';
  };

  return (
    <div className="space-y-6">
      
      {/* Rules guides grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Heart Rate threshold status */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-xl border p-5 shadow-xl flex flex-col justify-between ${getStatusColor(bpmStatus)}`}
        >
          <div className="flex justify-between items-center">
            <span className="text-xs font-extrabold uppercase tracking-widest flex items-center gap-1.5">
              <HeartPulse className="h-4.5 w-4.5" />
              Pulse Rules
            </span>
            <span className="text-[10px] font-extrabold uppercase">{bpmStatus}</span>
          </div>
          <div className="my-4">
            <p className="text-3xl font-extrabold text-white">{telemetry.bpm} <span className="text-xs text-slate-400 font-semibold uppercase">BPM</span></p>
          </div>
          <div className="text-[10px] text-slate-400 uppercase font-semibold space-y-1">
            <p className="text-emerald-400">Normal: 60 - 120</p>
            <p className="text-amber-400">Warning: 121 - 140</p>
            <p className="text-rose-400">Critical: &gt; 140</p>
          </div>
        </motion.div>

        {/* SpO2 Threshold Status */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`rounded-xl border p-5 shadow-xl flex flex-col justify-between ${getStatusColor(spo2Status)}`}
        >
          <div className="flex justify-between items-center">
            <span className="text-xs font-extrabold uppercase tracking-widest flex items-center gap-1.5">
              <Droplet className="h-4.5 w-4.5" />
              Oxygen Rules
            </span>
            <span className="text-[10px] font-extrabold uppercase">{spo2Status}</span>
          </div>
          <div className="my-4">
            <p className="text-3xl font-extrabold text-white">{telemetry.spo2}%</p>
          </div>
          <div className="text-[10px] text-slate-400 uppercase font-semibold space-y-1">
            <p className="text-emerald-400">Normal: &ge; 95%</p>
            <p className="text-amber-400">Warning: 90% - 94%</p>
            <p className="text-rose-400">Critical: &lt; 90%</p>
          </div>
        </motion.div>

        {/* Body Temperature Threshold Status */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`rounded-xl border p-5 shadow-xl flex flex-col justify-between ${getStatusColor(tempStatus)}`}
        >
          <div className="flex justify-between items-center">
            <span className="text-xs font-extrabold uppercase tracking-widest flex items-center gap-1.5">
              <Flame className="h-4.5 w-4.5" />
              Temperature Rules
            </span>
            <span className="text-[10px] font-extrabold uppercase">{tempStatus}</span>
          </div>
          <div className="my-4">
            <p className="text-3xl font-extrabold text-white">{telemetry.bodyTemp.toFixed(1)}°C</p>
          </div>
          <div className="text-[10px] text-slate-400 uppercase font-semibold space-y-1">
            <p className="text-emerald-400">Normal: 37 - 39°C</p>
            <p className="text-amber-400">Warning: 39 - 40°C</p>
            <p className="text-rose-400">Critical: &gt; 40°C</p>
          </div>
        </motion.div>

      </div>

      {/* Alert logs layout */}
      <div className="rounded-xl bg-[#1b1936] border border-white/5 p-5 shadow-xl flex flex-col text-left">
        <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
          <div className="flex items-center gap-2">
            <BellRing className="h-5.5 w-5.5 text-rose-500 animate-pulse" />
            <h3 className="text-base font-bold text-white uppercase tracking-wider">Historical Incident logs</h3>
          </div>
          {alerts.length > 0 && (
            <button
              onClick={clearAlertHistory}
              className="flex items-center gap-2 px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-lg text-xs font-bold uppercase transition-all"
            >
              <Trash2 className="h-4 w-4" />
              Clear logs
            </button>
          )}
        </div>

        {alerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-3">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <p className="text-sm font-semibold text-slate-300">All Systems Nominal</p>
            <p className="text-xs text-slate-400 mt-0.5">No critical threshold breaches have been recorded for Zeus.</p>
          </div>
        ) : (
          <div className="space-y-3.5 max-h-[360px] overflow-y-auto pr-2 scrollbar-thin">
            {alerts.map((alert) => (
              <div 
                key={alert.id} 
                className="flex items-start gap-4 p-3 bg-rose-500/5 hover:bg-rose-500/10 border border-rose-500/15 rounded-xl transition-all"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
                  <AlertTriangle className="h-4.5 w-4.5" />
                </div>
                <div className="flex-grow">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-rose-300">{alert.event}</h4>
                    <span className="text-[9px] text-slate-500 font-bold tracking-wider uppercase">{alert.time}</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1 uppercase font-semibold">Incident status: Dispatched SMS to Handler</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
