import { useEffect, useRef, useState, useCallback } from 'react'
import { useVigilStream } from '../VigilStreamProvider'

const SECTION_CITIES = {
  SECTION_A: { name: 'New Delhi',   lat: 28.6139, lng: 77.2090 },
  SECTION_B: { name: 'Lucknow',     lat: 26.8467, lng: 80.9462 },
  SECTION_C: { name: 'Kolkata',     lat: 22.5726, lng: 88.3639 },
  SECTION_D: { name: 'Patna',       lat: 25.5941, lng: 85.1376 },
  SECTION_E: { name: 'Hyderabad',   lat: 17.3850, lng: 78.4867 },
  SECTION_F: { name: 'Chennai',     lat: 13.0827, lng: 80.2707 },
  SECTION_G: { name: 'Mumbai',      lat: 19.0760, lng: 72.8777 },
  SECTION_H: { name: 'Ahmedabad',   lat: 23.0225, lng: 72.5714 },
  SECTION_I: { name: 'Nagpur',      lat: 21.1458, lng: 79.0882 },
  SECTION_J: { name: 'Pune',        lat: 18.5204, lng: 73.8567 },
}

const CONNECTIONS = [
  ['SECTION_A', 'SECTION_B'],
  ['SECTION_A', 'SECTION_H'],
  ['SECTION_B', 'SECTION_D'],
  ['SECTION_B', 'SECTION_I'],
  ['SECTION_D', 'SECTION_C'],
  ['SECTION_I', 'SECTION_C'],
  ['SECTION_I', 'SECTION_E'],
  ['SECTION_I', 'SECTION_G'],
  ['SECTION_H', 'SECTION_G'],
  ['SECTION_G', 'SECTION_J'],
  ['SECTION_J', 'SECTION_E'],
  ['SECTION_E', 'SECTION_F'],
  ['SECTION_F', 'SECTION_C'],
]

const getSeverityColor = (s) =>
  s === 'Critical' ? '#ef4444' : s === 'Warning' ? '#f59e0b' : '#00ff88'

// Escape characters that have special meaning in HTML.
// Used before injecting backend-supplied strings into Leaflet template-literal HTML.
function escHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const DARK_TILES = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'

function makeIcon(L, color, pulse = false) {
  return L.divIcon({
    className: '',
    html: `
      <div style="position:relative;width:16px;height:16px;">
        ${pulse ? `
          <div style="
            position:absolute;inset:-4px;border-radius:50%;
            background:${color};opacity:0.15;
            animation:vigil-pulse 1.5s ease-out infinite;
          "></div>
        ` : ''}
        <div style="
          position:absolute;inset:0;border-radius:50%;
          background:${color};opacity:0.2;
        "></div>
        <div style="
          position:absolute;inset:3px;border-radius:50%;
          background:${color};
          box-shadow:0 0 8px ${color};
        "></div>
      </div>
    `,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  })
}

function makeTooltip(section, city, severity, trainId, color) {
  return `
    <div style="
      background:#0d1321;border:1px solid #1f2937;
      border-left:2px solid ${escHtml(color)};
      border-radius:6px;padding:8px 12px;
      color:#fff;font-size:11px;
      font-family:Inter,sans-serif;min-width:130px;
    ">
      <div style="font-weight:700;color:${escHtml(color)};margin-bottom:2px;">${escHtml(section)}</div>
      <div style="color:#c9d1d9;font-size:12px;font-weight:600;">${escHtml(city)}</div>
      <div style="color:#6b7280;font-size:10px;margin-top:2px;">${escHtml(trainId || '—')}</div>
      <div style="color:${escHtml(color)};font-weight:600;font-size:10px;margin-top:3px;">
        ${escHtml(severity.toUpperCase())}
      </div>
    </div>
  `
}

