import { createContext, useContext, useEffect, useState } from 'react';

export const VigilStreamContext = createContext(null);

const SECTIONS = ['SECTION_A','SECTION_B','SECTION_C','SECTION_D','SECTION_E','SECTION_F','SECTION_G','SECTION_H','SECTION_I','SECTION_J'];

/**
 * Wrap your app (or just the dashboard) with this once.
 * Opens ONE EventSource to Aditya's /stream endpoint and fans the
 * data out to AlertFeed, HealthChart, AgentLog, and the heatmap —
 * so we don't open 3-4 separate SSE connections.
 *
 * Expected shape of each /stream event (Aditya — confirm this):
 * {
 *   train_id, track_section, signal_voltage, vibration_hz,
 *   speed_kmh, temperature_celsius,
 *   is_anomaly, anomaly_score, severity, recommended_action
 * }
 */
export function VigilStreamProvider({ children, url = 'http://localhost:8000/stream' }) {
  const [latest, setLatest] = useState(null);
  const [history, setHistory] = useState([]);     // for HealthChart
  const [alerts, setAlerts] = useState([]);       // for AlertFeed
  const [sections, setSections] = useState({});   // for the network map
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const es = new EventSource(url);

    es.onopen = () => setConnected(true);

    es.onmessage = (event) => {
      let data;
      try {
        data = JSON.parse(event.data);
      } catch (e) {
        console.error('VIGIL stream: could not parse event', event.data);
        return;
      }

      setLatest(data);

      const timestamp = new Date().toLocaleTimeString('en-IN', { hour12: false });
      const score = Math.max(0, Math.min(100, Math.round(100 - (data.anomaly_score ?? 0) * 100)));

      // Rolling history for the health chart (last 30 points ~ 60s at 2s/event)
      setHistory(prev => {
        const next = [...prev, { time: timestamp, score }];
        return next.length > 30 ? next.slice(next.length - 30) : next;
      });

      // Alert feed entry
      setAlerts(prev => {
        const entry = {
          id: `${data.train_id}-${Date.now()}`,
          train_id: data.train_id,
          track_section: data.track_section,
          real_train_number: data.real_train_number ?? data.train_id,
          real_station_name: data.real_station_name ?? data.track_section,
          severity: data.severity ?? 'Normal',
          is_anomaly: !!data.is_anomaly,
          anomaly_score: data.anomaly_score ?? 0,
          recommended_action: data.recommended_action ?? '',
          timestamp,
          raw: data, // full reading — needed for /agent/analyze (signal_voltage, vibration_hz, speed_kmh, temperature_celsius)
        };
        const next = [entry, ...prev];
        return next.length > 20 ? next.slice(0, 20) : next;
      });

      // Per-section latest status, for the network map
      if (SECTIONS.includes(data.track_section)) {
        setSections(prev => ({
          ...prev,
          [data.track_section]: {
            severity: data.severity ?? 'Normal',
            anomaly_score: data.anomaly_score ?? 0,
            train_id: data.train_id,
            real_train_number: data.real_train_number ?? data.train_id,
            real_station_name: data.real_station_name,
            timestamp,
          },
        }));
      }
    };

    es.onerror = () => setConnected(false);

    return () => es.close();
  }, [url]);

  return (
    <VigilStreamContext.Provider value={{ latest, history, alerts, sections, connected }}>
      {children}
    </VigilStreamContext.Provider>
  );
}

export function useVigilStream() {
  const ctx = useContext(VigilStreamContext);
  if (!ctx) throw new Error('useVigilStream must be used inside <VigilStreamProvider>');
  return ctx;
}
