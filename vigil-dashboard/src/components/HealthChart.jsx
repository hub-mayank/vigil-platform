import { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { Activity } from 'lucide-react';

function generatePoint(ts) {
  return {
    time: new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    score: Math.floor(60 + Math.random() * 38 + Math.sin(ts / 3000) * 5),
  };
}

const INITIAL_COUNT = 30;

function initialData() {
  const now = Date.now();
  return Array.from({ length: INITIAL_COUNT }, (_, i) =>
    generatePoint(now - (INITIAL_COUNT - i) * 2000)
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const val = payload[0].value;
  const color = val >= 80 ? '#00ff88' : val >= 60 ? '#facc15' : '#ef4444';
  return (
    <div className="bg-[#0d1424] border border-gray-700 rounded-lg px-3 py-2 text-xs shadow-xl">
      <p className="text-gray-400 mb-1">{label}</p>
      <p className="font-bold" style={{ color }}>Health: {val}</p>
    </div>
  );
};

export default function HealthChart() {
  const [data, setData] = useState(initialData);

  useEffect(() => {
    const interval = setInterval(() => {
      setData(prev => {
        const next = [...prev, generatePoint(Date.now())];
        return next.slice(-60);
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const latest = data[data.length - 1]?.score ?? 0;
  const healthColor = latest >= 80 ? '#00ff88' : latest >= 60 ? '#facc15' : '#ef4444';
  const healthLabel = latest >= 80 ? 'HEALTHY' : latest >= 60 ? 'DEGRADED' : 'CRITICAL';

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-[#00ff88]" />
          <h2 className="text-sm font-semibold text-white tracking-wide">Signal Health</h2>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500">Last 60 samples · 2s interval</span>
          <div
            className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-bold"
            style={{ backgroundColor: `${healthColor}18`, color: healthColor }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full animate-pulse"
              style={{ backgroundColor: healthColor }}
            />
            {healthLabel}
          </div>
          <span
            className="text-2xl font-bold tabular-nums"
            style={{ color: healthColor }}
          >
            {latest}
          </span>
        </div>
      </div>

      {/* Chart */}
      <div style={{ height: '200px', width: '100%' }}>
        <ResponsiveContainer width="100%" height={200} minHeight={200}>
          <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="healthGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#00ff88" stopOpacity={0.6} />
                <stop offset="100%" stopColor="#00ccff" stopOpacity={0.9} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
            <XAxis
              dataKey="time"
              tick={{ fill: '#4b5563', fontSize: 9 }}
              tickLine={false}
              axisLine={false}
              interval={9}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fill: '#4b5563', fontSize: 9 }}
              tickLine={false}
              axisLine={false}
              ticks={[0, 25, 50, 75, 100]}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine y={80} stroke="#00ff88" strokeDasharray="4 4" strokeOpacity={0.3} />
            <ReferenceLine y={60} stroke="#facc15" strokeDasharray="4 4" strokeOpacity={0.3} />
            <Line
              type="monotone"
              dataKey="score"
              stroke="url(#healthGradient)"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: '#00ff88', strokeWidth: 0 }}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex gap-4 mt-2 text-[10px] text-gray-500">
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-0.5 bg-[#00ff88] opacity-40 border-dashed border-t border-[#00ff88]" />
          ≥80 Healthy
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-0.5 bg-yellow-400 opacity-40" />
          ≥60 Degraded
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-0.5 bg-red-400 opacity-40" />
          &lt;60 Critical
        </span>
      </div>
    </div>
  );
}
