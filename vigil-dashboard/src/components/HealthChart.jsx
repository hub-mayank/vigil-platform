import { useState, useEffect, useRef } from "react"
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine
} from "recharts"

function getLineColor(score) {
  if (score >= 80) return '#00ff88'
  if (score >= 60) return '#f59e0b'
  return '#ef4444'
}

function CustomLine({ points, data }) {
  if (!points || points.length < 2) return null
  const segments = []
  for (let i = 0; i < points.length - 1; i++) {
    const score = data[i]?.score ?? 75
    segments.push(
      <line
        key={i}
        x1={points[i].x} y1={points[i].y}
        x2={points[i+1].x} y2={points[i+1].y}
        stroke={getLineColor(score)}
        strokeWidth={2.5}
        strokeLinecap="round"
      />
    )
  }
  return <g>{segments}</g>
}

export default function HealthChart() {
  const [data, setData] = useState(
    Array.from({length: 20}, (_, i) => ({
      t: i, score: Math.floor(Math.random() * 15 + 72)
    }))
  )
  const latestScore = data[data.length - 1]?.score ?? 75

  useEffect(() => {
    const interval = setInterval(() => {
      setData(prev => {
        const last = prev[prev.length - 1]
        const newScore = Math.max(40, Math.min(98,
          last.score + (Math.random() * 12 - 6)
        ))
        return [...prev.slice(-29), {t: last.t + 1, score: Math.round(newScore)}]
      })
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  const lineColor = getLineColor(latestScore)

  return (
    <div style={{
      borderRadius: '10px', border: '1px solid #1a2535',
      padding: '14px 18px', backgroundColor: '#0b1120', flexShrink: 0
    }}>
      <div style={{
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', marginBottom: '12px'
      }}>
        <div style={{
          fontSize: '10px', fontWeight: '600',
          letterSpacing: '0.1em', color: '#8896a8'
        }}>NETWORK SIGNAL HEALTH SCORE</div>
        <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
          <div style={{
            width: '7px', height: '7px', borderRadius: '50%',
            backgroundColor: lineColor,
            boxShadow: `0 0 6px ${lineColor}`,
            transition: 'background-color 1s, box-shadow 1s'
          }}/>
          <span style={{fontSize: '11px', fontWeight: '700', color: lineColor,
            transition: 'color 1s'
          }}>{latestScore}%</span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={190}>
        <LineChart data={data} margin={{top: 6, right: 10, bottom: 4, left: 0}}>
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1a2535" strokeWidth="0.5"/>
            </pattern>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1a2535" />
          <XAxis dataKey="t" hide />
          <YAxis
            domain={[0, 100]} stroke="#2d3748"
            tick={{fill: '#6b7280', fontSize: 10}} width={30}
            ticks={[0, 25, 50, 60, 75, 80, 100]}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#0d1321', border: '1px solid #1f2937',
              borderRadius: 6, fontSize: 11
            }}
            labelStyle={{color: '#9ca3af'}}
            itemStyle={{color: lineColor}}
            formatter={(val) => [`${val}%`, 'Health']}
          />

          {/* Green reference line — good zone */}
          <ReferenceLine
            y={80} stroke="#00ff8840"
            strokeDasharray="6 4" strokeWidth={1.5}
            label={{value: 'Good', position: 'insideTopRight', fill: '#00ff8880', fontSize: 9}}
          />

          {/* Red reference line — critical zone */}
          <ReferenceLine
            y={60} stroke="#ef444440"
            strokeDasharray="6 4" strokeWidth={1.5}
            label={{value: 'Weak', position: 'insideBottomRight', fill: '#ef444480', fontSize: 9}}
          />

          <Line
            type="monotone"
            dataKey="score"
            stroke={lineColor}
            strokeWidth={2.5}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}