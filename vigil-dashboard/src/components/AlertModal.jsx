export default function AlertModal({ alert, onClose }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 50,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      backgroundColor: 'rgba(0,0,0,0.45)'
    }}>
      <div style={{
        width: '400px',
        backgroundColor: '#0d1321',
        border: '1px solid #ef444455',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(0,0,0,0.6)'
      }}>

        {/* Header bar */}
        <div style={{
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 18px',
          backgroundColor: '#110a0a',
          borderBottom: '1px solid #1f2937'
        }}>
          <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
            <div style={{
              width: '7px', height: '7px', borderRadius: '50%',
              backgroundColor: '#ef4444',
              boxShadow: '0 0 7px #ef4444'
            }}/>
            <span style={{
              fontSize: '11px', fontWeight: '700',
              color: '#ef4444', letterSpacing: '0.1em'
            }}>CRITICAL ALERT</span>
          </div>
          <button onClick={onClose} style={{
            background: 'none', border: 'none',
            color: '#6b7280', fontSize: '16px',
            cursor: 'pointer', padding: '2px 6px',
            borderRadius: '4px', lineHeight: 1
          }}>✕</button>
        </div>

        {/* Body */}
        <div style={{padding: '18px'}}>

          {/* Train + Section */}
          <div style={{
            fontSize: '15px', fontWeight: '700',
            color: '#ffffff', marginBottom: '4px'
          }}>
            {alert.train_id || alert.trainId} — {alert.track_section || alert.section}
          </div>
          <div style={{
            fontSize: '11px', color: '#6b7280', marginBottom: '14px'
          }}>
            Detected {alert.time || alert.timestamp}
            {alert.anomaly_score ? ` · anomaly score ${Number(alert.anomaly_score).toFixed(2)}` : ''}
          </div>

          {/* Detail rows */}
          <div style={{display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px'}}>
            {[
              ['Severity', 'CRITICAL', '#ef4444'],
              ['Section', alert.track_section || alert.section, '#ffffff'],
              ['Train ID', alert.train_id || alert.trainId, '#ffffff'],
            ].map(([label, value, col]) => (
              <div key={label} style={{
                display: 'flex', justifyContent: 'space-between',
                alignItems: 'center', padding: '7px 12px',
                borderRadius: '6px', backgroundColor: '#111827'
              }}>
                <span style={{fontSize: '11px', color: '#6b7280'}}>{label}</span>
                <span style={{fontSize: '11px', fontWeight: '600', color: col}}>{value}</span>
              </div>
            ))}
          </div>

          {/* AI Recommendation */}
          <div style={{
            padding: '12px 14px', borderRadius: '8px',
            backgroundColor: '#071f12',
            border: '1px solid #00ff8825',
            marginBottom: '16px'
          }}>
            <div style={{
              fontSize: '9px', fontWeight: '700',
              color: '#00ff88', letterSpacing: '0.1em', marginBottom: '6px'
            }}>ACTIONAGENT RECOMMENDATION</div>
            <div style={{fontSize: '12px', color: '#d1d5db', lineHeight: '1.5'}}>
              {alert.recommended_action || alert.action || 'Reduce speed immediately. Dispatch maintenance team.'}
            </div>
          </div>

          {/* Button */}
          <button onClick={onClose} style={{
            width: '100%', padding: '10px',
            borderRadius: '7px', border: 'none',
            backgroundColor: '#00ff88', color: '#0a0f1e',
            fontSize: '12px', fontWeight: '700',
            letterSpacing: '0.06em', cursor: 'pointer'
          }}>MARK RESOLVED</button>

        </div>
      </div>
    </div>
  )
}