function useLeafletMap(containerRef, sections, interactive) {
  const instanceRef = useRef(null)
  const markersRef = useRef({})

  // Init map
  useEffect(() => {
    if (!containerRef.current || instanceRef.current) return
    let cancelled = false

    import('leaflet').then(L => {
      if (cancelled || !containerRef.current || instanceRef.current) return
      const map = L.map(containerRef.current, {
        center: [22.5, 80.5],
        zoom: interactive ? 5 : 4.5,
        zoomControl: interactive,
        attributionControl: false,
        scrollWheelZoom: interactive,
        dragging: interactive,
        touchZoom: interactive,
        doubleClickZoom: interactive,
        boxZoom: interactive,
        keyboard: interactive,
      })

      L.tileLayer(DARK_TILES, { subdomains: 'abcd', maxZoom: 19 }).addTo(map)

      // Draw connection lines
      CONNECTIONS.forEach(([from, to]) => {
        L.polyline(
          [[SECTION_CITIES[from].lat, SECTION_CITIES[from].lng],
           [SECTION_CITIES[to].lat,   SECTION_CITIES[to].lng]],
          { color: '#1e3a5f', weight: 1.5, opacity: 0.5, dashArray: '5 5' }
        ).addTo(map)
      })

      // Draw markers
      Object.entries(SECTION_CITIES).forEach(([section, city]) => {
        const color = '#00ff88'
        const marker = L.marker([city.lat, city.lng], {
          icon: makeIcon(L, color, false),
          interactive: interactive,
        })
          .addTo(map)
          .bindTooltip(
            makeTooltip(section, city.name, 'Normal', '—', color),
            { permanent: false, direction: 'top', offset: [0, -10],
              className: 'vigil-tooltip', opacity: 1 }
          )

        markersRef.current[section] = marker
      })

      instanceRef.current = { map, L }
    })

    return () => {
      cancelled = true
      if (instanceRef.current) {
        instanceRef.current.map.remove()
        instanceRef.current = null
        markersRef.current = {}
      }
    }
  }, [interactive])

  // Update markers on data change
  useEffect(() => {
    if (!instanceRef.current) return
    const { L } = instanceRef.current

    Object.entries(SECTION_CITIES).forEach(([section, city]) => {
      const d = sections?.[section]
      const severity = d?.severity || 'Normal'
      const trainId = d?.train_id || '—'
      const color = getSeverityColor(severity)
      const marker = markersRef.current[section]
      if (!marker) return

      marker.setIcon(makeIcon(L, color, severity === 'Critical'))
      marker.setTooltipContent(makeTooltip(section, city.name, severity, trainId, color))
    })
  }, [sections])
}

// Stats bar counts
function getStats(sections) {
  let critical = 0, warning = 0, normal = 0
  Object.values(sections || {}).forEach(s => {
    if (s.severity === 'Critical') critical++
    else if (s.severity === 'Warning') warning++
    else normal++
  })
  const total = Object.keys(SECTION_CITIES).length
  normal += total - critical - warning - Object.keys(sections || {}).length
  return { critical, warning, normal: Math.max(0, normal) }
}

