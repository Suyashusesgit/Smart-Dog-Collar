import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, LineChart, AlertTriangle, FileText, Settings, LogOut, HeartPulse } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({ isOpen, toggleSidebar }) {
  const { logout, currentUser } = useAuth();

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Analytics', path: '/analytics', icon: LineChart },
    { name: 'Alerts Logs', path: '/alerts', icon: AlertTriangle },
    { name: 'Reports', path: '/reports', icon: FileText },
    { name: 'Settings', path: '/settings', icon: Settings }
  ];

  return (
    <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-[#11101e] border-r border-white/5 pt-16 transition-transform duration-300 transform md:translate-x-0 md:static ${
      isOpen ? 'translate-x-0' : '-translate-x-full'
    }`}>
      <div className="h-full px-3 py-4 flex flex-col justify-between overflow-y-auto">
        {/* Navigation list */}
        <ul className="space-y-2 font-medium">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center p-3 rounded-lg text-slate-300 hover:bg-[#1b1936] hover:text-white transition-all group ${
                      isActive ? 'bg-[#1b1936] text-emerald-400 border-l-4 border-emerald-500' : ''
                    }`
                  }
                >
                  <Icon className="h-5 w-5 transition duration-75 group-hover:text-white" />
                  <span className="ml-3 text-sm">{item.name}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>

        {/* User Segment & Sign Out */}
        <div className="pt-4 border-t border-white/5 space-y-3">
          <div className="px-3 py-2 bg-[#1b1936]/40 rounded-xl border border-white/5 flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-bold text-sm border border-indigo-500/20">
              {currentUser?.email ? currentUser.email.charAt(0).toUpperCase() : 'A'}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-white truncate">{currentUser?.displayName || 'Tactical Admin'}</p>
              <p className="text-[10px] text-slate-400 truncate">{currentUser?.email}</p>
            </div>
          </div>
          
          <button
            onClick={logout}
            className="w-full flex items-center p-3 rounded-lg text-rose-400 hover:bg-rose-950/20 transition-all font-medium text-sm gap-3 group"
          >
            <LogOut className="h-5 w-5 transition duration-75 text-rose-400 group-hover:translate-x-1" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
