import { useState, useEffect, useRef } from 'react';
import { db, isFirebaseConfigured } from '../firebase/config';
import { ref, onValue, set } from 'firebase/database';

// Helper to format date
const getFormattedTime = (dateObj = new Date()) => {
  const hr = String(dateObj.getHours()).padStart(2, '0');
  const mi = String(dateObj.getMinutes()).padStart(2, '0');
  const sc = String(dateObj.getSeconds()).padStart(2, '0');
  return `${hr}:${mi}:${sc}`;
};

const getFullDateTime = (dateObj = new Date()) => {
  const yr = dateObj.getFullYear();
  const mo = String(dateObj.getMonth() + 1).padStart(2, '0');
  const dy = String(dateObj.getDate()).padStart(2, '0');
  return `${yr}-${mo}-${dy} ${getFormattedTime(dateObj)}`;
};

export function useTelemetry(isLiveDefault = false) {
  const [isLive, setIsLive] = useState(isLiveDefault && isFirebaseConfigured);
  const [simulationMode, setSimulationMode] = useState('normal'); // 'normal', 'warning', 'critical'

  // Settings and Pet Configuration (Initial Load from localStorage or defaults)
  const [petInfo, setPetInfo] = useState(() => {
    const saved = localStorage.getItem("mwd_pet_info");
    return saved ? JSON.parse(saved) : {
      name: "Zeus",
      breed: "Belgian Malinois",
      age: "3 Years",
      weight: "32 kg",
      owner: "Sgt. Miller",
      contact: "+91 98765 43210"
    };
  });

  const [thresholds, setThresholds] = useState(() => {
    const saved = localStorage.getItem("mwd_thresholds");
    return saved ? JSON.parse(saved) : {
      bpmMax: 140,
      bpmMin: 60,
      spo2Min: 90,
      tempMax: 40.0,
      tempMin: 37.0
    };
  });

  // Current Live Telemetry State
  const [telemetry, setTelemetry] = useState({
    bpm: 78,
    spo2: 98,
    bodyTemp: 38.4,
    ambientTemp: 30.2,
    lat: 26.8467,
    lng: 80.9462,
    timestamp: Date.now()
  });

  // Alerts states
  const [alerts, setAlerts] = useState(() => {
    const saved = localStorage.getItem("mwd_alert_history");
    return saved ? JSON.parse(saved) : [];
  });
  
  const [newToast, setNewToast] = useState(null);

  // Activity Timeline logs
  const [timeline, setTimeline] = useState([
    { id: 1, type: 'system', event: 'System Online', time: getFormattedTime(new Date(Date.now() - 600000)) },
    { id: 2, type: 'health', event: 'Biometric stream linked', time: getFormattedTime(new Date(Date.now() - 400000)) },
    { id: 3, type: 'location', event: 'GPS Satellite Fix Acquired', time: getFormattedTime(new Date(Date.now() - 200000)) }
  ]);

  // Historical Telemetry Trends State
  const [historicalData, setHistoricalData] = useState({
    realtime: { labels: [], bpm: [], spo2: [], temp: [] },
    day24h: { labels: [], bpm: [], spo2: [], temp: [] },
    week7d: { labels: [], bpm: [], spo2: [], temp: [] }
  });

  // Keep track of average metrics
  const [stats, setStats] = useState({
    avgBpm: 78,
    avgSpo2: 98,
    avgTemp: 38.4,
    totalHours: 12.5
  });

  // Save edits helper
  const updatePetInfo = (newInfo) => {
    setPetInfo(newInfo);
    localStorage.setItem("mwd_pet_info", JSON.stringify(newInfo));
    addTimelineEvent('system', 'Pet profile info modified by Admin');
  };

  const updateThresholds = (newThresholds) => {
    setThresholds(newThresholds);
    localStorage.setItem("mwd_thresholds", JSON.stringify(newThresholds));
    addTimelineEvent('system', 'Telemetry safety thresholds updated');
  };

  // Helper to log activity events
  const addTimelineEvent = (type, event) => {
    setTimeline((prev) => [
      { id: Date.now(), type, event, time: getFormattedTime() },
      ...prev.slice(0, 19) // Limit to last 20 events
    ]);
  };

  // Initialize historical charts with realistic logs
  useEffect(() => {
    // 1. Real-time (last 10 ticks)
    const rtLabels = Array.from({ length: 10 }, (_, i) => getFormattedTime(new Date(Date.now() - (10 - i) * 3000)));
    const rtBpm = Array.from({ length: 10 }, () => Math.floor(72 + Math.random() * 8));
    const rtSpo2 = Array.from({ length: 10 }, () => Math.floor(97 + Math.random() * 3));
    const rtTemp = Array.from({ length: 10 }, () => 38.1 + Math.random() * 0.5);

    // 2. Last 24 Hours (hourly points)
    const hrLabels = Array.from({ length: 24 }, (_, i) => `${(new Date().getHours() - (23 - i) + 24) % 24}:00`);
    const hrBpm = Array.from({ length: 24 }, () => Math.floor(75 + Math.random() * 10));
    const hrSpo2 = Array.from({ length: 24 }, () => Math.floor(96 + Math.random() * 3));
    const hrTemp = Array.from({ length: 24 }, () => 38.2 + Math.random() * 0.6);

    // 3. Last 7 Days (daily points)
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const wkLabels = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return dayNames[d.getDay()];
    });
    const wkBpm = Array.from({ length: 7 }, () => Math.floor(76 + Math.random() * 6));
    const wkSpo2 = Array.from({ length: 7 }, () => Math.floor(97 + Math.random() * 1.5));
    const wkTemp = Array.from({ length: 7 }, () => 38.3 + Math.random() * 0.4);

    setHistoricalData({
      realtime: { labels: rtLabels, bpm: rtBpm, spo2: rtSpo2, temp: rtTemp },
      day24h: { labels: hrLabels, bpm: hrBpm, spo2: hrSpo2, temp: hrTemp },
      week7d: { labels: wkLabels, bpm: wkBpm, spo2: wkSpo2, temp: wkTemp }
    });
  }, []);

  // Rules Engine Classification
  const classifyBpm = (val) => {
    if (val === 0) return 'Normal';
    if (val > thresholds.bpmMax) return 'Critical';
    if (val > thresholds.bpmMin && val <= 120) return 'Normal';
    return 'Warning'; // 121 - 140 is warning range
  };

  const classifySpo2 = (val) => {
    if (val === 0) return 'Normal';
    if (val < thresholds.spo2Min) return 'Critical';
    if (val >= 95) return 'Normal';
    return 'Warning'; // 90 - 94 is warning range
  };

  const classifyTemp = (val) => {
    if (val === 0) return 'Normal';
    if (val > thresholds.tempMax) return 'Critical';
    if (val >= thresholds.tempMin && val <= 39.0) return 'Normal';
    return 'Warning'; // 39 - 40 is warning range
  };

  // Determine overall status based on Rules
  const getOverallStatus = () => {
    const bpmClass = classifyBpm(telemetry.bpm);
    const spo2Class = classifySpo2(telemetry.spo2);
    const tempClass = classifyTemp(telemetry.bodyTemp);

    if (bpmClass === 'Critical' || spo2Class === 'Critical' || tempClass === 'Critical') {
      return 'Critical';
    }
    if (bpmClass === 'Warning' || spo2Class === 'Warning' || tempClass === 'Warning') {
      return 'Warning';
    }
    return 'Normal';
  };

  const overallStatus = getOverallStatus();

  // Evaluate alarm states and log alerts
  const checkAlertThresholds = (currentVitals) => {
    const { bpm, spo2, bodyTemp } = currentVitals;
    let alarmTriggered = false;
    let message = "";

    if (bpm > thresholds.bpmMax) {
      alarmTriggered = true;
      message = `Critical BPM Alert: ${bpm} BPM (Threshold: ${thresholds.bpmMax})`;
    } else if (spo2 < thresholds.spo2Min) {
      alarmTriggered = true;
      message = `Critical SpO2 Alert: ${spo2}% (Threshold: ${thresholds.spo2Min}%)`;
    } else if (bodyTemp > thresholds.tempMax) {
      alarmTriggered = true;
      message = `Critical Core Temperature Alert: ${bodyTemp.toFixed(1)}°C (Threshold: ${thresholds.tempMax}°C)`;
    }

    if (alarmTriggered) {
      const newAlert = {
        id: Date.now(),
        event: message,
        time: getFullDateTime(new Date()),
        severity: 'Critical'
      };

      setAlerts((prev) => {
        const updated = [newAlert, ...prev.slice(0, 49)];
        localStorage.setItem("mwd_alert_history", JSON.stringify(updated));
        return updated;
      });

      setNewToast(message);
      addTimelineEvent('alert', `Alert Triggered: ${message}`);
    }
  };

  // Keep alert local state sync
  useEffect(() => {
    if (newToast) {
      const t = setTimeout(() => setNewToast(null), 6000);
      return () => clearTimeout(t);
    }
  }, [newToast]);

  // Recalculate stats when telemetry changes
  const updateMetricsHistory = (newVal) => {
    setHistoricalData((prev) => {
      // Append to real-time rolling array
      const rtLabels = [...prev.realtime.labels.slice(1), getFormattedTime()];
      const rtBpm = [...prev.realtime.bpm.slice(1), newVal.bpm];
      const rtSpo2 = [...prev.realtime.spo2.slice(1), newVal.spo2];
      const rtTemp = [...prev.realtime.temp.slice(1), newVal.bodyTemp];

      return {
        ...prev,
        realtime: { labels: rtLabels, bpm: rtBpm, spo2: rtSpo2, temp: rtTemp }
      };
    });

    // Re-evaluate Averages
    setStats((prev) => {
      // Keep running averages with slight convergence
      return {
        ...prev,
        avgBpm: Math.floor((prev.avgBpm * 19 + newVal.bpm) / 20),
        avgSpo2: Math.floor((prev.avgSpo2 * 19 + newVal.spo2) / 20),
        avgTemp: Number(((prev.avgTemp * 19 + newVal.bodyTemp) / 20).toFixed(1)),
        totalHours: Number((prev.totalHours + 2.5 / 3600).toFixed(4)) // Accumulating time
      };
    });
  };

  // 1. Live Firebase Database Link
  useEffect(() => {
    if (!isLive || !db) return;

    // Listen to DogCollar/live reference node
    const collarRef = ref(db, 'DogCollar/live');
    const unsubscribe = onValue(collarRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const newVal = {
          bpm: Number(data.bpm ?? telemetry.bpm),
          spo2: Number(data.spo2 ?? telemetry.spo2),
          bodyTemp: Number(data.bodyTemp ?? telemetry.bodyTemp),
          ambientTemp: Number(data.ambientTemp ?? telemetry.ambientTemp),
          lat: Number(data.lat ?? telemetry.lat),
          lng: Number(data.lng ?? telemetry.lng),
          timestamp: data.timestamp ? Number(data.timestamp) * 1000 : Date.now()
        };

        setTelemetry(newVal);
        updateMetricsHistory(newVal);
        checkAlertThresholds(newVal);
        addTimelineEvent('health', 'Telemetry check complete');
      }
    });

    return () => unsubscribe();
  }, [isLive]);

  // 2. Mock Simulation Loop (Runs offline mock sensor metrics)
  useEffect(() => {
    if (isLive) return;

    const interval = setInterval(() => {
      setTelemetry((prev) => {
        let bpm = prev.bpm;
        let spo2 = prev.spo2;
        let bodyTemp = prev.bodyTemp;
        let ambientTemp = prev.ambientTemp;

        ambientTemp = Number((30.0 + (Math.random() - 0.5) * 0.8).toFixed(1));

        if (simulationMode === 'normal') {
          bpm = Math.floor(75 + (Math.random() - 0.5) * 8);
          spo2 = Math.floor(96 + Math.random() * 4);
          bodyTemp = Number((38.2 + (Math.random() - 0.5) * 0.3).toFixed(1));
        } else if (simulationMode === 'warning') {
          // Triggers warning bounds (BPM 125, SpO2 92, temp 39.2)
          bpm = Math.floor(125 + (Math.random() - 0.5) * 5);
          spo2 = Math.floor(91 + Math.random() * 2);
          bodyTemp = Number((39.2 + (Math.random() - 0.5) * 0.2).toFixed(1));
        } else if (simulationMode === 'critical') {
          // Triggers critical thresholds (BPM > 140, SpO2 < 90, temp > 40)
          bpm = Math.floor(145 + (Math.random() - 0.5) * 6);
          spo2 = Math.floor(84 + Math.random() * 4);
          bodyTemp = Number((40.3 + (Math.random() - 0.5) * 0.4).toFixed(1));
        }

        if (spo2 > 100) spo2 = 100;

        // Dynamic GPS coordinates step (simulated tracking path)
        const lat = prev.lat + (Math.random() - 0.5) * 0.00015;
        const lng = prev.lng + (Math.random() - 0.5) * 0.00015;

        const newVal = {
          bpm,
          spo2,
          bodyTemp,
          ambientTemp,
          lat,
          lng,
          timestamp: Date.now()
        };

        updateMetricsHistory(newVal);
        checkAlertThresholds(newVal);
        
        // Dynamic timeline logs
        const triggerRand = Math.random();
        if (triggerRand > 0.8) {
          addTimelineEvent('location', 'Collar location vector updated');
        } else if (triggerRand > 0.6) {
          addTimelineEvent('health', 'Dog vital sensors calibrated');
        }

        return newVal;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [isLive, simulationMode, thresholds]);

  const clearAlertHistory = () => {
    setAlerts([]);
    localStorage.removeItem("mwd_alert_history");
  };

  return {
    telemetry,
    historicalData,
    stats,
    alerts,
    timeline,
    petInfo,
    thresholds,
    overallStatus,
    newToast,
    isLive,
    isFirebaseConfigured,
    simulationMode,
    setSimulationMode,
    setIsLive: (val) => {
      if (val && !isFirebaseConfigured) {
        alert("Firebase DB url not loaded in configurations. Staying in simulation mode.");
        return;
      }
      setIsLive(val);
      addTimelineEvent('system', `Telemetry stream source changed to ${val ? 'Firebase Live' : 'Simulation Feed'}`);
    },
    updatePetInfo,
    updateThresholds,
    clearAlertHistory,
    classifyBpm,
    classifySpo2,
    classifyTemp
  };
}
