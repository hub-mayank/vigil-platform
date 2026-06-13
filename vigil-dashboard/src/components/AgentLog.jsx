import { useEffect, useRef, useState } from 'react';
import { Bot, Eye, Bell, Zap } from 'lucide-react';

const AGENTS = [
  {
    id: 'WatchAgent',
    icon: Eye,
    color: 'text-sky-400',
    dotColor: 'bg-sky-400',
    badgeBg: 'bg-sky-500/15',
    actions: [
      'Scanning track T-01A for signal anomalies...',
      'Monitoring Train TRN-2201 telemetry stream',
      'Cross-referencing signal latency on T-04D',
      'Running occupancy detection on segments 5–8',
      'Verifying sensor uptime across all towers',
      'Polling GPS beacon of TRN-7765',
      'Detecting speed variance on corridor C3',
      'Initiating deep scan of T-02B signal relay',
    ],
  },
  {
    id: 'AlertAgent',
    icon: Bell,
    color: 'text-amber-400',
    dotColor: 'bg-amber-400',
    badgeBg: 'bg-amber-500/15',
    actions: [
      'Classified signal drop on T-03C as Warning',
      'Critical threshold breached — escalating TRN-4452',
      'Alert suppression window applied to T-07G',
      'Routing alert bundle to dispatcher console',
      'Acknowledged Normal status for TRN-1123',
      'Correlating 3 Warning events — pattern detected',
      'Dispatching SMS advisory to Zone 4 controller',
      'Deduplication: merged 2 duplicate alerts on T-05E',
    ],
  },
  {
    id: 'ActionAgent',
    icon: Zap,
    color: 'text-[#00ff88]',
    dotColor: 'bg-[#00ff88]',
    badgeBg: 'bg-[#00ff88]/10',
    actions: [
      'Recommending emergency stop for TRN-8871',
      'Issued speed restriction order — Zone 2 active',
      'Sent maintenance dispatch to depot T-06F',
      'Override request logged — awaiting supervisor',
      'Auto-resolved signal bounce on T-01A',
      'Activated amber warning on approach T-03C',
      'Queued inspection for TRN-3390 at next station',
      'Action playbook "SIGNAL_FAIL_01" triggered',
    ],
  },
];

let globalCounter = 0;

function newEntry() {
  const agent = AGENTS[Math.floor(Math.random() * AGENTS.length)];
  return {
    id: ++globalCounter,
    agentId: agent.id,
    icon: agent.icon,
    color: agent.color,
    dotColor: agent.dotColor,
    badgeBg: agent.badgeBg,
    message: agent.actions[Math.floor(Math.random() * agent.actions.length)],
    timestamp: new Date(),
  };
}

function initialEntries() {
  return Array.from({ length: 10 }, newEntry).reverse();
}

export default function AgentLog() {
  const [entries, setEntries] = useState(initialEntries);
  const listRef = useRef(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setEntries(prev => [newEntry(), ...prev].slice(0, 60));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Bot className="w-4 h-4 text-[#00ff88]" />
          <h2 className="text-sm font-semibold text-white tracking-wide">Agent Activity</h2>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00ff88] animate-pulse" />
            <span className="text-[10px] text-[#00ff88] font-medium">3 agents</span>
          </span>
        </div>
        <div className="flex gap-2 text-[10px] text-gray-500">
          {AGENTS.map(a => (
            <span key={a.id} className={`${a.color} font-medium`}>{a.id}</span>
          ))}
        </div>
      </div>

      {/* Log list */}
      <div
        ref={listRef}
        className="flex-1 overflow-y-auto space-y-1.5 pr-1"
        style={{ maxHeight: '280px' }}
      >
        {entries.map((entry, idx) => {
          const Icon = entry.icon;
          return (
            <div
              key={entry.id}
              className={`flex items-start gap-2.5 px-3 py-2.5 rounded-lg border border-gray-800/80
                ${entry.badgeBg} transition-all duration-300
                ${idx === 0 ? 'animate-[fadeSlideIn_0.3s_ease]' : ''}
              `}
            >
              {/* Agent icon */}
              <div className={`mt-0.5 shrink-0 ${entry.color}`}>
                <Icon className="w-3.5 h-3.5" />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <span className={`text-[10px] font-bold ${entry.color} mr-2`}>
                  {entry.agentId}
                </span>
                <span className="text-xs text-gray-300">{entry.message}</span>
              </div>

              {/* Time */}
              <span className="text-[10px] text-gray-600 font-mono shrink-0 mt-0.5">
                {entry.timestamp.toLocaleTimeString()}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
