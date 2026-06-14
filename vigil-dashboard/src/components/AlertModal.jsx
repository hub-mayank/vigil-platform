import { useEffect, useState } from 'react';

const AGENT_ANALYZE_URL = 'http://localhost:8000/agent/analyze';
const AGENT_ANALYZE_TIMEOUT_MS = 4000; // if Groq is slow, fall back rather than hang the modal

export default function AlertModal({ alert, onClose, onResolve }) {
  const [agentData, setAgentData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch live Groq reasoning for this specific reading when the modal opens.
  // IMPORTANT: hooks must run unconditionally (before the `if (!alert)` guard
  // below), otherwise React throws "hooks called conditionally".
  useEffect(() => {
    setAgentData(null);

    if (!alert || !alert.raw) return; // nothing to fetch without the raw sensor reading

    setLoading(true);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), AGENT_ANALYZE_TIMEOUT_MS);

    fetch(AGENT_ANALYZE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        train_id: alert.raw.train_id,
        track_section: alert.raw.track_section,
        signal_voltage: alert.raw.signal_voltage,
        vibration_hz: alert.raw.vibration_hz,
        speed_kmh: alert.raw.speed_kmh,
        temperature_celsius: alert.raw.temperature_celsius,
      }),
    })
      .then(res => {
        if (!res.ok) throw new Error('agent/analyze failed');
        return res.json();
      })
      .then(json => setAgentData(json))
      .catch(() => setAgentData(null)) // silent fallback — alert.recommended_action covers this
      .finally(() => {
        clearTimeout(timeout);
        setLoading(false);
      });

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
    // alert.id is enough to re-trigger; using the whole `alert` object would
    // re-fire on every parent re-render even for the same alert.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [alert?.id]);

  // --- NULL GUARD ---
  // Without this, the modal crashes the whole app with
  // "Cannot read properties of null (reading 'train_id')" the moment
  // `alert` is null — which is most of the time (before any alert is clicked).
  if (!alert) return null;

  const trainId = alert.train_id || alert.trainId;
  const section = alert.track_section || alert.section;
  const time = alert.time || alert.timestamp;
  const severity = (alert.severity || 'CRITICAL').toUpperCase();

  const action =
    agentData?.recommended_action ||
    alert.recommended_action ||
    alert.action ||
    'Reduce speed immediately. Dispatch maintenance team.';

  const trace = agentData?.agent_trace;
  const isLiveAI = !!trace?.some(t => t.toLowerCase().includes('groq'));

  const handleResolve = () => {
    if (onResolve) onResolve(alert.id);
    else onClose();
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9000,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      backgroundColor: 'rgba(0,0,0,0.45)'
    }}>
      <div style={{
        width: '400px',
        backgroundColor: '#0d1321',
        border: '1px solid #ef444455',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(0,0,0,0.6)'
      }}>

        {/* Header bar */}
        <div style={{
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 18px',
          backgroundColor: '#110a0a',
          borderBottom: '1px solid #1f2937'
        }}>
          <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
            <div style={{
              width: '7px', height: '7px', borderRadius: '50%',
              backgroundColor: '#ef4444',
              boxShadow: '0 0 7px #ef4444'
            }}/>
            <span style={{
              fontSize: '11px', fontWeight: '700',
              color: '#ef4444', letterSpacing: '0.1em'
            }}>{severity} ALERT</span>
          </div>
          <button onClick={onClose} style={{
            background: 'none', border: 'none',
            color: '#6b7280', fontSize: '16px',
            cursor: 'pointer', padding: '2px 6px',
            borderRadius: '4px', lineHeight: 1
          }}>✕</button>
        </div>

        {/* Body */}
        <div style={{padding: '18px'}}>

          {/* Train + Section */}
          <div style={{
            fontSize: '15px', fontWeight: '700',
            color: '#ffffff', marginBottom: '4px'
          }}>
            {trainId} — {section}
          </div>
          <div style={{
            fontSize: '11px', color: '#6b7280', marginBottom: '14px'
          }}>
            Detected {time}
            {alert.anomaly_score ? ` · anomaly score ${Number(alert.anomaly_score).toFixed(2)}` : ''}
          </div>

          {/* Detail rows */}
          <div style={{display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px'}}>
            {[
              ['Severity', severity, '#ef4444'],
              ['Section', section, '#ffffff'],
              ['Train ID', trainId, '#ffffff'],
            ].map(([label, value, col]) => (
              <div key={label} style={{
                display: 'flex', justifyContent: 'space-between',
                alignItems: 'center', padding: '7px 12px',
                borderRadius: '6px', backgroundColor: '#111827'
              }}>
                <span style={{fontSize: '11px', color: '#6b7280'}}>{label}</span>
                <span style={{fontSize: '11px', fontWeight: '600', color: col}}>{value}</span>
              </div>
            ))}
          </div>

          {/* AI Recommendation */}
          <div style={{
            padding: '12px 14px', borderRadius: '8px',
            backgroundColor: '#071f12',
            border: '1px solid #00ff8825',
            marginBottom: trace ? '10px' : '16px'
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              marginBottom: '6px'
            }}>
              <div style={{
                fontSize: '9px', fontWeight: '700',
                color: '#00ff88', letterSpacing: '0.1em'
              }}>ACTIONAGENT RECOMMENDATION</div>

              {loading && (
                <div style={{display: 'flex', alignItems: 'center', gap: '5px'}}>
                  <div className="animate-pulse" style={{
                    width: '6px', height: '6px', borderRadius: '50%',
                    backgroundColor: '#00ff88'
                  }}/>
                  <span style={{fontSize: '9px', color: '#00ff88'}}>THINKING…</span>
                </div>
              )}
              {!loading && isLiveAI && (
                <span style={{fontSize: '9px', color: '#00ff88', fontWeight: '700'}}>● LIVE AI</span>
              )}
            </div>
            <div style={{fontSize: '12px', color: '#d1d5db', lineHeight: '1.5'}}>
              {action}
            </div>
          </div>

          {/* Agent trace — only shown once /agent/analyze responds */}
          {trace && (
            <div style={{
              padding: '10px 14px', borderRadius: '8px',
              backgroundColor: '#111827',
              border: '1px solid #1f2937',
              marginBottom: '16px'
            }}>
              <div style={{
                fontSize: '9px', fontWeight: '700',
                color: '#6b7280', letterSpacing: '0.1em', marginBottom: '6px'
              }}>AGENT TRACE</div>
              <div style={{display: 'flex', flexDirection: 'column', gap: '4px'}}>
                {trace.map((step, i) => (
                  <div key={i} style={{fontSize: '10px', color: '#9ca3af'}}>
                    <span style={{color: '#00ff88'}}>→</span> {step}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Button */}
          <button onClick={handleResolve} style={{
            width: '100%', padding: '10px',
            borderRadius: '7px', border: 'none',
            backgroundColor: '#00ff88', color: '#0a0f1e',
            fontSize: '12px', fontWeight: '700',
            letterSpacing: '0.06em', cursor: 'pointer'
          }}>MARK RESOLVED</button>

        </div>
      </div>
    </div>
  )
}
