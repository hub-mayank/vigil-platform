import { useState, useEffect } from "react"

const trains = [
  'TRAIN_001','TRAIN_007','TRAIN_013','TRAIN_019',
  'TRAIN_023','TRAIN_031','TRAIN_042','TRAIN_050',
  'TRAIN_006','TRAIN_011','TRAIN_028','TRAIN_037'
]
const sections = ['SECTION_A','SECTION_B','SECTION_C','SECTION_D','SECTION_E','SECTION_F']
const agentActions = [
  { agent: 'WatchAgent', action: 'Scanning sensor data...', severity: 'Normal' },
  { agent: 'WatchAgent', action: 'Voltage nominal. Monitoring.', severity: 'Normal' },
  { agent: 'WatchAgent', action: 'Vibration spike detected.', severity: 'Warning' },
  { agent: 'AlertAgent', action: 'Classifying anomaly...', severity: 'Warning' },
  { agent: 'AlertAgent', action: 'CRITICAL threshold breach!', severity: 'Critical' },
  { agent: 'AlertAgent', action: 'Warning logged. Watching.', severity: 'Warning' },
  { agent: 'ActionAgent', action: 'Maintenance team alerted.', severity: 'Critical' },
  { agent: 'ActionAgent', action: 'Speed reduction advised.', severity: 'Critical' },
  { agent: 'ActionAgent', action: 'Inspection flag raised.', severity: 'Warning' },
  { agent: 'ActionAgent', action: 'All clear. Resuming watch.', severity: 'Normal' },
]

function randomTrainState(trainId) {
  const action = agentActions[Math.floor(Math.random() * agentActions.length)]
  return {
    trainId, section: sections[Math.floor(Math.random() * sections.length)],
    ...action, updatedAt: new Date().toLocaleTimeString(),
  }
}

const sevColor = (s) => s === 'Critical' ? '#ef4444' : s === 'Warning' ? '#f59e0b' : '#00ff88'
const agentColor = (a) => a === 'WatchAgent' ? '#378ADD' : a === 'AlertAgent' ? '#f59e0b' : '#00ff88'

export default function TrainTracker() {
  const [states, setStates] = useState(trains.map(id => randomTrainState(id)))

  useEffect(() => {
    const interval = setInterval(() => {
      setStates(prev => {
        const idx = Math.floor(Math.random() * prev.length)
        const updated = [...prev]
        updated[idx] = randomTrainState(updated[idx].trainId)
        return updated
      })
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div style={{
      borderTop: '1px solid #1f2937',
      padding: '8px 14px 10px',
      backgroundColor: '#0d1321', flexShrink: 0
    }}>
      <div style={{
        fontSize: '9px', fontWeight: '600', letterSpacing: '0.1em',
        color: '#6b7280', marginBottom: '8px'
      }}>ACTIVE TRAIN MONITORING — AGENT STATUS</div>

      <div style={{
        display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px',
        scrollbarWidth: 'thin', scrollbarColor: '#1f2937 transparent'
      }}>
        {states.map((train) => (
          <div key={train.trainId} style={{
            flexShrink: 0, width: '168px',
            display: 'flex', flexDirection: 'column', gap: '3px',
            padding: '8px 10px',
            borderRadius: '7px',
            backgroundColor: '#111827',
            border: '1px solid ' + sevColor(train.severity) + '30',
            borderLeft: '2px solid ' + sevColor(train.severity),
          }}>
            {/* Row 1 — Train ID + Severity badge */}
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
              <span style={{fontSize: '11px', fontWeight: '700', color: '#ffffff'}}>
                {train.trainId}
              </span>
              <span style={{
                fontSize: '9px', fontWeight: '600',
                padding: '1px 6px', borderRadius: '99px',
                backgroundColor: sevColor(train.severity) + '18',
                color: sevColor(train.severity)
              }}>{train.severity}</span>
            </div>

            {/* Row 2 — Section */}
            <div style={{fontSize: '10px', color: '#6b7280'}}>
              📍 {train.section}
            </div>

            {/* Row 3 — Agent dot + name */}
            <div style={{display: 'flex', alignItems: 'center', gap: '5px'}}>
              <div style={{
                width: '5px', height: '5px', borderRadius: '50%',
                backgroundColor: agentColor(train.agent), flexShrink: 0
              }}/>
              <span style={{fontSize: '10px', fontWeight: '600', color: agentColor(train.agent)}}>
                {train.agent}
              </span>
            </div>

            {/* Row 4 — Action */}
            <div style={{fontSize: '10px', color: '#c9d1d9', lineHeight: '1.3'}}>
              {train.action}
            </div>

            {/* Row 5 — Timestamp */}
            <div style={{fontSize: '9px', color: '#4b5563'}}>
              {train.updatedAt}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}