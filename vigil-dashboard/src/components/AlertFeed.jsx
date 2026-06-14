import { useContext } from 'react'
import { VigilStreamContext } from '../VigilStreamProvider'

const color = (s) => s === 'Critical' ? '#ef4444' : s === 'Warning' ? '#f59e0b' : '#00ff88'

export default function AlertFeed({ onAlertClick }) {
  let alerts = []
  let connected = false

  try {
    const ctx = useContext(VigilStreamContext)
    alerts = ctx?.alerts || []
    connected = ctx?.connected || false
  } catch(e) {
    alerts = []
    connected = false
  }

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100%',
      borderRadius: '10px', border: '1px solid #1f2937',
      padding: '14px 12px', backgroundColor: '#111827', overflow: 'hidden'
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: '10px', flexShrink: 0
      }}>
        <div style={{fontSize: '10px', fontWeight: '600', letterSpacing: '0.1em', color: '#9ca3af'}}>
          LIVE ALERT FEED
        </div>
        <div style={{display: 'flex', alignItems: 'center', gap: '5px'}}>
          <div className={connected ? 'live-badge' : ''} style={{
            width: '6px', height: '6px', borderRadius: '50%',
            backgroundColor: connected ? '#00ff88' : '#ef4444',
            boxShadow: connected ? '0 0 5px #00ff88' : '0 0 5px #ef4444'
          }}/>
          <span className={connected ? 'live-badge' : ''} style={{fontSize: '9px', fontWeight: '600', letterSpacing: '0.06em',
            color: connected ? '#00ff88' : '#ef4444'
          }}>{connected ? 'LIVE' : 'OFFLINE'}</span>
        </div>
      </div>

      <div style={{display: 'flex', flexDirection: 'column', gap: '5px', overflowY: 'auto', flex: 1}}>
        {alerts.map((alert, i) => (
          <div
            key={alert.id || i}
            onClick={() => alert.severity === 'Critical' && onAlertClick && onAlertClick(alert)}
            className={`alert-card-enter ${alert.severity === 'Critical' ? 'alert-critical' : ''}`}
            style={{
              display: 'flex', flexDirection: 'column', gap: '2px',
              padding: '7px 10px', borderRadius: '6px',
              backgroundColor: '#0d1321',
              border: '1px solid ' + color(alert.severity) + '20',
              borderLeft: '2px solid ' + color(alert.severity),
              cursor: alert.severity === 'Critical' ? 'pointer' : 'default',
              flexShrink: 0
            }}
          >
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
              <span style={{fontSize: '10px', fontWeight: '700',
                color: color(alert.severity), letterSpacing: '0.04em'
              }}>
                {(alert.severity || 'NORMAL').toUpperCase()}
              </span>
              <span style={{fontSize: '10px', color: '#6b7280'}}>
                {alert.time || new Date().toLocaleTimeString()}
              </span>
            </div>
            <div style={{fontSize: '11px', color: '#c9d1d9', fontWeight: '400'}}>
              {alert.train_id || alert.trainId} — {alert.track_section || alert.section}
            </div>
            {alert.severity === 'Critical' && (
              <div style={{fontSize: '10px', color: '#6b7280'}}>Click to view details →</div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}