import { useEffect, useRef, useState } from 'react';
import { AlertTriangle, AlertCircle, CheckCircle, Radio } from 'lucide-react';

const TRACK_SECTIONS = ['T-01A', 'T-02B', 'T-03C', 'T-04D', 'T-05E', 'T-06F', 'T-07G', 'T-08H'];
const TRAIN_IDS = ['TRN-2201', 'TRN-4452', 'TRN-8871', 'TRN-3390', 'TRN-1123', 'TRN-7765', 'TRN-5544'];
const SEVERITIES = ['Critical', 'Warning', 'Normal'];
const SEVERITY_WEIGHTS = [0.2, 0.35, 0.45];

const ALERT_MESSAGES = {
  Critical: [
    'Signal failure detected — immediate halt required',
    'Track occupancy anomaly — collision risk',
    'Overspeed violation on restricted zone',
    'Communication blackout with signal tower',
  ],
  Warning: [
    'Delayed signal acknowledgment from driver',
    'Degraded braking performance detected',
    'Track switch malfunction — monitoring',
    'Weather advisory: reduced visibility zone',
  ],
  Normal: [
    'Train cleared section — signal reset',
    'Scheduled maintenance window active',
    'Signal health nominal — routine scan',
    'Handoff to next section complete',
  ],
};

function pickSeverity() {
  const r = Math.random();
  let cum = 0;
  for (let i = 0; i < SEVERITY_WEIGHTS.length; i++) {
    cum += SEVERITY_WEIGHTS[i];
    if (r < cum) return SEVERITIES[i];
  }
  return 'Normal';
}

function generateAlert(id) {
  const severity = pickSeverity();
  const messages = ALERT_MESSAGES[severity];
  return {
    id,
    trainId: TRAIN_IDS[Math.floor(Math.random() * TRAIN_IDS.length)],
    track: TRACK_SECTIONS[Math.floor(Math.random() * TRACK_SECTIONS.length)],
    severity,
    message: messages[Math.floor(Math.random() * messages.length)],
    timestamp: new Date(),
  };
}

const severityConfig = {
  Critical: {
    color: 'text-red-400',
    bg: 'bg-red-500/10',
    border: 'border-red-500/30',
    dot: 'bg-red-400',
    glow: 'shadow-[0_0_12px_rgba(239,68,68,0.25)]',
    icon: AlertCircle,
    badge: 'bg-red-500/20 text-red-400',
  },
  Warning: {
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/30',
    dot: 'bg-yellow-400',
    glow: '',
    icon: AlertTriangle,
    badge: 'bg-yellow-500/20 text-yellow-400',
  },
  Normal: {
    color: 'text-[#00ff88]',
    bg: 'bg-[#00ff88]/5',
    border: 'border-[#00ff88]/20',
    dot: 'bg-[#00ff88]',
    glow: '',
    icon: CheckCircle,
    badge: 'bg-[#00ff88]/15 text-[#00ff88]',
  },
};

export default function AlertFeed({ onAlertClick }) {
  const [alerts, setAlerts] = useState(() =>
    Array.from({ length: 8 }, (_, i) => generateAlert(i))
  );
  const counterRef = useRef(100);
  const listRef = useRef(null);

  useEffect(() => {
    const interval = setInterval(() => {
      const newAlert = generateAlert(counterRef.current++);
      setAlerts(prev => [newAlert, ...prev].slice(0, 40));
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  // auto-scroll to top on new alert
  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = 0;
  }, [alerts.length]);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Radio className="w-4 h-4 text-[#00ff88]" />
          <h2 className="text-sm font-semibold text-white tracking-wide">Live Alert Feed</h2>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00ff88] animate-pulse" />
            <span className="text-[10px] text-[#00ff88] font-medium">LIVE</span>
          </span>
        </div>
        <span className="text-xs text-gray-500">{alerts.length} events</span>
      </div>

      {/* Feed */}
      <div
        ref={listRef}
        className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-thin"
        style={{ maxHeight: '320px' }}
      >
        {alerts.map((alert, idx) => {
          const cfg = severityConfig[alert.severity];
          const Icon = cfg.icon;
          const isCritical = alert.severity === 'Critical';
          return (
            <div
              key={alert.id}
              onClick={() => isCritical && onAlertClick(alert)}
              className={`flex items-start gap-3 p-3 rounded-xl border transition-all duration-300
                ${cfg.bg} ${cfg.border} ${cfg.glow}
                ${isCritical ? 'cursor-pointer hover:border-red-400/60 hover:bg-red-500/15 active:scale-[0.99]' : ''}
                ${idx === 0 ? 'animate-[fadeSlideIn_0.3s_ease]' : ''}
              `}
            >
              {/* Icon */}
              <div className="mt-0.5 shrink-0">
                <Icon className={`w-4 h-4 ${cfg.color}`} />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-white">{alert.trainId}</span>
                  <span className="text-xs text-gray-500">·</span>
                  <span className="text-xs text-gray-400 font-mono">{alert.track}</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${cfg.badge}`}>
                    {alert.severity}
                  </span>
                  {isCritical && (
                    <span className="text-[9px] text-red-400/70 italic">click for details →</span>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-1 leading-relaxed">{alert.message}</p>
              </div>

              {/* Timestamp */}
              <span className="text-[10px] text-gray-600 shrink-0 font-mono mt-0.5">
                {alert.timestamp.toLocaleTimeString()}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
