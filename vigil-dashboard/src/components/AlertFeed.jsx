import { useVigilStream } from '../VigilStreamProvider';

const severityConfig = {
  Critical: {
    leftBorder:  '#ef4444',
    cardBorder:  '#ef444430',
    badgeBg:     'rgba(239,68,68,0.12)',
    badgeColor:  '#ef4444',
    label:       'CRITICAL',
  },
  Warning: {
    leftBorder:  '#f59e0b',
    cardBorder:  '#f59e0b30',
    badgeBg:     'rgba(245,158,11,0.12)',
    badgeColor:  '#f59e0b',
    label:       'WARNING',
  },
  Normal: {
    leftBorder:  '#00ff88',
    cardBorder:  '#00ff8820',
    badgeBg:     'rgba(0,255,136,0.08)',
    badgeColor:  '#00ff88',
    label:       'NORMAL',
  },
};

export default function AlertFeed({ onAlertClick }) {
  const { alerts, connected } = useVigilStream();

  return (
    <div style={{
      backgroundColor: '#111827',
      border: '1px solid #1f2937',
      borderRadius: '8px',
      padding: '16px',
      height: '100%',
      overflowY: 'auto',
      display: 'flex',
      flexDirection: 'column',
      gap: 0,
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', marginBottom: '12px',
        flexShrink: 0,
      }}>
        <h2 style={{
          fontSize: '10px', fontWeight: '600',
          color: '#9ca3af', letterSpacing: '0.1em', margin: 0,
        }}>LIVE ALERT FEED</h2>
        <span style={{
          fontSize: '11px', fontWeight: '500',
          color: connected ? '#00ff88' : '#6b7280',
        }}>
          {connected ? '● LIVE' : '○ CONNECTING…'}
        </span>
      </div>

      {/* Cards list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {alerts.length === 0 && (
          <p style={{ color: '#6b7280', fontSize: '13px' }}>
            Waiting for sensor data from RailMind backend…
          </p>
        )}

        {alerts.map(alert => {
          const cfg = severityConfig[alert.severity] || severityConfig.Normal;
          const clickable = alert.severity === 'Critical';

          return (
            <div
              key={alert.id}
              onClick={() => clickable && onAlertClick && onAlertClick(alert)}
              style={{
                backgroundColor: '#0a0f1e',
                border: `1px solid ${cfg.cardBorder}`,
                borderLeft: `3px solid ${cfg.leftBorder}`,
                borderRadius: '6px',
                padding: '10px 12px',
                minHeight: '72px',
                cursor: clickable ? 'pointer' : 'default',
                transition: 'background-color 0.15s',
                display: 'flex',
                flexDirection: 'column',
                gap: '3px',
              }}
              onMouseEnter={e => { if (clickable) e.currentTarget.style.backgroundColor = '#161e33' }}
              onMouseLeave={e => { if (clickable) e.currentTarget.style.backgroundColor = '#0a0f1e' }}
            >
              {/* Row 1 — Badge + Timestamp */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{
                  fontSize: '10px', fontWeight: '700',
                  padding: '2px 7px', borderRadius: '4px',
                  backgroundColor: cfg.badgeBg,
                  color: cfg.badgeColor,
                  letterSpacing: '0.06em',
                }}>
                  {cfg.label}
                </span>
                <span style={{ fontSize: '10px', color: '#6b7280' }}>
                  {alert.timestamp}
                </span>
              </div>

              {/* Row 2 — Single label: real train number → fallback to slot if absent */}
              <p style={{
                margin: 0, fontSize: '13px',
                fontWeight: '600', color: '#ffffff',
                lineHeight: 1.3,
              }}>
                {alert.real_train_number} — {alert.real_station_name}
              </p>

              {/* Row 4 — Click hint for Critical */}
              {clickable && (
                <p style={{ margin: 0, fontSize: '10px', color: '#6b7280', marginTop: '2px' }}>
                  Click to view details →
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}