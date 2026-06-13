import { Train, Orbit, Shield, Settings, Activity, ChevronRight } from 'lucide-react';

const modules = [
  {
    id: 'railmind',
    label: 'RailMind',
    icon: Train,
    active: true,
    badge: 'LIVE',
    description: 'Railway Signal AI',
  },
  {
    id: 'orbitmind',
    label: 'OrbitMind',
    icon: Orbit,
    active: false,
    badge: 'Round 2',
    description: 'Coming Soon',
    disabled: true,
  },
];

export default function Sidebar() {
  return (
    <aside className="flex flex-col w-64 min-h-screen border-r border-gray-800 bg-[#0d1424]">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-6 border-b border-gray-800">
        <div className="relative flex items-center justify-center w-9 h-9">
          <div className="absolute inset-0 rounded-lg bg-[#00ff88]/20 blur-sm" />
          <Shield className="relative w-5 h-5 text-[#00ff88]" />
        </div>
        <div>
          <span className="text-xl font-bold tracking-[0.25em] text-white">VIGIL</span>
          <p className="text-[10px] text-gray-500 tracking-widest uppercase">Platform v1.0</p>
        </div>
      </div>

      {/* Nav label */}
      <div className="px-6 pt-6 pb-2">
        <p className="text-[10px] font-semibold tracking-[0.2em] text-gray-500 uppercase">Modules</p>
      </div>

      {/* Module list */}
      <nav className="flex flex-col gap-2 px-3">
        {modules.map(({ id, label, icon: Icon, active, badge, description, disabled }) => (
          <button
            key={id}
            disabled={disabled}
            className={`relative flex items-center gap-3 rounded-xl px-3 py-3 text-left transition-all duration-200 group
              ${active
                ? 'bg-[#00ff88]/10 border border-[#00ff88]/30 shadow-[0_0_20px_rgba(0,255,136,0.08)]'
                : 'border border-transparent opacity-50 cursor-not-allowed hover:opacity-60'
              }`}
          >
            {/* Active glow bar */}
            {active && (
              <span className="absolute left-0 top-3 bottom-3 w-0.5 rounded-full bg-[#00ff88] shadow-[0_0_8px_#00ff88]" />
            )}

            <div className={`flex items-center justify-center w-8 h-8 rounded-lg
              ${active ? 'bg-[#00ff88]/15' : 'bg-gray-800'}`}>
              <Icon className={`w-4 h-4 ${active ? 'text-[#00ff88]' : 'text-gray-500'}`} />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className={`text-sm font-semibold ${active ? 'text-white' : 'text-gray-400'}`}>
                  {label}
                </span>
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider
                  ${active
                    ? 'bg-[#00ff88]/20 text-[#00ff88]'
                    : 'bg-gray-700 text-gray-500'
                  }`}>
                  {badge}
                </span>
              </div>
              <p className={`text-[11px] mt-0.5 ${active ? 'text-gray-400' : 'text-gray-600'}`}>
                {description}
              </p>
            </div>

            {active && (
              <ChevronRight className="w-3.5 h-3.5 text-[#00ff88]/60 group-hover:translate-x-0.5 transition-transform" />
            )}
          </button>
        ))}
      </nav>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Bottom status */}
      <div className="px-6 py-5 border-t border-gray-800 space-y-3">
        <div className="flex items-center gap-2">
          <Activity className="w-3.5 h-3.5 text-[#00ff88]" />
          <span className="text-xs text-gray-400">WatchAgent <span className="text-[#00ff88]">Active</span></span>
        </div>
        <div className="flex items-center gap-2">
          <Activity className="w-3.5 h-3.5 text-[#00ff88]" />
          <span className="text-xs text-gray-400">AlertAgent <span className="text-[#00ff88]">Active</span></span>
        </div>
        <div className="flex items-center gap-2">
          <Activity className="w-3.5 h-3.5 text-[#00ff88]" />
          <span className="text-xs text-gray-400">ActionAgent <span className="text-[#00ff88]">Active</span></span>
        </div>
        <button className="flex items-center gap-2 mt-2 text-xs text-gray-500 hover:text-gray-300 transition-colors">
          <Settings className="w-3.5 h-3.5" />
          Settings
        </button>
      </div>
    </aside>
  );
}
