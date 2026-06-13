import { useEffect, useRef } from 'react';
import { X, AlertCircle, Train, MapPin, Clock, Cpu, CheckCheck } from 'lucide-react';

const AI_RECOMMENDATIONS = {
  'Signal failure detected — immediate halt required':
    'Initiate Emergency Stop Protocol ESC-01. Halt all trains within 2km radius. Dispatch maintenance crew to relay box. ETA for restoration: 12–18 min.',
  'Track occupancy anomaly — collision risk':
    'Activate red signal on approach corridor. Alert oncoming trains TRN-2201 and TRN-4452. Enable manual override on interlocking system.',
  'Overspeed violation on restricted zone':
    'Issue speed restriction command via TPWS. Log driver ID for incident report. Trigger zone speed audit for the next 30 minutes.',
  'Communication blackout with signal tower':
    'Switch to backup radio frequency 162.400 MHz. Revert to time-interval working. Notify divisional control center immediately.',
};

const DEFAULT_RECOMMENDATION =
  'Escalate to Zone Controller. Activate manual monitoring on affected section. Log incident in VIGIL audit trail and await system recovery confirmation.';

export default function AlertModal({ alert, onClose }) {
  const overlayRef = useRef(null);

  // Close on Escape
  useEffect(() => {
    const handler = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  // Click outside
  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) onClose();
  };

  if (!alert) return null;

  const recommendation = AI_RECOMMENDATIONS[alert.message] ?? DEFAULT_RECOMMENDATION;

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center p-4
        bg-black/70 backdrop-blur-sm animate-[fadeIn_0.2s_ease]"
    >
      <div
        className="relative w-full max-w-lg rounded-2xl border border-red-500/30
          bg-[#0d1424] shadow-[0_0_60px_rgba(239,68,68,0.15)]
          animate-[slideUp_0.25s_ease]"
      >
        {/* Top accent bar */}
        <div className="h-1 w-full rounded-t-2xl bg-gradient-to-r from-red-600 via-red-400 to-orange-400" />

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-red-500/15 border border-red-500/30">
              <AlertCircle className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Critical Alert</h2>
              <p className="text-xs text-red-400 font-medium">Requires immediate attention</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-gray-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          {/* Alert message */}
          <div className="p-4 rounded-xl bg-red-500/8 border border-red-500/20">
            <p className="text-sm text-red-300 leading-relaxed font-medium">{alert.message}</p>
          </div>

          {/* Details grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-gray-800/50 border border-gray-700/50">
              <Train className="w-4 h-4 text-gray-400 shrink-0" />
              <div>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider">Train ID</p>
                <p className="text-sm font-bold text-white">{alert.trainId}</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-gray-800/50 border border-gray-700/50">
              <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
              <div>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider">Track Section</p>
                <p className="text-sm font-bold text-white font-mono">{alert.track}</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-red-500/10 border border-red-500/25">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <div>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider">Severity</p>
                <p className="text-sm font-bold text-red-400">CRITICAL</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-gray-800/50 border border-gray-700/50">
              <Clock className="w-4 h-4 text-gray-400 shrink-0" />
              <div>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider">Timestamp</p>
                <p className="text-sm font-bold text-white font-mono">
                  {alert.timestamp?.toLocaleTimeString()}
                </p>
              </div>
            </div>
          </div>

          {/* AI Recommendation */}
          <div className="p-4 rounded-xl bg-[#00ff88]/5 border border-[#00ff88]/20">
            <div className="flex items-center gap-2 mb-2">
              <Cpu className="w-3.5 h-3.5 text-[#00ff88]" />
              <p className="text-[10px] font-bold text-[#00ff88] uppercase tracking-wider">AI Recommended Action</p>
            </div>
            <p className="text-xs text-gray-300 leading-relaxed">{recommendation}</p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 pb-6 gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-400
              border border-gray-700 hover:border-gray-500 hover:text-white transition-colors"
          >
            Dismiss
          </button>
          <button
            onClick={onClose}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl
              text-sm font-bold text-black bg-[#00ff88]
              hover:bg-[#00ff88]/90 active:scale-[0.98]
              transition-all duration-150 shadow-[0_0_20px_rgba(0,255,136,0.3)]"
          >
            <CheckCheck className="w-4 h-4" />
            Mark Resolved
          </button>
        </div>
      </div>
    </div>
  );
}
