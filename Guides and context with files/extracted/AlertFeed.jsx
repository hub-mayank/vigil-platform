import { useVigilStream } from './VigilStreamProvider';

const severityStyles = {
  Critical: { border: 'border-l-red-500', badge: 'bg-red-500/15 text-red-400', label: 'CRITICAL' },
  Warning:  { border: 'border-l-yellow-500', badge: 'bg-yellow-500/15 text-yellow-400', label: 'WARNING' },
  Normal:   { border: 'border-l-[#00ff88]', badge: 'bg-[#00ff88]/10 text-[#00ff88]', label: 'NORMAL' },
};

export default function AlertFeed({ onAlertClick }) {
  const { alerts, connected } = useVigilStream();

  return (
    <div className="bg-[#111827] border border-[#1f2937] rounded-lg p-4 h-full overflow-y-auto">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xs font-semibold text-gray-400 tracking-widest">LIVE ALERT FEED</h2>
        <span className={`text-xs font-medium ${connected ? 'text-[#00ff88]' : 'text-gray-500'}`}>
          {connected ? '● LIVE' : '○ CONNECTING…'}
        </span>
      </div>

      <div className="space-y-2">
        {alerts.length === 0 && (
          <p className="text-gray-500 text-sm">Waiting for sensor data from RailMind backend…</p>
        )}

        {alerts.map(alert => {
          const style = severityStyles[alert.severity] || severityStyles.Normal;
          const clickable = alert.severity === 'Critical';
          return (
            <div
              key={alert.id}
              onClick={() => clickable && onAlertClick && onAlertClick(alert)}
              className={`border-l-2 ${style.border} bg-[#0a0f1e] rounded-r p-3 transition-colors ${
                clickable ? 'cursor-pointer hover:bg-[#161e33]' : ''
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={`text-xs font-bold px-2 py-0.5 rounded ${style.badge}`}>
                  {style.label}
                </span>
                <span className="text-xs text-gray-500">{alert.timestamp}</span>
              </div>
              <p className="text-sm text-white font-medium">
                {alert.real_train_number} — {alert.real_station_name}
              </p>
              <p className="text-[10px] text-gray-600 mt-0.5">
                {alert.train_id} · {alert.track_section}
              </p>
              {clickable && (
                <p className="text-xs text-gray-400 mt-1">Click to view details →</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
