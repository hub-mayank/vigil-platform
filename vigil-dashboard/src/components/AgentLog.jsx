import { useEffect, useState } from 'react';
import { useVigilStream } from '../VigilStreamProvider';

const idleMessages = [
  { agent: 'WatchAgent', msg: 'Monitoring 50 active train sensors across 10 sections' },
  { agent: 'WatchAgent', msg: 'Signal voltage nominal across all active sections' },
  { agent: 'WatchAgent', msg: 'Vibration levels within threshold on all active trains' },
  { agent: 'WatchAgent', msg: 'Temperature within safe range across all monitored sections' },
];

const agentColors = {
  WatchAgent: 'text-blue-400',
  AlertAgent: 'text-yellow-400',
  ActionAgent: 'text-[#00ff88]',
};

export default function AgentLog() {
  const { latest } = useVigilStream();
  const [log, setLog] = useState([]);

  // Idle rotation so the log keeps breathing between live events
  useEffect(() => {
    const interval = setInterval(() => {
      const msg = idleMessages[Math.floor(Math.random() * idleMessages.length)];
      setLog(prev => [{ ...msg, id: `idle-${Date.now()}` }, ...prev].slice(0, 40));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

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
    <div className="bg-[#111827] border border-[#1f2937] rounded-lg p-4 h-full overflow-y-auto">
      <h2 className="text-xs font-semibold text-gray-400 tracking-widest mb-3">AGENT ACTIVITY LOG</h2>
      <div className="space-y-1.5">
        {log.map(entry => (
          <div key={entry.id} className="text-sm leading-relaxed">
            <span className={`font-semibold ${agentColors[entry.agent]}`}>{entry.agent}</span>
            <span className="text-gray-300">  {entry.msg}</span>
          </div>
        ))}
      </div>
    </div>
  );
}