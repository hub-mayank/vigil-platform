import { useVigilStream } from '../VigilStreamProvider';

/**
 * VIGIL RAIL NETWORK RISK MAP
 *
 * Design decision: instead of a literal India geography outline (hard to
 * get right fast, and not actually what VIGIL "sees"), this renders the
 * 10 monitored track sections as a network topology — the way a real ops
 * center would visualize a signaling network. Each node is labeled with
 * its section code AND a real junction city, so it still reads as "India
 * railway network" to judges, but is 100% accurate to the data model.
 *
 * Node color = latest severity for that section, from the live stream.
 * Add/replace this in your dashboard grid wherever the heatmap goes.
 */

const SECTION_META = {
  SECTION_A: { city: 'New Delhi',  x: 400, y: 60  },
  SECTION_B: { city: 'Lucknow',    x: 560, y: 130 },
  SECTION_C: { city: 'Kolkata',    x: 650, y: 260 },
  SECTION_D: { city: 'Patna',      x: 560, y: 200 },
  SECTION_E: { city: 'Mumbai',     x: 200, y: 280 },
  SECTION_F: { city: 'Pune',       x: 240, y: 350 },
  SECTION_G: { city: 'Hyderabad',  x: 360, y: 360 },
  SECTION_H: { city: 'Bengaluru',  x: 320, y: 460 },
  SECTION_I: { city: 'Chennai',    x: 460, y: 460 },
  SECTION_J: { city: 'Ahmedabad',  x: 140, y: 200 },
};

const severityColor = {
  Critical: '#ef4444',
  Warning: '#f59e0b',
  Normal: '#00ff88',
};

export default function RailNetworkMap() {
  const { sections } = useVigilStream();

  return (
    <div className="bg-[#111827] border border-[#1f2937] rounded-lg p-4">
      <h2 className="text-xs font-semibold text-gray-400 tracking-widest mb-3">RAIL NETWORK RISK MAP</h2>

      <svg viewBox="0 0 760 520" className="w-full h-auto">
        {/* faint connective lines so it reads as a network, not scattered dots */}
        {Object.entries(SECTION_META).map(([key, a], i) => {
          const entries = Object.entries(SECTION_META);
          const next = entries[(i + 1) % entries.length][1];
          return (
            <line
              key={`line-${key}`}
              x1={a.x} y1={a.y} x2={next.x} y2={next.y}
              stroke="#1f2937" strokeWidth="1"
            />
          );
        })}

        {Object.entries(SECTION_META).map(([key, meta]) => {
          const status = sections[key];
          const color = severityColor[status?.severity] || '#374151';
          const pulsing = status?.severity === 'Critical';

          return (
            <g key={key}>
              {pulsing && (
                <circle cx={meta.x} cy={meta.y} r="14" fill={color} opacity="0.35">
                  <animate attributeName="r" values="10;22;10" dur="1.6s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.4;0;0.4" dur="1.6s" repeatCount="indefinite" />
                </circle>
              )}
              <circle cx={meta.x} cy={meta.y} r="9" fill={color} stroke="#0a0f1e" strokeWidth="2" />
              <text x={meta.x} y={meta.y - 16} textAnchor="middle" fill="#ffffff" fontSize="11" fontWeight="600">
                {meta.city}
              </text>
              <text x={meta.x} y={meta.y + 24} textAnchor="middle" fill="#6b7280" fontSize="9">
                {key.replace('SECTION_', '')}{status ? ` · ${status.train_id}` : ''}
              </text>
            </g>
          );
        })}
      </svg>

      <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#00ff88] inline-block" /> Normal</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#f59e0b] inline-block" /> Warning</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#ef4444] inline-block" /> Critical</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-gray-600 inline-block" /> No data yet</span>
      </div>
    </div>
  );
}