import { useEffect, useState } from 'react';
import { useVigilStream } from '../VigilStreamProvider';

const idleMessages = [
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
  const { latest, connected } = useVigilStream();
  const [log, setLog] = useState([]);

  // Idle rotation so the log keeps breathing between live events.
  // Only run when actually connected — don't show fake messages during outages.
  useEffect(() => {
    if (!connected) return;
    const interval = setInterval(() => {
      const msg = idleMessages[Math.floor(Math.random() * idleMessages.length)];
      setLog(prev => [{ ...msg, id: `idle-${Date.now()}` }, ...prev].slice(0, 40));
    }, 3000);
    return () => clearInterval(interval);
  }, [connected]);

  // Real entries driven by the live /stream — this is what makes the
  // log feel like an actual reasoning trace instead of a script
  useEffect(() => {
    if (!latest) return;
    const entries = [];

    if (latest.is_anomaly) {
      entries.push({
        agent: 'AlertAgent',
        msg: `Anomaly detected — ${latest.train_id} on ${latest.track_section}, severity ${latest.severity}`,
      });
      entries.push({
        agent: 'ActionAgent',
        msg: latest.recommended_action || `Recommendation logged for ${latest.train_id}`,
      });
    } else {
      entries.push({
        agent: 'WatchAgent',
        msg: `${latest.train_id} on ${latest.track_section} — reading nominal, continuing surveillance`,
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