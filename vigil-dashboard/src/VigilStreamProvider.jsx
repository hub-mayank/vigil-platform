import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';

export const VigilStreamContext = createContext(null);

const SECTIONS = ['SECTION_A','SECTION_B','SECTION_C','SECTION_D','SECTION_E','SECTION_F','SECTION_G','SECTION_H','SECTION_I','SECTION_J'];

// Reconnect backoff: 1s → 2s → 4s → 8s → max 15s
const BACKOFF_MS  = [1000, 2000, 4000, 8000, 15000];

/**
 * Single shared SSE connection for the entire dashboard.
 *
 * Key improvements over v1:
 *  - Automatic exponential-backoff reconnect on disconnect / MIME error
 *  - Skips events that are backend error signals (type === 'error')
 *  - Exposes `reconnecting` flag so UI can show intermediate state
 *  - URL is read from VITE_STREAM_URL env var at build time, falls back to
 *    the ngrok URL with ngrok-skip-browser-warning=true header workaround
 *
 * Expected event shape from /stream:
 * {
 *   train_id, track_section, signal_voltage, vibration_hz,
 *   speed_kmh, temperature_celsius,
 *   is_anomaly, anomaly_score, severity, recommended_action
 * }
 */
export function VigilStreamProvider({ children }) {
  // Allow runtime override via env var so Vercel deployments don't need code changes
  const url = import.meta.env.VITE_STREAM_URL ||
    'https://swagger-upload-climate.ngrok-free.dev/stream?ngrok-skip-browser-warning=true';

  const [latest, setLatest]           = useState(null);
  const [history, setHistory]         = useState([]);     // for HealthChart
  const [alerts, setAlerts]           = useState([]);     // for AlertFeed
  const [sections, setSections]       = useState({});     // for RailNetworkMap
  const [connected, setConnected]     = useState(false);
  const [reconnecting, setReconnecting] = useState(false);

  const esRef         = useRef(null);
  const attemptRef    = useRef(0);
  const timerRef      = useRef(null);
  const mountedRef    = useRef(true);

  const connect = useCallback(() => {
    if (!mountedRef.current) return;

    // Clean up any stale connection first
    if (esRef.current) {
      esRef.current.onopen    = null;
      esRef.current.onmessage = null;
      esRef.current.onerror   = null;
      esRef.current.close();
      esRef.current = null;
    }

    const es = new EventSource(url);
    esRef.current = es;

    es.onopen = () => {
      if (!mountedRef.current) return;
      attemptRef.current = 0;   // reset backoff on successful connect
      setConnected(true);
      setReconnecting(false);
    };

    es.onmessage = (event) => {
      if (!mountedRef.current) return;

      let data;
      try {
        data = JSON.parse(event.data);
      } catch {
        // Unparseable frame (e.g. ngrok HTML warning page slipping through) — skip
        console.warn('VIGIL stream: skipping unparseable SSE frame');
        return;
      }

      // Skip backend error-signal events (type === 'error' from stream generator)
      if (data?.type === 'error') {
        console.warn('VIGIL stream: backend error tick', data.message);
        return;
      }

      // Guard: must have the minimum shape we expect
      if (!data.train_id || !data.track_section) return;

      setLatest(data);

      const timestamp = new Date().toLocaleTimeString('en-IN', { hour12: false });
      // anomaly_score is 0–1 from backend; health score = 100 - (score * 100)
      const score = Math.max(0, Math.min(100, Math.round(100 - (data.anomaly_score ?? 0) * 100)));

      // Rolling history for the health chart (last 30 points ≈ 60s at 2s/event)
      setHistory(prev => {
        const next = [...prev, { time: timestamp, score }];
        return next.length > 30 ? next.slice(next.length - 30) : next;
      });

      // Alert feed — keep most recent 20
      setAlerts(prev => {
        const entry = {
          id: `${data.train_id}-${Date.now()}`,
          train_id:         data.train_id,
          track_section:    data.track_section,
          severity:         data.severity ?? 'Normal',
          is_anomaly:       !!data.is_anomaly,
          anomaly_score:    data.anomaly_score ?? 0,
          recommended_action: data.recommended_action ?? '',
          timestamp,
          raw: data,  // kept for AlertModal → /agent/analyze
        };
        const next = [entry, ...prev];
        return next.length > 20 ? next.slice(0, 20) : next;
      });

      // Per-section latest status for the network map
      if (SECTIONS.includes(data.track_section)) {
        setSections(prev => ({
          ...prev,
          [data.track_section]: {
            severity:      data.severity ?? 'Normal',
            anomaly_score: data.anomaly_score ?? 0,
            train_id:      data.train_id,
            timestamp,
          },
        }));
      }
    };

    es.onerror = () => {
      if (!mountedRef.current) return;

      // Mark disconnected immediately
      setConnected(false);

      // Close the broken source (browser may re-attempt internally, but we manage it ourselves)
      es.onopen    = null;
      es.onmessage = null;
      es.onerror   = null;
      es.close();
      esRef.current = null;

      // Schedule reconnect with exponential backoff
      const delay = BACKOFF_MS[Math.min(attemptRef.current, BACKOFF_MS.length - 1)];
      attemptRef.current += 1;
      setReconnecting(true);

      timerRef.current = setTimeout(() => {
        if (mountedRef.current) connect();
      }, delay);
    };
  }, [url]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    mountedRef.current = true;
    connect();

    return () => {
      mountedRef.current = false;
      clearTimeout(timerRef.current);
      if (esRef.current) {
        esRef.current.onopen    = null;
        esRef.current.onmessage = null;
        esRef.current.onerror   = null;
        esRef.current.close();
      }
    };
  }, [connect]);

  return (
    <VigilStreamContext.Provider value={{ latest, history, alerts, sections, connected, reconnecting }}>
      {children}
    </VigilStreamContext.Provider>
  );
}

export function useVigilStream() {
  const ctx = useContext(VigilStreamContext);
  if (!ctx) throw new Error('useVigilStream must be used inside <VigilStreamProvider>');
  return ctx;
}
