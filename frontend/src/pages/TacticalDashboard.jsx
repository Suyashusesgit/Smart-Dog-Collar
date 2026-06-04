import React, { useMemo, useState } from 'react';
import { useK9Stream } from '../hooks/useK9Stream';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { Activity, ThermometerSun, Flame, HeartPulse, AlertTriangle, ShieldCheck, Database, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// --- Helper Functions & Configurations ---

// Thresholds for classification
const THRESHOLDS = {
  bpmMax: 140,
  bpmMin: 60,
  spo2Min: 90,
  tempMax: 40.0,
  tempMin: 37.0
};

// Rules Engine Classification
const classifyStatus = (val, min, max) => {
  if (max && val > max) return 'critical';
  if (min && val < min) return 'critical';
  return 'normal';
};

const getStatusColor = (status) => {
  switch (status) {
    case 'critical': return 'text-tactical-critical bg-tactical-critical/10 border-tactical-critical/30';
    case 'warning': return 'text-tactical-warning bg-tactical-warning/10 border-tactical-warning/30';
    default: return 'text-tactical-normal bg-tactical-normal/10 border-tactical-normal/30';
  }
};

// Fix Leaflet Default Icon issue in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom Tactical Icon
const tacticalMarkerIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const criticalMarkerIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// --- Subcomponents ---

// 1. Metric Card (Memoized to prevent re-renders unless its specific value changes)
const MetricCard = React.memo(({ title, value, unit, icon: Icon, status }) => {
  const colorClass = getStatusColor(status);
  const isCritical = status === 'critical';

  return (
    <div className={`p-4 rounded-xl border bg-tactical-card/80 backdrop-blur-sm flex flex-col justify-between transition-colors duration-500 ${colorClass}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold uppercase tracking-widest text-tactical-text/70">{title}</span>
        <Icon className={`w-5 h-5 ${isCritical ? 'animate-pulse-critical text-tactical-critical' : 'opacity-70'}`} />
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-4xl font-tactical font-bold tracking-tight">{value}</span>
        <span className="text-sm font-semibold opacity-60">{unit}</span>
      </div>
    </div>
  );
});

// 2. Alert Banner Component
const AlertBanner = ({ isCritical, alerts }) => {
  return (
    <AnimatePresence>
      <motion.div 
        layout
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`w-full p-4 mb-6 rounded-lg border shadow-lg flex items-center justify-between
          ${isCritical 
            ? 'bg-tactical-critical/20 border-tactical-critical text-tactical-critical animate-pulse-critical' 
            : 'bg-tactical-normal/10 border-tactical-normal/30 text-tactical-normal'
          }`}
      >
        <div className="flex items-center gap-3">
          {isCritical ? <AlertTriangle className="w-6 h-6" /> : <ShieldCheck className="w-6 h-6" />}
          <div>
            <h2 className="text-sm font-bold uppercase tracking-widest">
              {isCritical ? 'Critical Threat Detected' : 'System Nominal'}
            </h2>
            <p className="text-xs opacity-80 font-tactical">
              {isCritical ? alerts.join(' | ') : 'All vital metrics within safe operational parameters.'}
            </p>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

// 3. Tactical Map Component
const TacticalMap = React.memo(({ lat, lng, isCritical, pathTrace }) => {
  const position = [lat, lng];

  return (
    <div className="h-full w-full min-h-[400px] rounded-xl overflow-hidden border border-tactical-border relative shadow-2xl">
      {/* Overlay to enforce dark mode look on the map */}
      <div className="absolute inset-0 pointer-events-none z-[400] ring-inset ring-1 ring-white/5" />
      <MapContainer 
        center={position} 
        zoom={16} 
        scrollWheelZoom={true} 
        style={{ height: '100%', width: '100%', background: '#020617' }}
      >
        {/* Dark Matter / Tactical Map layer */}
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CartoDB</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        {/* Historical Trace */}
        <Polyline 
          positions={pathTrace} 
          color={isCritical ? '#ef4444' : '#10b981'} 
          weight={3} 
          opacity={0.6} 
          dashArray="5, 10" 
        />
        {/* We use standard marker but swap icon. Note: React Leaflet marker transitions are handled natively or with CSS if needed. */}
        <Marker 
          position={position} 
          icon={isCritical ? criticalMarkerIcon : tacticalMarkerIcon}
        >
          <Popup className="tactical-popup">
            <div className="text-tactical-dark font-tactical font-bold text-xs">
              K9 Unit Alpha<br/>
              Lat: {lat.toFixed(5)}<br/>
              Lng: {lng.toFixed(5)}
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
});

// 4. Vitals Chart Component
const VitalsChart = React.memo(({ history }) => {
  const data = {
    labels: history.map(h => h.time),
    datasets: [
      {
        label: 'Ambient Temp (°C)',
        data: history.map(h => h.ambientTemp),
        borderColor: '#14b8a6', // teal-500
        backgroundColor: 'transparent',
        tension: 0.4,
        borderWidth: 2,
        pointRadius: 0
      },
      {
        label: 'Object Temp (°C)',
        data: history.map(h => h.bodyTemp),
        borderColor: '#f59e0b', // amber-500
        backgroundColor: 'transparent',
        tension: 0.4,
        borderWidth: 2,
        pointRadius: 0
      },
      {
        label: 'Pulse (BPM)',
        data: history.map(h => h.bpm),
        borderColor: '#ef4444', // red-500
        backgroundColor: 'transparent',
        tension: 0.4,
        borderWidth: 2,
        pointRadius: 0
      },
      {
        label: 'SpO2 (%)',
        data: history.map(h => h.spo2),
        borderColor: '#3b82f6', // blue-500
        backgroundColor: 'transparent',
        tension: 0.4,
        borderWidth: 2,
        pointRadius: 0
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: '#94a3b8', font: { family: 'Roboto Mono' } } },
      tooltip: { mode: 'index', intersect: false }
    },
    scales: {
      y: { grid: { color: '#334155' }, ticks: { color: '#94a3b8' } },
      x: { grid: { display: false }, ticks: { color: '#94a3b8', maxTicksLimit: 10 } }
    }
  };

  return (
    <div className="h-[300px] w-full p-4">
      <Line data={data} options={options} />
    </div>
  );
});

// --- Main Dashboard Component ---

export default function TacticalDashboard() {
  const [isLiveMode, setIsLiveMode] = useState(true);

  // Use the optimized stream (throttle 2000ms for live stability)
  const { telemetry, history, pathTrace } = useK9Stream(isLiveMode, 2000, 30);

  // Evaluate statuses
  const bpmStatus = classifyStatus(telemetry.bpm, THRESHOLDS.bpmMin, THRESHOLDS.bpmMax);
  const spo2Status = classifyStatus(telemetry.spo2, THRESHOLDS.spo2Min, null);
  const coreTempStatus = classifyStatus(telemetry.bodyTemp, THRESHOLDS.tempMin, THRESHOLDS.tempMax);
  
  // Aggregate system status
  const isCritical = bpmStatus === 'critical' || spo2Status === 'critical' || coreTempStatus === 'critical';
  
  // Generate alert messages
  const activeAlerts = useMemo(() => {
    const alerts = [];
    if (bpmStatus === 'critical') alerts.push(`BPM Anomaly (${telemetry.bpm})`);
    if (spo2Status === 'critical') alerts.push(`Hypoxia Warning (${telemetry.spo2}%)`);
    if (coreTempStatus === 'critical') alerts.push(`Core Temp Critical (${telemetry.bodyTemp}°C)`);
    return alerts;
  }, [bpmStatus, spo2Status, coreTempStatus, telemetry.bpm, telemetry.spo2, telemetry.bodyTemp]);

  return (
    <div className="min-h-screen bg-tactical-dark text-tactical-text p-6 md:p-8 font-sans selection:bg-tactical-normal/30">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header Title */}
        <header className="flex items-center justify-between border-b border-tactical-border/50 pb-4">
          <div className="flex items-center gap-4">
            <img 
              src="/k9-profile.png" 
              alt="K9 Unit Profile" 
              className="w-14 h-14 md:w-16 md:h-16 rounded-full border-2 border-tactical-normal object-cover shadow-[0_0_15px_rgba(16,185,129,0.3)]"
            />
            <div>
              <h1 className="text-2xl font-black uppercase tracking-tighter text-tactical-text/90 flex items-center gap-2">
                <Activity className="w-6 h-6 text-tactical-normal" />
                Overwatch Command
              </h1>
              <p className="text-xs font-tactical text-tactical-text/50 tracking-widest mt-1">
                MWD TELEMETRY UPLINK // SECURE
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-3 md:flex-row md:items-center md:gap-4">
            {/* Toggle Switch */}
            <div className="flex bg-tactical-card/50 border border-tactical-border rounded-lg p-1 shadow-inner">
              <button 
                onClick={() => setIsLiveMode(true)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-widest transition-colors ${isLiveMode ? 'bg-indigo-600 text-white shadow-md' : 'text-tactical-text/50 hover:text-tactical-text/80'}`}
              >
                <Database className="w-4 h-4" /> Live Firebase
              </button>
              <button 
                onClick={() => setIsLiveMode(false)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-widest transition-colors ${!isLiveMode ? 'bg-indigo-600 text-white shadow-md' : 'text-tactical-text/50 hover:text-tactical-text/80'}`}
              >
                <Eye className="w-4 h-4" /> Simulation
              </button>
            </div>
            
            {/* Connected Badge */}
            <div className="hidden md:flex items-center gap-2 bg-tactical-card/50 border border-tactical-border px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest text-tactical-text/80 shadow-inner">
              <div className={`w-2 h-2 rounded-full ${isLiveMode ? 'bg-tactical-normal shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-tactical-warning shadow-[0_0_8px_rgba(245,158,11,0.8)]'} animate-pulse`}></div>
              {isLiveMode ? 'Connected' : 'Simulating'}
            </div>

            <div className="text-right hidden lg:block ml-2 border-l border-tactical-border/50 pl-4">
              <div className="text-[10px] font-tactical text-tactical-text/50">SYSTEM TIME</div>
              <div className="text-sm font-tactical font-bold text-tactical-text/80">
                {new Date().toISOString().split('T')[1].split('.')[0]}Z
              </div>
            </div>
          </div>
        </header>

        {/* Master Alert Banner */}
        <AlertBanner isCritical={isCritical} alerts={activeAlerts} />

        {/* Dashboard Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Telemetry Matrix (4 columns on desktop, 2 on tablet, 1 on mobile) */}
          <div className="lg:col-span-5 grid grid-cols-2 gap-4 h-fit">
            <MetricCard 
              title="Heart Rate" 
              value={telemetry.bpm} 
              unit="BPM" 
              icon={HeartPulse} 
              status={bpmStatus} 
            />
            <MetricCard 
              title="O2 Saturation" 
              value={telemetry.spo2} 
              unit="%" 
              icon={Activity} 
              status={spo2Status} 
            />
            <MetricCard 
              title="Core Temp" 
              value={telemetry.bodyTemp.toFixed(1)} 
              unit="°C" 
              icon={Flame} 
              status={coreTempStatus} 
            />
            <MetricCard 
              title="Ambient Temp" 
              value={telemetry.ambientTemp.toFixed(1)} 
              unit="°C" 
              icon={ThermometerSun} 
              status="normal" // Ambient doesn't have a critical strict threshold here
            />
            
            {/* Additional Status Panel */}
            <div className="col-span-2 p-5 rounded-xl border border-tactical-border bg-tactical-card/50">
              <h3 className="text-xs font-bold uppercase tracking-widest text-tactical-text/50 mb-4">Signal Diagnostics</h3>
              <div className="space-y-3 font-tactical text-xs">
                <div className="flex justify-between">
                  <span className="text-tactical-text/40">UPLINK RATE</span>
                  <span className="text-tactical-normal">2000ms</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-tactical-text/40">DATA PACKET</span>
                  <span className="text-tactical-text/80">SECURE_ENC_256</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-tactical-text/40">GPS FIX</span>
                  <span className="text-tactical-text/80">12 SATS (3D)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Tactical Map */}
          <div className="lg:col-span-7 rounded-xl overflow-hidden border border-tactical-border bg-tactical-card/30 flex flex-col">
            <div className="p-3 border-b border-tactical-border bg-tactical-card/80 flex justify-between items-center z-10">
              <span className="text-xs font-bold uppercase tracking-widest text-tactical-text/70">Geospatial Tracking</span>
              <span className="text-[10px] font-tactical bg-tactical-dark px-2 py-1 rounded text-tactical-text/50 border border-tactical-border">
                {telemetry.lat.toFixed(6)}, {telemetry.lng.toFixed(6)}
              </span>
            </div>
            <div className="flex-1 relative min-h-[500px]">
              <TacticalMap 
                lat={telemetry.lat} 
                lng={telemetry.lng} 
                isCritical={isCritical} 
                pathTrace={pathTrace}
              />
            </div>
          </div>
          
        </div>

        {/* Analytics & Diagnostics Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 rounded-xl border border-tactical-border bg-tactical-card/50 overflow-hidden flex flex-col shadow-lg">
            <div className="p-3 border-b border-tactical-border bg-tactical-card/80 flex justify-between items-center">
              <span className="text-xs font-bold uppercase tracking-widest text-tactical-text/70">Vitals Chart</span>
            </div>
            <VitalsChart history={history} />
          </div>

          <div className="lg:col-span-1 rounded-xl border border-tactical-border bg-tactical-card/50 overflow-hidden flex flex-col shadow-lg">
             <div className="p-3 border-b border-tactical-border bg-tactical-card/80">
              <span className="text-xs font-bold uppercase tracking-widest text-tactical-text/70">Health Status</span>
            </div>
            <div className="p-5 flex flex-col gap-4">
              {activeAlerts.length > 0 ? (
                <div className="p-4 bg-tactical-critical/20 border border-tactical-critical rounded text-tactical-critical text-sm font-bold font-tactical shadow-inner">
                  ALERT: {activeAlerts.join(' | ')}
                </div>
              ) : (
                <div className="p-4 bg-tactical-normal/20 border border-tactical-normal rounded text-tactical-normal text-sm font-bold font-tactical shadow-inner">
                  STATUS: All Parameters Normal
                </div>
              )}
              
              <div className="mt-2">
                <h4 className="text-xs font-bold uppercase tracking-widest text-tactical-text/50 mb-3">Parameter Status</h4>
                <ul className="space-y-3 text-sm font-tactical bg-tactical-dark/30 p-4 rounded border border-tactical-border">
                  <li className="flex items-center justify-between"><div className="flex items-center gap-3"><ThermometerSun className="w-4 h-4 text-tactical-text/50" /> Ambient Temp:</div> <span className="text-tactical-normal">Normal</span></li>
                  <li className="flex items-center justify-between"><div className="flex items-center gap-3"><Flame className="w-4 h-4 text-tactical-text/50" /> Object Temp:</div> <span className={coreTempStatus === 'critical' ? 'text-tactical-critical animate-pulse-critical' : 'text-tactical-normal'}>{coreTempStatus === 'critical' ? 'Critical' : 'Normal'}</span></li>
                  <li className="flex items-center justify-between"><div className="flex items-center gap-3"><HeartPulse className="w-4 h-4 text-tactical-text/50" /> Pulse:</div> <span className={bpmStatus === 'critical' ? 'text-tactical-critical animate-pulse-critical' : 'text-tactical-normal'}>{bpmStatus === 'critical' ? 'Critical' : 'Normal'}</span></li>
                  <li className="flex items-center justify-between"><div className="flex items-center gap-3"><Activity className="w-4 h-4 text-tactical-text/50" /> SpO2:</div> <span className={spo2Status === 'critical' ? 'text-tactical-critical animate-pulse-critical' : 'text-tactical-normal'}>{spo2Status === 'critical' ? 'Critical' : 'Normal'}</span></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
