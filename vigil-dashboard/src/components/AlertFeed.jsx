import { useState, useEffect } from "react"

const trains = ['TRAIN_001','TRAIN_007','TRAIN_013','TRAIN_019','TRAIN_023','TRAIN_031','TRAIN_042','TRAIN_050']
const sections = ['SECTION_A','SECTION_B','SECTION_C','SECTION_D','SECTION_E','SECTION_F']
const severities = ['Critical','Critical','Warning','Warning','Warning','Normal','Normal','Normal']

function randomAlert() {
  const severity = severities[Math.floor(Math.random() * severities.length)]
  return {
    id: Date.now() + Math.random(),
    trainId: trains[Math.floor(Math.random() * trains.length)],
    section: sections[Math.floor(Math.random() * sections.length)],
    severity,
    time: new Date().toLocaleTimeString(),
    action: severity === 'Critical'
      ? 'Reduce speed immediately. Dispatch maintenance team.'
      : severity === 'Warning'
      ? 'Monitor closely. Flag for next inspection.'
      : 'All parameters nominal.',
  }
}

const color = (s) => s === 'Critical' ? '#ef4444' : s === 'Warning' ? '#f59e0b' : '#00ff88'

export default function AlertFeed({ onAlertClick }) {
  const [alerts, setAlerts] = useState(Array.from({length: 8}, () => randomAlert()))

  useEffect(() => {
    const interval = setInterval(() => {
      setAlerts(prev => [randomAlert(), ...prev].slice(0, 20))
    }, 2500)
    return () => clearInterval(interval)
  }, [])

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100%',
      borderRadius: '10px', border: '1px solid #1f2937',
      padding: '14px 12px', backgroundColor: '#111827', overflow: 'hidden'
    }}>
      <div style={{
        fontSize: '10px', fontWeight: '600', letterSpacing: '0.1em',
        color: '#9ca3af', marginBottom: '10px', flexShrink: 0
      }}>LIVE ALERT FEED</div>

      <div style={{display: 'flex', flexDirection: 'column', gap: '5px', overflowY: 'auto', flex: 1}}>
        {alerts.map(alert => (
          <div
            key={alert.id}
            onClick={() => alert.severity === 'Critical' && onAlertClick(alert)}
            style={{
              display: 'flex', flexDirection: 'column', gap: '2px',
              padding: '7px 10px',
              borderRadius: '6px',
              backgroundColor: '#0d1321',
              border: '1px solid ' + color(alert.severity) + '20',
              borderLeft: '2px solid ' + color(alert.severity),
              cursor: alert.severity === 'Critical' ? 'pointer' : 'default',
            }}
          >
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
              <span style={{
                fontSize: '10px', fontWeight: '600',
                color: color(alert.severity), letterSpacing: '0.04em'
              }}>
                {alert.severity.toUpperCase()}
              </span>
              <span style={{fontSize: '10px', color: '#6b7280'}}>{alert.time}</span>
            </div>
            <div style={{fontSize: '11px', color: '#c9d1d9', fontWeight: '400'}}>
              {alert.trainId} — {alert.section}
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