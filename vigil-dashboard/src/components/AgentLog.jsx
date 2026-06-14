import { useState, useEffect } from "react"

const messages = [
  { agent: 'WatchAgent', msg: 'Monitoring 50 active train sensors across 10 sections' },
  { agent: 'WatchAgent', msg: 'Signal voltage nominal on SECTION_A through SECTION_D' },
  { agent: 'WatchAgent', msg: 'Vibration levels within threshold on all active trains' },
  { agent: 'WatchAgent', msg: 'Speed nominal on TRAIN_007 — continuing surveillance' },
  { agent: 'WatchAgent', msg: 'Temperature within safe range across all monitored sections' },
  { agent: 'WatchAgent', msg: 'Cross-referencing signal latency on SECTION_B and SECTION_C' },
  { agent: 'AlertAgent', msg: 'Anomaly detected — TRAIN_023 voltage spike on SECTION_F' },
  { agent: 'AlertAgent', msg: 'Classifying severity — threshold breach confirmed: CRITICAL' },
  { agent: 'AlertAgent', msg: 'Warning: Temperature rising on TRAIN_041 engine sensor' },
  { agent: 'AlertAgent', msg: 'Deduplication: merged 2 duplicate alerts on SECTION_E' },
  { agent: 'AlertAgent', msg: 'Signal bounce detected on TRAIN_019 — flagging for review' },
  { agent: 'ActionAgent', msg: 'Recommendation: Reduce speed on SECTION_F immediately' },
  { agent: 'ActionAgent', msg: 'Dispatching maintenance alert to Section F control team' },
  { agent: 'ActionAgent', msg: 'Predictive flag logged for TRAIN_041 — schedule inspection' },
  { agent: 'ActionAgent', msg: 'Speed restriction order issued — Zone 2 active' },
  { agent: 'ActionAgent', msg: 'SMS advisory dispatched to Zone 4 controller' },
  { agent: 'ActionAgent', msg: 'Auto-resolved signal bounce on TRAIN_019 — resuming watch' },
]

const agentColor = (a) =>
  a === 'WatchAgent' ? '#378ADD' : a === 'AlertAgent' ? '#f59e0b' : '#00ff88'

export default function AgentLog() {
  const [logs, setLogs] = useState(
    messages.slice(0, 10).map((m, i) => ({...m, id: i}))
  )

  useEffect(() => {
    let i = 10
    const interval = setInterval(() => {
      const msg = messages[i % messages.length]
      setLogs(prev => [...prev.slice(-30), {...msg, id: Date.now()}])
      i++
    }, 2500)
    return () => clearInterval(interval)
  }, [])

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      flex: 1,
      borderRadius: '10px',
      border: '1px solid #1f2937',
      padding: '14px 18px',
      backgroundColor: '#111827',
      overflow: 'hidden',
      minHeight: 0
    }}>
      <div style={{
        fontSize: '10px',
        fontWeight: '600',
        letterSpacing: '0.1em',
        color: '#9ca3af',
        marginBottom: '10px',
        flexShrink: 0
      }}>
        AGENT ACTIVITY LOG
      </div>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '7px',
        overflowY: 'auto',
        flex: 1
      }}>
        {[...logs].reverse().map((log, i) => (
          <div key={log.id ?? i} style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '10px',
            fontSize: '11px',
            lineHeight: '1.45'
          }}>
            <span style={{
              fontWeight: '700',
              flexShrink: 0,
              width: '88px',
              color: agentColor(log.agent),
              fontSize: '11px'
            }}>
              {log.agent}
            </span>
            <span style={{color: '#c9d1d9'}}>{log.msg}</span>
          </div>
        ))}
      </div>
    </div>
  )
}