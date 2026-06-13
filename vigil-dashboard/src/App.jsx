import { useEffect, useState } from 'react';
import { Shield, CheckCircle2, Wifi } from 'lucide-react';
import Sidebar from './components/Sidebar';
import AlertFeed from './components/AlertFeed';
import HealthChart from './components/HealthChart';
import AgentLog from './components/AgentLog';
import AlertModal from './components/AlertModal';

function useTimestamp() {
  const [ts, setTs] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setTs(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return ts;
}

export default function App() {
  const [selectedAlert, setSelectedAlert] = useState(null);
  const timestamp = useTimestamp();

  return (
    <div className="flex min-h-screen bg-[#0a0f1e] text-white font-sans">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">

        {/* ── Top Header ─────────────────────────────────────────── */}
        <header className="flex items-center justify-between px-8 py-4 border-b border-gray-800 bg-[#0a0f1e]/90 backdrop-blur-sm sticky top-0 z-10">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 rounded-xl bg-[#00ff88]/20 blur-md" />
              <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-[#00ff88]/10 border border-[#00ff88]/30">
                <Shield className="w-5 h-5 text-[#00ff88]" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-[0.3em] text-white">VIGIL</h1>
              <p className="text-[10px] text-gray-500 tracking-[0.2em] uppercase">
                AI Operations Platform · RailMind
              </p>
            </div>
          </div>

          {/* Center — system status */}
          <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-[#00ff88]/30 bg-[#00ff88]/8">
            <span className="w-2 h-2 rounded-full bg-[#00ff88] animate-pulse shadow-[0_0_8px_#00ff88]" />
            <CheckCircle2 className="w-3.5 h-3.5 text-[#00ff88]" />
            <span className="text-xs font-bold text-[#00ff88] tracking-widest uppercase">
              All Systems Active
            </span>
          </div>

          {/* Right — timestamp + network */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <Wifi className="w-3.5 h-3.5 text-[#00ff88]" />
              <span className="text-[#00ff88] text-[10px] font-medium">CONNECTED</span>
            </div>
            <div className="text-right">
              <p className="text-xs font-mono text-white">
                {timestamp.toLocaleTimeString()}
              </p>
              <p className="text-[10px] text-gray-500">
                {timestamp.toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
              </p>
            </div>
          </div>
        </header>

        {/* ── Dashboard Grid ──────────────────────────────────────── */}
        <main className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* Row 1: Alert Feed + Health Chart */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

            {/* Alert Feed */}
            <div className="rounded-2xl border border-gray-800 bg-[#111827] p-5
              shadow-[0_4px_24px_rgba(0,0,0,0.3)] hover:border-gray-700 transition-colors">
              <AlertFeed onAlertClick={setSelectedAlert} />
            </div>

            {/* Health Chart */}
            <div className="rounded-2xl border border-gray-800 bg-[#111827] p-5
              shadow-[0_4px_24px_rgba(0,0,0,0.3)] hover:border-gray-700 transition-colors">
              <HealthChart />
            </div>
          </div>

          {/* Row 2: Agent Activity Log (full width) */}
          <div className="rounded-2xl border border-gray-800 bg-[#111827] p-5
            shadow-[0_4px_24px_rgba(0,0,0,0.3)] hover:border-gray-700 transition-colors">
            <AgentLog />
          </div>

          {/* Footer */}
          <footer className="text-center text-[10px] text-gray-700 pb-2 tracking-widest uppercase">
            VIGIL Platform v1.0 · RailMind Module · Simulated Data
          </footer>
        </main>
      </div>

      {/* Modal */}
      <AlertModal alert={selectedAlert} onClose={() => setSelectedAlert(null)} />
    </div>
  );
}
