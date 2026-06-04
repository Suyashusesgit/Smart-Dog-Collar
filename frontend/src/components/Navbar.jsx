import React from 'react';
import { Menu, HeartPulse, Wifi, WifiOff, RefreshCw } from 'lucide-react';

export default function Navbar({ toggleSidebar, isLive, setIsLive, isFirebaseConfigured, overallStatus }) {
  return (
    <nav className="fixed top-0 z-50 w-full bg-[#11101e] border-b border-white/5 px-4 py-3 flex items-center justify-between shadow-md">
      <div className="flex items-center gap-3">
        {/* Mobile menu toggle */}
        <button
          onClick={toggleSidebar}
          className="inline-flex items-center p-2 rounded-lg text-slate-400 hover:bg-[#1b1936] focus:outline-none md:hidden"
        >
          <Menu className="h-5.5 w-5.5" />
        </button>
        
        {/* Branding Logo */}
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600/10 text-emerald-400 border border-emerald-500/20">
            <HeartPulse className="h-5 w-5 animate-pulse" />
          </div>
          <span className="self-center text-sm md:text-base font-bold tracking-wider text-white uppercase hidden sm:inline-block">
            K9 Biometrics Tracker
          </span>
          <span className="self-center text-xs font-bold text-slate-400 sm:hidden">
            K9 Tracker
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* System Health Status Badge */}
        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider hidden md:inline-block ${
          overallStatus === 'Normal' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 
          overallStatus === 'Warning' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
          'bg-rose-500/10 text-rose-400 border border-rose-500/20 animate-pulse'
        }`}>
          Status: {overallStatus}
        </span>

        {/* Live vs Mock Toggler */}
        <div className="flex items-center gap-1 bg-[#1b1936] p-1 rounded-lg border border-white/5 text-[10px] font-bold uppercase tracking-wider">
          <button
            onClick={() => setIsLive(true)}
            className={`px-2.5 py-1 rounded transition-all duration-200 ${
              isLive ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Live DB
          </button>
          <button
            onClick={() => setIsLive(false)}
            className={`px-2.5 py-1 rounded transition-all duration-200 ${
              !isLive ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Mock IoT
          </button>
        </div>

        {/* Connection status indicator */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1b1936] border border-white/5 text-[10px] font-semibold tracking-wide">
          {isLive ? (
            <>
              <Wifi className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
              <span className="text-emerald-400 uppercase">Cloud Sync</span>
            </>
          ) : (
            <>
              <WifiOff className="h-3.5 w-3.5 text-amber-400" />
              <span className="text-amber-400 uppercase">Offline Feed</span>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
