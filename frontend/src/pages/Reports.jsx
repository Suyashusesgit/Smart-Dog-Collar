import React from 'react';
import { FileText, Download, ShieldCheck, CalendarRange, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { generatePDFReport } from '../utils/pdfGenerator';

export default function Reports({ telemetryContext }) {
  const { petInfo, stats, alerts } = telemetryContext;

  const handleDownload = (type) => {
    // Invoke PDF report compiler
    generatePDFReport(type, petInfo, stats, alerts);
  };

  const reportsList = [
    {
      id: 'weekly',
      title: 'Weekly Telemetry Report',
      description: 'Generates a 7-day health trend report, summarizing average BPM, SpO2 counts, core exertion levels, and GPS coordinate sweeps.',
      size: '142 KB'
    },
    {
      id: 'monthly',
      title: 'Monthly Summary Report',
      description: 'Generates a comprehensive 30-day veterinary log containing historical charts, cumulative alerts, and operational duration counters.',
      size: '286 KB'
    },
    {
      id: 'full_health',
      title: 'Full Biometric Audit Report',
      description: 'Generates a detailed summary auditing all logged parameters, incident history logs, and handler assignments.',
      size: '312 KB'
    }
  ];

  return (
    <div className="space-y-6 text-left">
      
      {/* Informative Header */}
      <div className="bg-[#1b1936] border border-white/5 p-4 rounded-xl shadow-md flex items-center gap-2.5">
        <FileText className="h-5.5 w-5.5 text-indigo-400" />
        <div>
          <h2 className="text-base font-bold text-white uppercase tracking-wider">Reports Module</h2>
          <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-0.5">Generate and download official veterinary audits in PDF formats</p>
        </div>
      </div>

      {/* Reports Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {reportsList.map((rep, idx) => (
          <motion.div
            key={rep.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="rounded-xl bg-[#1b1936] border border-white/5 p-5 shadow-xl flex flex-col justify-between h-[220px] hover:border-indigo-500/20 transition-all"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-1">
                  <CalendarRange className="h-3.5 w-3.5" />
                  PDF Audit
                </span>
                <span className="text-[9px] text-slate-500 font-bold uppercase">{rep.size}</span>
              </div>
              <h3 className="text-sm font-bold text-white mb-2">{rep.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-medium">
                {rep.description}
              </p>
            </div>

            <button
              onClick={() => handleDownload(rep.id)}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-[#0c0a1f] text-xs font-bold uppercase tracking-wider rounded-lg transition-colors active:scale-[0.98]"
            >
              <Download className="h-4 w-4" />
              Download PDF Report
            </button>
          </motion.div>
        ))}
      </div>

      <div className="rounded-xl bg-[#1b1936]/40 border border-white/5 p-4 flex justify-between items-center text-xs text-slate-400 font-semibold uppercase">
        <span>Veterinary report compiler: Live and synchronized to database</span>
        <ShieldCheck className="h-4.5 w-4.5 text-emerald-400" />
      </div>

    </div>
  );
}
