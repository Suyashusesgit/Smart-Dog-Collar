import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Compass, Navigation } from 'lucide-react';

// Custom circular map marker featuring Zeus's tactical portrait
const createMwdMarker = (alert) => {
  const ringColor = alert ? 'border-rose-500 shadow-rose-500/50' : 'border-emerald-500 shadow-emerald-500/50';
  
  return L.divIcon({
    className: 'custom-mwd-map-marker',
    html: `
      <div class="relative flex items-center justify-center h-11 w-11">
        <span class="animate-ping absolute inline-flex h-full w-full rounded-full ${alert ? 'bg-rose-400' : 'bg-emerald-400'} opacity-40"></span>
        <div class="relative h-10 w-10 rounded-full border-2 ${ringColor} bg-[#1b1936] overflow-hidden shadow-lg p-0.5">
          <img src="/mwd.png" class="h-full w-full object-cover rounded-full" onerror="this.src='https://placekitten.com/100/100'" />
        </div>
      </div>
    `,
    iconSize: [44, 44],
    iconAnchor: [22, 22],
    popupAnchor: [0, -22]
  });
};

// Component to dynamically pan and center when coordinates update
function RecenterMap({ lat, lng }) {
  const map = useMap();
  useEffect(() => {
    if (lat && lng) {
      map.setView([lat, lng], 16, { animate: true, duration: 1.2 });
    }
  }, [lat, lng, map]);
  return null;
}

export default function MapComponent({ lat, lng, timestamp, alertStatus }) {
  const latitude = lat || 26.8467;
  const longitude = lng || 80.9462;

  return (
    <div className="rounded-xl bg-[#1b1936] border border-white/5 p-5 shadow-xl flex flex-col h-full relative overflow-hidden">
      
      {/* Satellites Placeholder Badge */}
      <div className="absolute top-4 right-4 z-[1000] flex items-center gap-1.5 px-3 py-1.5 rounded-xl glass-panel text-[10px] font-bold uppercase tracking-wider border border-white/10">
        <Compass className="h-3.5 w-3.5 text-emerald-400 animate-spin-slow" />
        <span>Satellites: 9 (Fix)</span>
      </div>

      <div className="mb-4 text-left">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Navigation className="h-4.5 w-4.5 text-indigo-400" />
          Live GPS Tracking
        </h3>
        <div className="grid grid-cols-3 gap-2 mt-3 font-mono text-[10px] text-slate-300 bg-[#0c0a1f]/40 p-2.5 rounded-lg border border-white/5">
          <div>
            <span className="text-slate-400 block font-semibold uppercase tracking-wider">Latitude</span>
            <span className="text-white font-bold">{latitude.toFixed(6)}</span>
          </div>
          <div>
            <span className="text-slate-400 block font-semibold uppercase tracking-wider">Longitude</span>
            <span className="text-white font-bold">{longitude.toFixed(6)}</span>
          </div>
          <div>
            <span className="text-slate-400 block font-semibold uppercase tracking-wider">Sync Time</span>
            <span className="text-white font-bold truncate block">{timestamp || 'Searching...'}</span>
          </div>
        </div>
      </div>

      <div className="relative w-full h-[320px] rounded-lg overflow-hidden border border-white/5">
        <MapContainer
          center={[latitude, longitude]}
          zoom={15}
          scrollWheelZoom={true}
          className="w-full h-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          />
          
          <Marker position={[latitude, longitude]} icon={createMwdMarker(alertStatus)}>
            <Popup>
              <div className="p-1 font-sans text-center text-slate-800">
                <p className="font-bold text-xs">Zeus (MWD)</p>
                <p className="text-[9px] text-slate-500">Live Collar Feed</p>
              </div>
            </Popup>
          </Marker>

          <RecenterMap lat={latitude} lng={longitude} />
        </MapContainer>
      </div>
    </div>
  );
}
