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

  // mapOpen state removed — RailNetworkMap owns its own expand/collapse internally

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

        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          <Sidebar />

          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>

            {/* Header */}
            <div style={{
              display: 'flex', alignItems: 'center',
              justifyContent: 'space-between',
              padding: '14px 28px',
              borderBottom: '1px solid #1a2535',
              backgroundColor: '#0b1120',
              minHeight: '62px', flexShrink: 0
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                <div style={{
                  fontSize: '21px', fontWeight: '700',
                  letterSpacing: '0.22em', color: '#dedad4', lineHeight: 1
                }}>VIGiL</div>
                <div style={{
                  fontSize: '9px', letterSpacing: '0.18em',
                  color: '#5a8a6a', fontWeight: '500'
                }}>INTELLIGENCE THAT PROTECTS</div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '22px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div className="status-dot" style={{
                    width: '7px', height: '7px', borderRadius: '50%',
                    backgroundColor: '#00ff88', boxShadow: '0 0 7px #00ff88'
                  }} />
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
                  {/* Agent Log — 38% width */}
                  <div style={{ flex: '0 0 38%', overflow: 'hidden' }}>
                    <AgentLog />
                  </div>

                  {/* Rail Network Map — 62% width */}
                  <div style={{ flex: 1, overflow: 'hidden', minWidth: 0, display: 'flex', flexDirection: 'column' }}>
                    <RailNetworkMap />
                  </div>
                </div>
              </div>

              {/* Right column — Alert Feed */}
              <div style={{ width: '300px', flexShrink: 0, overflow: 'hidden' }}>
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

        {/* NOTE: Map fullscreen modal removed from here.
            RailNetworkMap.jsx now owns its own expand overlay (position: fixed).
            This means it always renders correctly above everything, including
            the TrainTracker bar at the bottom. */}

      </div>
    </VigilStreamProvider>
  )
}