import { useState, useEffect } from "react"
import { VigilStreamProvider } from './VigilStreamProvider'
import Sidebar from "./components/Sidebar"
import AlertFeed from "./components/AlertFeed"
import HealthChart from "./components/HealthChart"
import AgentLog from "./components/AgentLog"
import AlertModal from "./components/AlertModal"
import TrainTracker from "./components/TrainTracker"
import RailNetworkMap from "./components/RailNetworkMap"

export default function App() {
  const [activeAlert, setActiveAlert] = useState(null)
  const [resolvedIds, setResolvedIds] = useState(new Set())
  const [time, setTime] = useState(new Date())
  const [mapOpen, setMapOpen] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const handleResolve = (id) => {
    setResolvedIds(prev => new Set(prev).add(id))
    setActiveAlert(null)
  }

  return (
    <VigilStreamProvider url="http://localhost:8000/stream">
      <div style={{
        display: 'flex', height: '100vh', width: '100vw',
        overflow: 'hidden', flexDirection: 'column',
        backgroundColor: '#0a0f1e', color: '#ffffff',
        fontFamily: 'Inter, system-ui, sans-serif'
      }}>

        <div style={{display: 'flex', flex: 1, overflow: 'hidden'}}>
          <Sidebar />

          <div style={{display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden'}}>

            {/* Header — logo image removed, text only */}
            <div style={{
              display: 'flex', alignItems: 'center',
              justifyContent: 'space-between',
              padding: '14px 28px',
              borderBottom: '1px solid #1a2535',
              backgroundColor: '#0b1120',
              minHeight: '62px', flexShrink: 0
            }}>
              <div style={{display: 'flex', flexDirection: 'column', gap: '3px'}}>
                <div style={{
                  fontSize: '21px', fontWeight: '700',
                  letterSpacing: '0.22em', color: '#dedad4', lineHeight: 1
                }}>VIGiL</div>
                <div style={{
                  fontSize: '9px', letterSpacing: '0.18em',
                  color: '#5a8a6a', fontWeight: '500'
                }}>INTELLIGENCE THAT PROTECTS</div>
              </div>

              <div style={{display: 'flex', alignItems: 'center', gap: '22px'}}>
                <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                  <div style={{
                    width: '7px', height: '7px', borderRadius: '50%',
                    backgroundColor: '#00ff88', boxShadow: '0 0 7px #00ff88'
                  }}/>
                  <span style={{
                    fontSize: '11px', fontWeight: '600',
                    color: '#00ff88', letterSpacing: '0.08em'
                  }}>ALL SYSTEMS ACTIVE</span>
                </div>
                <div style={{
                  fontSize: '12px', color: '#8896a8',
                  fontVariantNumeric: 'tabular-nums', letterSpacing: '0.04em'
                }}>{time.toLocaleTimeString()}</div>
              </div>
            </div>

            {/* Main grid */}
            <div style={{
              display: 'flex', flex: 1, overflow: 'hidden',
              gap: '14px', padding: '14px', minHeight: 0
            }}>
              {/* Left column */}
              <div style={{
                display: 'flex', flexDirection: 'column',
                flex: 1, gap: '14px', overflow: 'hidden', minWidth: 0
              }}>
                <HealthChart />

                {/* AgentLog + Map side by side */}
                <div style={{
                  display: 'flex', gap: '14px',
                  flex: 1, overflow: 'hidden', minHeight: 0
                }}>
                  {/* Agent Log — 40% width */}
                  <div style={{flex: '0 0 38%', overflow: 'hidden'}}>
                    <AgentLog />
                  </div>

                  {/* Map — 60% width, clickable */}
                  <div
                    style={{flex: 1, overflow: 'hidden', position: 'relative', cursor: 'pointer'}}
                    onClick={() => setMapOpen(true)}
                    onMouseEnter={e => e.currentTarget.querySelector('.map-hint').style.opacity = 1}
                    onMouseLeave={e => e.currentTarget.querySelector('.map-hint').style.opacity = 0}
                  >
                    <RailNetworkMap />
                    <div className="map-hint" style={{
                      position: 'absolute', inset: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      backgroundColor: 'rgba(10,15,30,0.6)',
                      opacity: 0, transition: 'opacity 0.2s',
                      borderRadius: '8px', fontSize: '13px',
                      fontWeight: '600', color: '#00ff88',
                      letterSpacing: '0.08em'
                    }}>
                      ⊕ CLICK TO EXPAND MAP
                    </div>
                  </div>
                </div>
              </div>

              {/* Right column — Alert Feed */}
              <div style={{width: '300px', flexShrink: 0, overflow: 'hidden'}}>
                <AlertFeed onAlertClick={setActiveAlert} />
              </div>
            </div>

          </div>
        </div>

        {/* Train Tracker */}
        <TrainTracker />

        {/* Alert Modal */}
        {activeAlert && (
          <AlertModal
            alert={activeAlert}
            onClose={() => handleResolve(activeAlert.id)}
          />
        )}

        {/* Map Fullscreen Modal */}
        {mapOpen && (
          <div
            onClick={() => setMapOpen(false)}
            style={{
              position: 'fixed', inset: 0, zIndex: 999,
              backgroundColor: 'rgba(5,8,18,0.92)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: '32px'
            }}
          >
            <div
              onClick={e => e.stopPropagation()}
              style={{
                width: '85vw', maxWidth: '1000px',
                backgroundColor: '#111827',
                border: '1px solid #1f2937',
                borderRadius: '12px', padding: '24px',
                position: 'relative'
              }}
            >
              <button
                onClick={() => setMapOpen(false)}
                style={{
                  position: 'absolute', top: '16px', right: '16px',
                  background: 'none', border: '1px solid #374151',
                  color: '#9ca3af', borderRadius: '6px',
                  padding: '4px 10px', cursor: 'pointer',
                  fontSize: '12px', letterSpacing: '0.05em'
                }}
              >✕ CLOSE</button>
              <RailNetworkMap />
            </div>
          </div>
        )}

      </div>
    </VigilStreamProvider>
  )
}