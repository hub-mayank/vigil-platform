import { useContext } from 'react'
import { VigilStreamContext } from '../VigilStreamProvider'

const severityColor = (s) =>
  s === 'Critical' ? '#ef4444' : s === 'Warning' ? '#f59e0b' : '#00ff88'

export default function AlertFeed({ onAlertClick }) {
  let alerts      = []
  let connected   = false
  let reconnecting = false

  try {
    const ctx = useContext(VigilStreamContext)
    alerts       = ctx?.alerts       || []
    connected    = ctx?.connected    || false
    reconnecting = ctx?.reconnecting || false
  } catch {
    // Context not available — safe default
  }

  // Status dot: green when live, amber when reconnecting, red when offline
  const dotColor  = connected ? '#00ff88' : reconnecting ? '#f59e0b' : '#ef4444'
  const dotShadow = connected ? '0 0 5px #00ff88' : reconnecting ? '0 0 5px #f59e0b' : '0 0 5px #ef4444'
  const statusLabel = connected ? 'LIVE' : reconnecting ? 'RECONNECTING' : 'OFFLINE'
  const statusClass = connected ? 'live-badge' : ''

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100%',
      borderRadius: '10px', border: '1px solid #1f2937',
      padding: '14px 12px', backgroundColor: '#111827', overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: '10px', flexShrink: 0
      }}>
        <div style={{ fontSize: '10px', fontWeight: '600', letterSpacing: '0.1em', color: '#9ca3af' }}>
          LIVE ALERT FEED
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <div
            className={statusClass}
            style={{
              width: '6px', height: '6px', borderRadius: '50%',
              backgroundColor: dotColor,
              boxShadow: dotShadow,
            }}
          />
          <span
            className={statusClass}
            style={{ fontSize: '9px', fontWeight: '600', letterSpacing: '0.06em', color: dotColor }}
          >
            {statusLabel}
          </span>
        </div>
      </div>

      {/* Alert list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', overflowY: 'auto', flex: 1 }}>
        {alerts.length === 0 && (
          <div style={{
            fontSize: '11px', color: '#4b5563', textAlign: 'center',
            marginTop: '24px', lineHeight: '1.6'
          }}>
            {connected
              ? 'Waiting for sensor events…'
              : reconnecting
                ? 'Attempting to reconnect…'
                : 'Backend offline. Start ngrok + uvicorn.'}
          </div>
        )}

        {alerts.map((alert, i) => (
          <div
            key={alert.id || i}
            onClick={() => alert.severity === 'Critical' && onAlertClick && onAlertClick(alert)}
            className={`alert-card-enter ${alert.severity === 'Critical' ? 'alert-critical' : ''}`}
            style={{
              display: 'flex', flexDirection: 'column', gap: '2px',
              padding: '7px 10px', borderRadius: '6px',
              backgroundColor: '#0d1321',
              border: '1px solid ' + severityColor(alert.severity) + '20',
              borderLeft: '2px solid ' + severityColor(alert.severity),
              cursor: alert.severity === 'Critical' ? 'pointer' : 'default',
              flexShrink: 0,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{
                fontSize: '10px', fontWeight: '700',
                color: severityColor(alert.severity), letterSpacing: '0.04em'
              }}>
                {(alert.severity || 'NORMAL').toUpperCase()}
              </span>
              <span style={{ fontSize: '10px', color: '#6b7280' }}>
                {alert.timestamp || alert.time || '—'}
              </span>
            </div>

            <div style={{ fontSize: '11px', color: '#c9d1d9', fontWeight: '400' }}>
              {alert.train_id} — {alert.track_section}
            </div>

            {alert.severity === 'Critical' && (
              <div style={{ fontSize: '10px', color: '#6b7280' }}>Click to view details →</div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}