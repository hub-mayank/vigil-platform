import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer } from 'recharts';
import { useVigilStream } from '../VigilStreamProvider';

export default function HealthChart() {
  const { history } = useVigilStream();
  const latestScore = history.length ? history[history.length - 1].score : null;

  // Color the live score by zone, so the headline number tells the story too
  const scoreColor =
    latestScore === null ? '#9ca3af'
    : latestScore >= 75 ? '#00ff88'
    : latestScore >= 50 ? '#f59e0b'
    : '#ef4444';

  return (
    <div style={{
      backgroundColor: '#111827',
      border: '1px solid #1f2937',
      borderRadius: '8px',
      padding: '16px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
        <h2 style={{
          fontSize: '10px', fontWeight: '600',
          color: '#9ca3af', letterSpacing: '0.1em',
          margin: 0,
        }}>NETWORK SIGNAL HEALTH SCORE</h2>
        {latestScore !== null && (
          <span style={{ fontSize: '14px', fontWeight: '700', color: scoreColor }}>
            ● {latestScore}%
          </span>
        )}
      </div>

      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={history}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
          <XAxis dataKey="time" stroke="#9ca3af" fontSize={10} minTickGap={40} />
          <YAxis domain={[0, 100]} stroke="#9ca3af" fontSize={10} />
          <Tooltip
            contentStyle={{ background: '#0a0f1e', border: '1px solid #1f2937', fontSize: '12px' }}
            labelStyle={{ color: '#9ca3af' }}
          />
          {/* Good / Warning threshold guides */}
          <ReferenceLine y={75} stroke="#00ff88" strokeDasharray="4 4" strokeOpacity={0.4} />
          <ReferenceLine y={50} stroke="#ef4444" strokeDasharray="4 4" strokeOpacity={0.4} />
          <Line
            type="monotone"
            dataKey="score"
            stroke={scoreColor}
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}