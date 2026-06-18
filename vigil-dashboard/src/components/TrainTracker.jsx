import { useState, useEffect, useRef } from 'react'
import { useVigilStream } from '../VigilStreamProvider'

const sevColor  = (s) => s === 'Critical' ? '#ef4444' : s === 'Warning' ? '#f59e0b' : '#00ff88'
const agentColor = (a) => a === 'WatchAgent' ? '#378ADD' : a === 'AlertAgent' ? '#f59e0b' : '#00ff88'

// Derive a simple agent label from the live reading — no random simulation.
function deriveAgentState(reading) {
  if (!reading.is_anomaly) {
    return { agent: 'WatchAgent', action: 'Scanning sensor data...' }
  }
  if (reading.severity === 'Critical') {
    return { agent: 'ActionAgent', action: 'Maintenance team alerted.' }
  }
  return { agent: 'AlertAgent', action: 'Warning logged. Watching.' }
}

export default function TrainTracker() {
  const { latest } = useVigilStream()

  // trainMapRef: Map<trainId, entry> — insertion order = oldest first,
  // so the most recently updated train is always at the end.
  const trainMapRef = useRef(new Map())
  const [states, setStates] = useState([])

  useEffect(() => {
    if (!latest || !latest.train_id) return

    const { agent, action } = deriveAgentState(latest)

    const entry = {
      trainId:         latest.train_id,
      realTrainNumber: latest.real_train_number || latest.train_id,
      section:         latest.track_section,
      realStationName: latest.real_station_name || latest.track_section,
      severity:        latest.severity || 'Normal',
      agent,
      action,
      updatedAt:       new Date().toLocaleTimeString(),
    }

    // Remove then re-add to move to "most recently seen" position (end of Map)
    trainMapRef.current.delete(entry.trainId)
    trainMapRef.current.set(entry.trainId, entry)

    // Cap at 12 visible cards — evict the oldest (first) entry
    while (trainMapRef.current.size > 12) {
      const firstKey = trainMapRef.current.keys().next().value
      trainMapRef.current.delete(firstKey)
    }

    setStates(Array.from(trainMapRef.current.values()))
  }, [latest])

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
        {states.length === 0 && (
          <div style={{ fontSize: '11px', color: '#4b5563', padding: '8px 0' }}>
            Waiting for stream data…
          </div>
        )}

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
            {/* Row 1 — Real Train Number + Severity badge */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', fontWeight: '700', color: '#ffffff' }}>
                {train.realTrainNumber}
              </span>
              <span style={{
                fontSize: '9px', fontWeight: '600',
                padding: '1px 6px', borderRadius: '99px',
                backgroundColor: sevColor(train.severity) + '18',
                color: sevColor(train.severity)
              }}>{train.severity}</span>
            </div>

            {/* Row 2 — Real Station Name (single label: real value → slot fallback) */}
            <div style={{ fontSize: '10px', color: '#6b7280' }}>
              📍 {train.realStationName}
            </div>

            {/* Row 3 — Agent dot + name */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <div style={{
                width: '5px', height: '5px', borderRadius: '50%',
                backgroundColor: agentColor(train.agent), flexShrink: 0
              }}/>
              <span style={{ fontSize: '10px', fontWeight: '600', color: agentColor(train.agent) }}>
                {train.agent}
              </span>
            </div>

            {/* Row 4 — Action */}
            <div style={{ fontSize: '10px', color: '#c9d1d9', lineHeight: '1.3' }}>
              {train.action}
            </div>

            {/* Row 5 — Timestamp */}
            <div style={{ fontSize: '9px', color: '#4b5563' }}>
              {train.updatedAt}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}