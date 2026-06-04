import { useState, useEffect, useRef, useCallback } from 'react';
import { db, isFirebaseConfigured } from '../firebase/config';
import { ref, onValue } from 'firebase/database';

/**
 * useK9Stream - Optimized hook for high-frequency telemetry.
 * Throttles React state updates to prevent re-render thrashing, 
 * while maintaining a steady flow of data for the UI.
 * 
 * @param {boolean} isLive - Whether to connect to Firebase or use mock.
 * @param {number} throttleMs - Minimum milliseconds between state updates.
 * @param {number} historyLimit - Maximum number of historical points to track.
 */
export function useK9Stream(isLive = false, throttleMs = 2000, historyLimit = 30) {
  const [telemetry, setTelemetry] = useState({
    bpm: 78,
    spo2: 98,
    bodyTemp: 38.4,
    ambientTemp: 30.2,
    lat: 26.8467,
    lng: 80.9462,
    timestamp: Date.now()
  });

  const [history, setHistory] = useState([]);
  const [pathTrace, setPathTrace] = useState([]);

  const lastUpdateRef = useRef(Date.now());
  const pendingDataRef = useRef(null);
  const rafIdRef = useRef(null);

  // Format time for charts
  const getFormattedTime = (dateObj) => {
    const hr = String(dateObj.getHours()).padStart(2, '0');
    const mi = String(dateObj.getMinutes()).padStart(2, '0');
    const sc = String(dateObj.getSeconds()).padStart(2, '0');
    return `${hr}:${mi}:${sc}`;
  };

  const updateState = useCallback((newVal) => {
    setTelemetry(newVal);
    
    // Update history for charts
    setHistory(prev => {
      const point = {
        time: getFormattedTime(new Date(newVal.timestamp)),
        bpm: newVal.bpm,
        spo2: newVal.spo2,
        bodyTemp: newVal.bodyTemp,
        ambientTemp: newVal.ambientTemp
      };
      const newHistory = [...prev, point];
      if (newHistory.length > historyLimit) newHistory.shift();
      return newHistory;
    });

    // Update path trace for map
    setPathTrace(prev => {
      const newTrace = [...prev, [newVal.lat, newVal.lng]];
      if (newTrace.length > 50) newTrace.shift(); // Keep last 50 coordinates
      return newTrace;
    });
  }, [historyLimit]);

  // Function to process and throttle incoming data
  const processNewData = useCallback((data) => {
    const now = Date.now();
    const timeSinceLastUpdate = now - lastUpdateRef.current;

    const newVal = {
      bpm: Number(data.bpm ?? telemetry.bpm),
      spo2: Number(data.spo2 ?? telemetry.spo2),
      bodyTemp: Number(data.bodyTemp ?? telemetry.bodyTemp),
      ambientTemp: Number(data.ambientTemp ?? telemetry.ambientTemp),
      lat: Number(data.lat ?? telemetry.lat),
      lng: Number(data.lng ?? telemetry.lng),
      timestamp: data.timestamp ? Number(data.timestamp) * 1000 : now
    };

    if (timeSinceLastUpdate >= throttleMs) {
      updateState(newVal);
      lastUpdateRef.current = now;
      pendingDataRef.current = null;
    } else {
      pendingDataRef.current = newVal;
      
      if (!rafIdRef.current) {
        const waitTime = throttleMs - timeSinceLastUpdate;
        rafIdRef.current = setTimeout(() => {
          if (pendingDataRef.current) {
            updateState(pendingDataRef.current);
            lastUpdateRef.current = Date.now();
            pendingDataRef.current = null;
          }
          rafIdRef.current = null;
        }, waitTime);
      }
    }
  }, [telemetry, throttleMs, updateState]);

  // Firebase Realtime Listener
  useEffect(() => {
    if (!isLive || !db || !isFirebaseConfigured) return;

    const collarRef = ref(db, 'DogCollar/live');
    const unsubscribe = onValue(collarRef, (snapshot) => {
      if (snapshot.exists()) {
        processNewData(snapshot.val());
      }
    });

    return () => {
      unsubscribe();
      if (rafIdRef.current) {
        clearTimeout(rafIdRef.current);
      }
    };
  }, [isLive, processNewData]);

  // Fallback Simulation Mode
  useEffect(() => {
    if (isLive) return;

    // Seed initial history
    const initialHistory = [];
    const initialPath = [];
    let currentLat = 26.8467;
    let currentLng = 80.9462;
    
    for (let i = historyLimit; i > 0; i--) {
      const t = Date.now() - (i * throttleMs);
      currentLat += (Math.random() - 0.5) * 0.00015;
      currentLng += (Math.random() - 0.5) * 0.00015;
      
      initialHistory.push({
        time: getFormattedTime(new Date(t)),
        bpm: Math.floor(75 + (Math.random() - 0.5) * 8),
        spo2: Math.floor(96 + Math.random() * 4),
        bodyTemp: Number((38.2 + (Math.random() - 0.5) * 0.3).toFixed(1)),
        ambientTemp: Number((30.0 + (Math.random() - 0.5) * 0.8).toFixed(1))
      });
      initialPath.push([currentLat, currentLng]);
    }
    
    setHistory(initialHistory);
    setPathTrace(initialPath);
    setTelemetry(prev => ({...prev, lat: currentLat, lng: currentLng}));

    const interval = setInterval(() => {
      setTelemetry(prev => {
        const lat = prev.lat + (Math.random() - 0.5) * 0.00015;
        const lng = prev.lng + (Math.random() - 0.5) * 0.00015;
        const newVal = {
          bpm: Math.floor(75 + (Math.random() - 0.5) * 8),
          spo2: Math.floor(96 + Math.random() * 4),
          bodyTemp: Number((38.2 + (Math.random() - 0.5) * 0.3).toFixed(1)),
          ambientTemp: Number((30.0 + (Math.random() - 0.5) * 0.8).toFixed(1)),
          lat,
          lng,
          timestamp: Date.now()
        };
        updateState(newVal);
        return newVal;
      });
    }, throttleMs);

    return () => clearInterval(interval);
  }, [isLive, throttleMs, historyLimit, updateState]);

  return { telemetry, history, pathTrace };
}
