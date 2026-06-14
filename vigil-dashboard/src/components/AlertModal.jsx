export default function AlertModal({ alert, onClose }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 50,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      backgroundColor: 'rgba(0,0,0,0.75)',
      backdropFilter: 'blur(4px)'
    }}>
      <div style={{
        width: '420px',
        backgroundColor: '#0d1321',
        border: '1px solid #ef444460',
        borderRadius: '14px',
        overflow: 'hidden',
        boxShadow: '0 0 40px #ef444420'
      }}>

        {/* Modal header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 20px',
          borderBottom: '1px solid #1f2937',
          backgroundColor: '#110a0a'
        }}>
          <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
            <div style={{
              width: '8px', height: '8px', borderRadius: '50%',
              backgroundColor: '#ef4444', boxShadow: '0 0 8px #ef4444'
            }}/>
            <span style={{
              fontSize: '13px', fontWeight: '700',
              color: '#ef4444', letterSpacing: '0.08em'
            }}>CRITICAL ALERT</span>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none', border: 'none',
              color: '#6b7280', fontSize: '18px',
              cursor: 'pointer', lineHeight: 1,
              padding: '2px 6px', borderRadius: '4px'
            }}
          >✕</button>
        </div>

        {/* Alert details */}
        <div style={{padding: '20px'}}>
          <div style={{
            display: 'flex', flexDirection: 'column', gap: '10px',
            marginBottom: '16px'
          }}>
            {[
              ['Train ID', alert.trainId, '#ffffff'],
              ['Section', alert.section, '#ffffff'],
              ['Severity', 'CRITICAL', '#ef4444'],
              ['Detected at', alert.time, '#9ca3af'],
            ].map(([label, value, valueColor]) => (
              <div key={label} style={{
                display: 'flex', justifyContent: 'space-between',
                alignItems: 'center',
                padding: '8px 12px',
                borderRadius: '6px',
                backgroundColor: '#111827'
              }}>
                <span style={{fontSize: '12px', color: '#6b7280'}}>{label}</span>
                <span style={{fontSize: '12px', fontWeight: '600', color: valueColor}}>{value}</span>
              </div>
            ))}
          </div>

          {/* Agent recommendation */}
          <div style={{
            padding: '14px',
            borderRadius: '8px',
            backgroundColor: '#071f12',
            border: '1px solid #00ff8830',
            marginBottom: '16px'
          }}>
            <div style={{
              fontSize: '10px', fontWeight: '700',
              color: '#00ff88', letterSpacing: '0.1em',
              marginBottom: '8px'
            }}>ACTIONAGENT RECOMMENDATION</div>
            <div style={{fontSize: '13px', color: '#d1d5db', lineHeight: '1.5'}}>
              {alert.action}
            </div>
          </div>

          {/* Button */}
          <button
            onClick={onClose}
            style={{
              width: '100%', padding: '11px',
              borderRadius: '8px', border: 'none',
              backgroundColor: '#00ff88', color: '#0a0f1e',
              fontSize: '13px', fontWeight: '700',
              letterSpacing: '0.06em', cursor: 'pointer',
            }}
          >MARK RESOLVED</button>
        </div>
      </div>
    </div>
  )
}