// ── Mini (locked) map ──────────────────────────────────────────────
function MiniMap({ sections, onExpand }) {
  const ref = useRef(null)
  const [hovered, setHovered] = useState(false)
  useLeafletMap(ref, sections, false)

  return (
    <div
      style={{
        position: 'relative', height: '100%', width: '100%',
        borderRadius: '8px', overflow: 'hidden',
        cursor: hovered ? 'pointer' : 'default',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onExpand}
    >
      <div ref={ref} style={{ width: '100%', height: '100%', pointerEvents: 'none' }} />

      {/* Expand hint overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        background: hovered ? 'rgba(10,15,30,0.55)' : 'transparent',
        transition: 'background 0.2s',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        borderRadius: '8px',
      }}>
        {hovered && (
          <div style={{
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', gap: '6px'
          }}>
            <div style={{
              fontSize: '22px', color: '#00ff88',
              textShadow: '0 0 10px #00ff88'
            }}>⤢</div>
            <div style={{
              fontSize: '11px', fontWeight: '600',
              color: '#00ff88', letterSpacing: '0.1em',
              textShadow: '0 0 8px #00ff88'
            }}>CLICK TO EXPAND MAP</div>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Full interactive modal map ─────────────────────────────────────
function FullMap({ sections, onClose }) {
  const ref = useRef(null)
  useLeafletMap(ref, sections, true)
  const stats = getStats(sections)

  // Close on ESC
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        backgroundColor: 'rgba(0,0,0,0.75)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '32px',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '85vw', height: '82vh',
          backgroundColor: '#0d1321',
          border: '1px solid #1f2937',
          borderRadius: '14px',
          overflow: 'hidden',
          display: 'flex', flexDirection: 'column',
          boxShadow: '0 24px 64px rgba(0,0,0,0.8)',
        }}
      >
        {/* Modal header */}
        <div style={{
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 20px',
          borderBottom: '1px solid #1f2937',
          backgroundColor: '#0b1120',
          flexShrink: 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              fontSize: '11px', fontWeight: '700',
              letterSpacing: '0.12em', color: '#9ca3af'
            }}>RAIL NETWORK RISK MAP — LIVE</div>

            {/* Stats */}
            <div style={{ display: 'flex', gap: '16px' }}>
              {[
                ['CRITICAL', stats.critical, '#ef4444'],
                ['WARNING',  stats.warning,  '#f59e0b'],
                ['NORMAL',   stats.normal,   '#00ff88'],
              ].map(([label, count, color]) => (
                <div key={label} style={{
                  display: 'flex', alignItems: 'center', gap: '6px'
                }}>
                  <div style={{
                    width: '8px', height: '8px', borderRadius: '50%',
                    backgroundColor: color, boxShadow: `0 0 5px ${color}`
                  }}/>
                  <span style={{ fontSize: '11px', color, fontWeight: '600' }}>
                    {count}
                  </span>
                  <span style={{ fontSize: '10px', color: '#6b7280' }}>
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              fontSize: '10px', color: '#6b7280',
              letterSpacing: '0.06em'
            }}>ESC or click outside to close</div>
            <button onClick={onClose} style={{
              background: 'none', border: '1px solid #1f2937',
              color: '#9ca3af', fontSize: '16px', cursor: 'pointer',
              padding: '4px 10px', borderRadius: '6px', lineHeight: 1
            }}>✕</button>
          </div>
        </div>

        {/* Legend bar */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '20px',
          padding: '8px 20px',
          borderBottom: '1px solid #1a2535',
          backgroundColor: '#0b1120',
          flexShrink: 0
        }}>
          <span style={{ fontSize: '10px', color: '#6b7280' }}>LEGEND:</span>
          {[['Normal','#00ff88'],['Warning','#f59e0b'],['Critical','#ef4444']].map(([l,c]) => (
            <div key={l} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <div style={{
                width: '8px', height: '8px', borderRadius: '50%',
                backgroundColor: c, boxShadow: `0 0 4px ${c}`
              }}/>
              <span style={{ fontSize: '10px', color: '#9ca3af' }}>{l}</span>
            </div>
          ))}
          <span style={{
            fontSize: '10px', color: '#6b7280', marginLeft: 'auto'
          }}>Hover over nodes to see section details</span>
        </div>

        {/* Map */}
        <div ref={ref} style={{ flex: 1 }} />
      </div>
    </div>
  )
}

// ── Main export ────────────────────────────────────────────────────
export default function RailNetworkMap() {
  const { sections } = useVigilStream()
  const [expanded, setExpanded] = useState(false)

  const handleExpand = useCallback(() => setExpanded(true),  [])
  const handleClose  = useCallback(() => setExpanded(false), [])

  const stats = getStats(sections)

  return (
    <>
      {/* Pulse animation */}
      <style>{`
        @keyframes vigil-pulse {
          0%   { transform: scale(1);   opacity: 0.15; }
          70%  { transform: scale(2.5); opacity: 0;    }
          100% { transform: scale(1);   opacity: 0;    }
        }
        .vigil-tooltip {
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
          padding: 0 !important;
        }
        .vigil-tooltip .leaflet-tooltip-tip { display: none !important; }
        .leaflet-container { background: #0a0f1e !important; }
        .leaflet-control-zoom {
          border: 1px solid #1f2937 !important;
          border-radius: 6px !important;
        }
        .leaflet-control-zoom a {
          background: #111827 !important;
          color: #9ca3af !important;
          border: none !important;
        }
        .leaflet-control-zoom a:hover {
          background: #1f2937 !important;
          color: #fff !important;
        }
        .leaflet-tile { filter: brightness(0.8) saturate(0.6); }
      `}</style>

      {/* Inline panel */}
      <div style={{
        borderRadius: '10px',
        border: '1px solid #1f2937',
        backgroundColor: '#0d1321',
        overflow: 'hidden',
        position: 'relative',
        height: '100%',
        minHeight: '320px',
        flexShrink: 0,
      }}>
        {/* Panel header */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0,
          zIndex: 500,
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 14px',
          background: 'linear-gradient(to bottom, #0d1321f0 0%, transparent 100%)',
          pointerEvents: 'none',
        }}>
          <div style={{
            fontSize: '10px', fontWeight: '600',
            letterSpacing: '0.1em', color: '#9ca3af'
          }}>RAIL NETWORK RISK MAP</div>
          <div style={{ display: 'flex', gap: '10px' }}>
            {[['C', stats.critical, '#ef4444'],
              ['W', stats.warning,  '#f59e0b'],
              ['N', stats.normal,   '#00ff88']].map(([l, c, col]) => (
              <div key={l} style={{ display:'flex', alignItems:'center', gap:'4px' }}>
                <div style={{
                  width:'6px', height:'6px', borderRadius:'50%',
                  backgroundColor: col, boxShadow: `0 0 3px ${col}`
                }}/>
                <span style={{ fontSize:'9px', color: col, fontWeight:'700' }}>{c}</span>
                <span style={{ fontSize:'9px', color:'#6b7280' }}>{l}</span>
              </div>
            ))}
          </div>
        </div>

        <MiniMap sections={sections} onExpand={handleExpand} />
      </div>

      {/* Full modal */}
      {expanded && <FullMap sections={sections} onClose={handleClose} />}
    </>
  )
}