import React, { useState } from 'react';
import { Shield, Check, Edit3 } from 'lucide-react';

export default function ProfileCard({ alertStatus }) {
  // Operative profile details state
  const [profile, setProfile] = useState({
    callsign: "Zeus",
    breed: "Belgian Malinois",
    specialization: "Explosive Detection",
    handler: "Sgt. Miller"
  });

  const [editingField, setEditingField] = useState(null);
  const [editVal, setEditVal] = useState("");

  const startEdit = (field, currentVal) => {
    setEditingField(field);
    setEditVal(currentVal);
  };

  const saveEdit = () => {
    if (editingField) {
      setProfile((prev) => ({
        ...prev,
        [editingField]: editVal
      }));
      setEditingField(null);
    }
  };

  const fields = [
    { key: 'callsign', label: 'Callsign' },
    { key: 'breed', label: 'Breed' },
    { key: 'specialization', label: 'Specialization' },
    { key: 'handler', label: 'Handler' }
  ];

  return (
    <div className="rounded-xl bg-[#1b1936] border border-white/5 p-5 shadow-xl flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-white">K9 Operative Profile</h3>
          <div className="flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider">
            <span className={`inline-block h-2 w-2 rounded-full ${alertStatus ? 'bg-rose-500 animate-ping' : 'bg-emerald-500'}`} />
            <span className={alertStatus ? 'text-rose-400' : 'text-emerald-400'}>
              {alertStatus ? 'Alert Mode' : 'Nominal Mode'}
            </span>
          </div>
        </div>

        {/* Tactical glowing profile circle avatar */}
        <div className="relative flex justify-center mb-6">
          <div className={`h-28 w-28 rounded-full border-4 ${
            alertStatus ? 'border-rose-500 shadow-rose-500/50' : 'border-emerald-500 shadow-emerald-500/50'
          } bg-[#0c0a1f] overflow-hidden p-0.5 shadow-lg transition-all duration-500`}>
            <img 
              src="/mwd.png" 
              alt="Operative Avatar" 
              className="h-full w-full object-cover rounded-full" 
              onError={(e) => {
                e.target.src = "https://placekitten.com/200/200";
              }}
            />
          </div>
        </div>

        {/* Details Grid list */}
        <div className="space-y-3">
          {fields.map(({ key, label }) => (
            <div 
              key={key} 
              className="flex items-center justify-between bg-[#232145] px-4 py-2 rounded-lg border border-white/5 h-11 transition-all hover:bg-[#28264f]"
            >
              {editingField === key ? (
                <input
                  type="text"
                  className="bg-transparent text-xs font-semibold text-white focus:outline-none border-b border-indigo-400 w-2/3"
                  value={editVal}
                  onChange={(e) => setEditVal(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                  autoFocus
                />
              ) : (
                <span className="text-xs font-semibold text-slate-300">
                  {label}: <span className="text-white ml-1">{profile[key]}</span>
                </span>
              )}

              {editingField === key ? (
                <button 
                  onClick={saveEdit} 
                  className="flex items-center justify-center h-6 w-6 rounded-full bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/40 transition-colors"
                >
                  <Check className="h-3.5 w-3.5" />
                </button>
              ) : (
                <button 
                  onClick={() => startEdit(key, profile[key])}
                  className="bg-emerald-500 hover:bg-emerald-600 text-[#0c0a1f] text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider transition-all"
                >
                  Edit
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-400 uppercase font-semibold">
        <span>Unit: MWD-Tactical Team 4</span>
        <Shield className="h-4 w-4 text-indigo-400" />
      </div>
    </div>
  );
}
