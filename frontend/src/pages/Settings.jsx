import React, { useState } from 'react';
import { Settings as SettingsIcon, ShieldCheck, HeartPulse, Cpu, Bell, Dog } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Settings({ telemetryContext }) {
  const {
    petInfo,
    updatePetInfo,
    thresholds,
    updateThresholds
  } = telemetryContext;

  // Local state for forms
  const [petForm, setPetForm] = useState({ ...petInfo });
  const [thresholdForm, setThresholdForm] = useState({ ...thresholds });
  const [firebaseForm, setFirebaseForm] = useState({
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyD...",
    dbUrl: import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://dogcollar-default-rtdb.firebaseio.com"
  });
  const [notifications, setNotifications] = useState({
    email: true,
    sms: true,
    push: false
  });

  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSaveAll = (e) => {
    e.preventDefault();
    updatePetInfo(petForm);
    updateThresholds(thresholdForm);
    
    // Save notifications to localstorage
    localStorage.setItem("mwd_notifications", JSON.stringify(notifications));

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 4000);
  };

  return (
    <form onSubmit={handleSaveAll} className="space-y-6 text-left">
      
      {/* Save indicator overlay banner */}
      {saveSuccess && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2"
        >
          <ShieldCheck className="h-4.5 w-4.5 animate-bounce" />
          Settings Configs successfully synchronized and saved to local storage!
        </motion.div>
      )}

      {/* Grid segments */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* 1. Pet Information Card */}
        <div className="rounded-xl bg-[#1b1936] border border-white/5 p-5 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-white/5 pb-2.5">
            <Dog className="h-4.5 w-4.5 text-indigo-400" />
            Pet Information Profile
          </h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Callsign</label>
              <input
                type="text"
                className="w-full bg-[#0c0a1f] border border-white/5 rounded-lg py-2 px-3 text-xs text-white focus:outline-none focus:border-indigo-500"
                value={petForm.name}
                onChange={(e) => setPetForm({ ...petForm, name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Breed</label>
              <input
                type="text"
                className="w-full bg-[#0c0a1f] border border-white/5 rounded-lg py-2 px-3 text-xs text-white focus:outline-none focus:border-indigo-500"
                value={petForm.breed}
                onChange={(e) => setPetForm({ ...petForm, breed: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Age</label>
              <input
                type="text"
                className="w-full bg-[#0c0a1f] border border-white/5 rounded-lg py-2 px-3 text-xs text-white focus:outline-none focus:border-indigo-500"
                value={petForm.age}
                onChange={(e) => setPetForm({ ...petForm, age: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Weight</label>
              <input
                type="text"
                className="w-full bg-[#0c0a1f] border border-white/5 rounded-lg py-2 px-3 text-xs text-white focus:outline-none focus:border-indigo-500"
                value={petForm.weight}
                onChange={(e) => setPetForm({ ...petForm, weight: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Handler Name</label>
              <input
                type="text"
                className="w-full bg-[#0c0a1f] border border-white/5 rounded-lg py-2 px-3 text-xs text-white focus:outline-none focus:border-indigo-500"
                value={petForm.owner}
                onChange={(e) => setPetForm({ ...petForm, owner: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Handler Contact</label>
              <input
                type="text"
                className="w-full bg-[#0c0a1f] border border-white/5 rounded-lg py-2 px-3 text-xs text-white focus:outline-none focus:border-indigo-500"
                value={petForm.contact}
                onChange={(e) => setPetForm({ ...petForm, contact: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* 2. Threshold Alert Settings */}
        <div className="rounded-xl bg-[#1b1936] border border-white/5 p-5 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-white/5 pb-2.5">
            <HeartPulse className="h-4.5 w-4.5 text-indigo-400" />
            Operational Threshold Settings
          </h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Max Heart Rate (BPM)</label>
              <input
                type="number"
                className="w-full bg-[#0c0a1f] border border-white/5 rounded-lg py-2 px-3 text-xs text-white focus:outline-none focus:border-indigo-500"
                value={thresholdForm.bpmMax}
                onChange={(e) => setThresholdForm({ ...thresholdForm, bpmMax: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Min SpO2 (%)</label>
              <input
                type="number"
                className="w-full bg-[#0c0a1f] border border-white/5 rounded-lg py-2 px-3 text-xs text-white focus:outline-none focus:border-indigo-500"
                value={thresholdForm.spo2Min}
                onChange={(e) => setThresholdForm({ ...thresholdForm, spo2Min: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Max Core Temp (°C)</label>
              <input
                type="number"
                step="0.1"
                className="w-full bg-[#0c0a1f] border border-white/5 rounded-lg py-2 px-3 text-xs text-white focus:outline-none focus:border-indigo-500"
                value={thresholdForm.tempMax}
                onChange={(e) => setThresholdForm({ ...thresholdForm, tempMax: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Min Core Temp (°C)</label>
              <input
                type="number"
                step="0.1"
                className="w-full bg-[#0c0a1f] border border-white/5 rounded-lg py-2 px-3 text-xs text-white focus:outline-none focus:border-indigo-500"
                value={thresholdForm.tempMin}
                onChange={(e) => setThresholdForm({ ...thresholdForm, tempMin: Number(e.target.value) })}
              />
            </div>
          </div>
        </div>

        {/* 3. Firebase SDK Setup Configs */}
        <div className="rounded-xl bg-[#1b1936] border border-white/5 p-5 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-white/5 pb-2.5">
            <Cpu className="h-4.5 w-4.5 text-indigo-400" />
            Cloud Database Credentials
          </h3>
          
          <div className="space-y-3.5">
            <div>
              <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Firebase Database URL</label>
              <input
                type="text"
                disabled
                className="w-full bg-[#0c0a1f] border border-white/5 text-slate-500 rounded-lg py-2 px-3 text-xs focus:outline-none cursor-not-allowed"
                value={firebaseForm.dbUrl}
              />
            </div>
            <div>
              <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Firebase Api Key</label>
              <input
                type="password"
                disabled
                className="w-full bg-[#0c0a1f] border border-white/5 text-slate-500 rounded-lg py-2 px-3 text-xs focus:outline-none cursor-not-allowed"
                value={firebaseForm.apiKey}
              />
            </div>
            <span className="text-[10px] text-slate-400 font-semibold italic">Note: Live variables are configured inside environmental configurations (.env) during system builds.</span>
          </div>
        </div>

        {/* 4. Notification Preferences */}
        <div className="rounded-xl bg-[#1b1936] border border-white/5 p-5 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-white/5 pb-2.5">
            <Bell className="h-4.5 w-4.5 text-indigo-400" />
            Incident Preferences
          </h3>
          
          <div className="space-y-3.5">
            <label className="flex items-center gap-3 cursor-pointer text-xs font-semibold text-slate-300">
              <input
                type="checkbox"
                className="rounded bg-[#0c0a1f] border-white/5 text-indigo-600 focus:ring-indigo-500 h-4.5 w-4.5"
                checked={notifications.email}
                onChange={(e) => setNotifications({ ...notifications, email: e.target.checked })}
              />
              Email Alerts on Vital breaches
            </label>

            <label className="flex items-center gap-3 cursor-pointer text-xs font-semibold text-slate-300">
              <input
                type="checkbox"
                className="rounded bg-[#0c0a1f] border-white/5 text-indigo-600 focus:ring-indigo-500 h-4.5 w-4.5"
                checked={notifications.sms}
                onChange={(e) => setNotifications({ ...notifications, sms: e.target.checked })}
              />
              SMS Dispatches to Handler Mobile
            </label>

            <label className="flex items-center gap-3 cursor-pointer text-xs font-semibold text-slate-300">
              <input
                type="checkbox"
                className="rounded bg-[#0c0a1f] border-white/5 text-indigo-600 focus:ring-indigo-500 h-4.5 w-4.5"
                checked={notifications.push}
                onChange={(e) => setNotifications({ ...notifications, push: e.target.checked })}
              />
              In-Browser Audio Alarms
            </label>
          </div>
        </div>

      </div>

      {/* Form Submission Button */}
      <div className="flex justify-end pt-4">
        <button
          type="submit"
          className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-[#0c0a1f] font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-[0.98]"
        >
          Save settings configuration
        </button>
      </div>

    </form>
  );
}
