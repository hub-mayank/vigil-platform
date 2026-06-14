export default function Sidebar() {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      width: '210px', height: '100%',
      borderRight: '1px solid #1f2937',
      padding: '20px 16px',
      backgroundColor: '#0d1321',
      flexShrink: 0
    }}>

      {/* Logo */}
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        gap: '6px', paddingBottom: '18px',
        borderBottom: '1px solid #1f2937', marginBottom: '20px'
      }}>
        <img src="/src/assets/vigil-icon.png" alt="VIGIL"
          style={{height: '46px', width: 'auto'}} />
        <div style={{
          fontSize: '10px', fontWeight: '700',
          letterSpacing: '0.2em', color: '#6b9e7a'
        }}>NAVADHARA</div>
      </div>

      {/* Modules label */}
      <div style={{
        fontSize: '10px', fontWeight: '600', letterSpacing: '0.14em',
        color: '#6b7280', marginBottom: '12px', paddingLeft: '2px'
      }}>MODULES</div>

      {/* RailMind */}
      <div style={{
        display: 'flex', flexDirection: 'column', gap: '6px',
        padding: '12px 14px', borderRadius: '8px',
        backgroundColor: '#071f12',
        border: '1px solid #00ff8855',
        boxShadow: '0 0 12px #00ff8815',
        marginBottom: '10px'
      }}>
        <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
          <div style={{
            width: '7px', height: '7px', borderRadius: '50%',
            backgroundColor: '#00ff88', boxShadow: '0 0 5px #00ff88',
            flexShrink: 0
          }}/>
          <span style={{fontSize: '13px', fontWeight: '700', color: '#00ff88'}}>RailMind</span>
        </div>
        <div style={{fontSize: '11px', color: '#9ca3af', paddingLeft: '15px'}}>
          Railway Intelligence
        </div>
        <div style={{
          fontSize: '10px', fontWeight: '600', padding: '2px 8px',
          borderRadius: '99px', backgroundColor: '#00ff8818',
          color: '#00ff88', width: 'fit-content',
          marginLeft: '15px', letterSpacing: '0.08em'
        }}>ACTIVE</div>
      </div>

      {/* OrbitMind */}
      <div style={{
        display: 'flex', flexDirection: 'column', gap: '6px',
        padding: '12px 14px', borderRadius: '8px',
        backgroundColor: '#0e1117',
        border: '1px solid #2d3748',
        marginBottom: '10px'
      }}>
        <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
          <div style={{
            width: '7px', height: '7px', borderRadius: '50%',
            backgroundColor: '#4b5563', flexShrink: 0
          }}/>
          <span style={{fontSize: '13px', fontWeight: '700', color: '#4b5563'}}>OrbitMind</span>
        </div>
        <div style={{fontSize: '11px', color: '#4b5563', paddingLeft: '15px'}}>
          Aerospace Intelligence
        </div>
        <div style={{
          fontSize: '10px', fontWeight: '600', padding: '2px 8px',
          borderRadius: '99px', backgroundColor: '#1f2937',
          color: '#6b7280', width: 'fit-content',
          marginLeft: '15px', letterSpacing: '0.08em'
        }}>ROUND 2</div>
      </div>

      {/* Footer */}
      <div style={{marginTop: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px'}}>
        <div style={{fontSize: '10px', color: '#374151', textAlign: 'center'}}>Team Navadhara</div>
        <div style={{fontSize: '10px', color: '#374151', textAlign: 'center'}}>Far Away 2026</div>
      </div>
    </div>
  )
}