import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';

// Custom circular map marker featuring Rover's profile photo
const createDogMarker = (alert) => {
  const ringColor = alert ? 'border-rose-500' : 'border-emerald-500';
  const shadowColor = alert ? 'shadow-rose-500/40' : 'shadow-emerald-500/40';
  
  return L.divIcon({
    className: 'custom-dog-marker',
    html: `
      <div class="relative flex items-center justify-center h-11 w-11">
        <span class="animate-ping absolute inline-flex h-full w-full rounded-full ${alert ? 'bg-rose-400' : 'bg-emerald-400'} opacity-40"></span>
        <div class="relative h-10 w-10 rounded-full border-2 ${ringColor} bg-[#1b1936] overflow-hidden shadow-lg ${shadowColor}">
          <img src="/rover.png" class="h-full w-full object-cover" onerror="this.src='https://placekitten.com/100/100'" />
        </div>
      </div>
    `,
    iconSize: [44, 44],
    iconAnchor: [22, 22],
    popupAnchor: [0, -22]
  });
};

// Map Recenter Action Controller
function RecenterMap({ lat, lng }) {
  const map = useMap();
  useEffect(() => {
    if (lat && lng) {
      map.setView([lat, lng], 16, { animate: true, duration: 1 });
    }
  }, [lat, lng, map]);
  return null;
}

export default function MapComponent({ location, timestamp, alertStatus }) {
  const lat = location?.lat || 26.47900;
  const lng = location?.lng || 73.11587;

  return (
    <div className="rounded-xl bg-[#1b1936] border border-white/5 p-5 shadow-xl flex flex-col h-full">
      <div className="mb-4">
        <h3 className="text-base font-bold text-white mb-2">Location</h3>
        <div className="space-y-1 font-mono text-[11px] text-slate-300">
          <div className="flex gap-2">
            <span className="text-slate-400 w-20">Latitude:</span>
            <span>{lat.toFixed(6)}</span>
          </div>
          <div className="flex gap-2">
            <span className="text-slate-400 w-20">Longitude:</span>
            <span>{lng.toFixed(6)}</span>
          </div>
          <div className="flex gap-2">
            <span className="text-slate-400 w-20">Timestamp:</span>
            <span>{timestamp}</span>
          </div>
        </div>
      </div>

      <div className="relative w-full h-[280px] rounded-lg overflow-hidden border border-white/5">
        <MapContainer
          center={[lat, lng]}
          zoom={16}
          scrollWheelZoom={true}
          className="w-full h-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          />
          
          <Marker position={[lat, lng]} icon={createDogMarker(alertStatus)}>
            <Popup>
              <div className="p-1 font-sans text-center text-slate-800">
                <p className="font-bold text-xs">Dog Location</p>
                <p className="text-[10px] text-slate-500">Rover is here</p>
              </div>
            </Popup>
          </Marker>

          <RecenterMap lat={lat} lng={lng} />
        </MapContainer>
      </div>
    </div>
  );
}
