import React from 'react';
import { ShieldAlert, BellRing } from 'lucide-react';

export default function AlertBanner({ alertStatus, vitals }) {
  if (!alertStatus) return null;

  const triggers = [];
  if (vitals?.spo2 && vitals.spo2 < 90) {
    triggers.push(`SpO2 levels dropped to ${vitals.spo2.toFixed(1)}%`);
  }
  if (vitals?.bodyTemp && vitals.bodyTemp > 39.5) {
    triggers.push(`Core Body Temp is critical at ${vitals.bodyTemp.toFixed(1)}°C`);
  }

  return (
    <div className="relative overflow-hidden w-full mb-6 rounded-2xl border border-rose-500/30 bg-rose-950/40 p-4 backdrop-blur-md shadow-lg shadow-rose-950/20 animate-pulse-slow">
      {/* Glow highlight */}
      <div className="absolute top-0 right-0 h-full w-1/3 bg-gradient-to-l from-rose-500/10 to-transparent pointer-events-none" />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/40 shadow-inner shadow-rose-500/20">
            <ShieldAlert className="h-6 w-6 animate-bounce" />
          </div>
          <div>
            <h3 className="text-lg font-bold tracking-wide text-rose-200 flex items-center gap-2">
              TACTICAL MEDICAL WARNING
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
              </span>
            </h3>
            <p className="mt-0.5 text-sm text-rose-300 font-medium">
              {triggers.length > 0
                ? triggers.join(' & ')
                : 'Anomalous operational biometric levels detected on Zeus.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold uppercase tracking-wider">
          <BellRing className="h-4 w-4 animate-spin" />
          SMS Dispatched to MWD Handler Team
        </div>
      </div>
    </div>
  );
}
