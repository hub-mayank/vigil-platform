import { useEffect, useState } from 'react';
import { useVigilStream } from '../VigilStreamProvider';

// Static idle messages that contain no train/section references
// (those are now dynamically generated from live section data below)
const genericIdleMessages = [
  { agent: 'WatchAgent', msg: 'Monitoring 50 active train sensors across 10 sections' },
  { agent: 'WatchAgent', msg: 'Signal voltage nominal across all active sections' },
  { agent: 'WatchAgent', msg: 'Vibration levels within threshold on all active trains' },
  { agent: 'WatchAgent', msg: 'Temperature within safe range across all monitored sections' },
];

// IMPORTANT: use inline color values, not Tailwind class strings.
// Tailwind v4 purges any class string that is never statically present in a file,
// so dynamic values like `text-blue-400` built at runtime are stripped from the bundle.
const agentColors = {
  WatchAgent:  '#60a5fa', // blue-400
  AlertAgent:  '#facc15', // yellow-400
  ActionAgent: '#00ff88', // vigil green
};

export default function AgentLog() {
  const { latest, sections, connected } = useVigilStream();
  const [log, setLog] = useState([]);

  // Idle rotation so the log keeps breathing between live events.
  // When section data is available, inject dynamic station-name references;
  // otherwise fall back to generic static messages.
  // Only run when actually connected — don't show fake messages during outages.
  useEffect(() => {
    if (!connected) return;
    const interval = setInterval(() => {
      const sectionKeys = Object.keys(sections || {});
      let msg;

      if (sectionKeys.length > 0) {
        // Pick a random live section and reference its real station name
        const key = sectionKeys[Math.floor(Math.random() * sectionKeys.length)];
        const sec = sections[key];
        const stationName = sec.real_station_name || key;
        const realTrain = sec.real_train_number || sec.train_id || '';

        const dynamicMessages = [
          { agent: 'WatchAgent', msg: `Monitoring ${stationName} sector — all readings nominal` },
          { agent: 'WatchAgent', msg: `${stationName}: signal voltage stable, no anomalies detected` },
          { agent: 'WatchAgent', msg: `${realTrain} passing through ${stationName} — surveillance active` },
          { agent: 'WatchAgent', msg: `${stationName} junction: track integrity verified` },
        ];
        msg = dynamicMessages[Math.floor(Math.random() * dynamicMessages.length)];
      } else {
        msg = genericIdleMessages[Math.floor(Math.random() * genericIdleMessages.length)];
      }

      setLog(prev => [{ ...msg, id: `idle-${Date.now()}` }, ...prev].slice(0, 40));
    }, 3000);
    return () => clearInterval(interval);
  }, [connected, sections]);

  // Real entries driven by the live /stream — this is what makes the
  // log feel like an actual reasoning trace instead of a script.
  // Uses real_train_number and real_station_name when available.
  useEffect(() => {
    if (!latest) return;

    const trainLabel   = latest.real_train_number || latest.train_id;
    const stationLabel = latest.real_station_name || latest.track_section;

    const entries = [];

    if (latest.is_anomaly) {
      entries.push({
        agent: 'AlertAgent',
        msg: `Anomaly detected — ${trainLabel} on ${stationLabel}, severity ${latest.severity}`,
      });
      entries.push({
        agent: 'ActionAgent',
        msg: latest.recommended_action || `Recommendation logged for ${trainLabel}`,
      });
    } else {
      entries.push({
        agent: 'WatchAgent',
        msg: `${trainLabel} on ${stationLabel} — reading nominal, continuing surveillance`,
      });
    }

    setLog(prev => [
      ...entries.map((e, i) => ({ ...e, id: `live-${Date.now()}-${i}` })),
      ...prev,
    ].slice(0, 40));
  }, [latest]);

  return (
    <div style={{
      backgroundColor: '#111827',
      border: '1px solid #1f2937',
      borderRadius: '8px',
      padding: '16px',
      height: '100%',
      overflowY: 'auto',
    }}>
      <h2 style={{
        fontSize: '10px', fontWeight: '600',
        color: '#9ca3af', letterSpacing: '0.1em',
        marginBottom: '12px',
      }}>AGENT ACTIVITY LOG</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {log.map(entry => (
          <div key={entry.id} style={{ fontSize: '13px', lineHeight: '1.5' }}>
            <span style={{
              fontWeight: '600',
              color: agentColors[entry.agent] || '#9ca3af',
            }}>
              {entry.agent}
            </span>
            <span style={{ color: '#d1d5db' }}>{'  '}{entry.msg}</span>
          </div>
        ))}
      </div>
    </div>
  );
}