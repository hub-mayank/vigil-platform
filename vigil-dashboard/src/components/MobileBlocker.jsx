import { useState, useEffect } from 'react'

export default function MobileBlocker() {
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  const fmt = (d) =>
    d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&family=Inter:wght@400;500;600;700&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --bg:            #0a0f1e;
          --border:        #1a2535;
          --amber-glow:    rgba(245,158,11,0.07);
          --amber-border:  rgba(245,158,11,0.28);
          --amber:         #f59e0b;
          --green-brand:   #5a8a6a;
          --red:           #f87171;
          --text:          #dedad4;
          --text-secondary:#8896a8;
          --text-muted:    #4a5a6a;
          --mono:          'JetBrains Mono', monospace;
          --sans:          'Inter', system-ui, sans-serif;
        }

        .mb-root {
          position: fixed; inset: 0;
          background: var(--bg);
          font-family: var(--sans);
          overflow: hidden;
        }

        /* ── Dot grid background ── */
        .mb-root::before {
          content: '';
          position: absolute; inset: 0;
          background-image: radial-gradient(circle, rgba(90,138,106,0.18) 1px, transparent 1px);
          background-size: 28px 28px;
          pointer-events: none;
        }

        /* ── Radial vignette ── */
        .mb-root::after {
          content: '';
          position: absolute; inset: 0;
          background: radial-gradient(ellipse at center, transparent 30%, rgba(10,15,30,0.85) 100%);
          pointer-events: none;
        }

        /* ── Top bar ── */
        .mb-topbar {
          position: fixed; top: 0; left: 0; right: 0; z-index: 20;
          height: 48px;
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 20px;
          border-bottom: 1px solid var(--border);
          background: rgba(10,15,30,0.92);
          backdrop-filter: blur(8px);
        }
        .mb-brand {
          font-family: var(--mono); font-size: 11px; font-weight: 700;
          letter-spacing: 0.22em; color: var(--text);
        }
        .mb-brand span { color: var(--green-brand); }
        .mb-clock {
          font-family: var(--mono); font-size: 11px;
          color: var(--text-muted); letter-spacing: 0.08em;
          font-variant-numeric: tabular-nums;
        }

        /* ── Main screen (between top bar and fixed footer) ── */
        .mb-screen {
          position: fixed;
          top: 48px; left: 0; right: 0;
          bottom: 100px;
          z-index: 10;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          padding: 20px 26px 0;
          overflow: hidden;
        }

        /* ── Status badge ── */
        .mb-badge {
          width: 100%; max-width: 380px;
          background: var(--amber-glow);
          border: 1px solid var(--amber-border);
          border-radius: 5px;
          padding: 11px 14px;
          margin-bottom: 36px;
          animation: mb-fade-up 0.5s 0.05s ease both;
        }
        .mb-badge-row {
          display: flex; justify-content: space-between; align-items: center;
          padding: 3px 0;
        }
        .mb-badge-key {
          display: flex; align-items: center; gap: 7px;
          font-family: var(--mono); font-size: 9px; font-weight: 600;
          letter-spacing: 0.13em; color: var(--text-muted);
          text-transform: uppercase;
        }
        .mb-dot-pulse {
          width: 5px; height: 5px; border-radius: 50%;
          background: var(--amber);
          animation: mb-dot-blink 1.6s ease-in-out infinite;
        }
        .mb-badge-val {
          font-family: var(--mono); font-size: 10px; font-weight: 700;
          letter-spacing: 0.1em; color: var(--amber); text-transform: uppercase;
        }
        .mb-badge-divider {
          height: 1px; background: var(--amber-border); margin: 4px 0;
        }

        /* ── Logo ── */
        .mb-logo-wrap {
          position: relative; width: 86px; height: 86px;
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 32px;
          animation: mb-fade-up 0.5s 0.1s ease both;
        }
        .mb-ring {
          position: absolute; border-radius: 50%;
          border: 1px solid rgba(90,138,106,0.18);
          animation: mb-scan-pulse 3s ease-in-out infinite;
        }
        .mb-ring:nth-child(1) { width: 110px; height: 110px; animation-delay: 0s; }
        .mb-ring:nth-child(2) { width: 138px; height: 138px; animation-delay: 0.6s; }
        .mb-ring:nth-child(3) { width: 166px; height: 166px; animation-delay: 1.2s; }
        .mb-logo-img { width: 60px; height: 60px; object-fit: contain; position: relative; z-index: 2; }

        /* ── Headline ── */
        .mb-headline {
          font-size: 20px; font-weight: 700;
          letter-spacing: 0.04em; color: var(--text);
          text-align: center; line-height: 1.3;
          margin-bottom: 14px;
          animation: mb-fade-up 0.5s 0.18s ease both;
        }

        /* ── Body ── */
        .mb-body {
          font-size: 13px; color: var(--text-secondary);
          text-align: center; line-height: 1.75;
          max-width: 300px;
          margin-bottom: 6px;
          animation: mb-fade-up 0.5s 0.26s ease both;
        }
        .mb-simultaneously {
          font-size: 13px; font-weight: 600;
          color: var(--text-secondary);
          text-align: center;
          white-space: nowrap;
          margin-bottom: 4px;
          animation: mb-fade-up 0.5s 0.30s ease both;
        }
        .mb-tried {
          font-size: 12px; color: var(--text-muted);
          text-align: center; font-style: italic;
          margin-bottom: 0;
          animation: mb-fade-up 0.5s 0.32s ease both;
        }

        /* ── Directive ── */
        .mb-directive-wrap {
          width: 100%; max-width: 340px;
          border-top: 1px solid var(--border);
          border-bottom: 1px solid var(--border);
          padding: 18px 0;
          margin-top: 20px;
          display: flex; justify-content: center;
          animation: mb-fade-up 0.5s 0.36s ease both;
        }
        .mb-directive {
          display: flex; align-items: center; gap: 13px;
        }
        .mb-directive-icon {
          width: 26px; height: 26px; flex-shrink: 0;
          color: #4a5a6a; opacity: 0.6;
        }
        .mb-directive-line { display: flex; flex-direction: column; gap: 3px; }
        .mb-directive-label {
          font-family: var(--mono); font-size: 9px;
          letter-spacing: 0.15em; font-weight: 600;
          color: var(--red);
          animation: mb-red-breathe 2.8s ease-in-out infinite;
        }
        .mb-directive-text {
          font-family: var(--mono); font-size: 11px;
          letter-spacing: 0.07em; text-transform: uppercase;
          color: var(--text-secondary);
        }

        /* ── Footer (fixed) ── */
        .mb-footer-fixed {
          position: fixed; bottom: 2px; left: 0; right: 0;
          z-index: 15;
          padding: 14px 26px 16px;
          border-top: 1px solid var(--border);
          background: linear-gradient(to top, var(--bg) 60%, transparent);
          animation: mb-fade-up 0.5s 0.44s ease both;
        }
        .mb-footer {
          font-family: var(--mono); font-size: 9.5px;
          color: var(--text-muted); text-align: center;
          letter-spacing: 0.07em; line-height: 1;
        }
        .mb-footer-brand { color: var(--green-brand); font-weight: 500; }
        .mb-footer-sep   { color: var(--border); margin: 0 8px; }
        .mb-footer-quip  {
          display: block; margin-top: 8px;
          color: var(--text-muted); opacity: 0.45;
          font-style: italic; line-height: 1.9;
        }

        /* ── Bottom bar ── */
        .mb-bottom-bar {
          position: fixed; bottom: 0; left: 0; right: 0; height: 3px; z-index: 30;
          background: linear-gradient(90deg, transparent, var(--amber) 30%, var(--amber) 70%, transparent);
          opacity: 0.5;
        }

        /* ── Keyframes ── */
        @keyframes mb-fade-up {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes mb-scan-pulse {
          0%, 100% { opacity: 0.18; transform: scale(1); }
          50%      { opacity: 0.38; transform: scale(1.04); }
        }
        @keyframes mb-dot-blink {
          0%, 100% { opacity: 0.5; }
          50%      { opacity: 1; box-shadow: 0 0 6px var(--amber); }
        }
        @keyframes mb-red-breathe {
          0%, 100% { opacity: 0.55; text-shadow: none; }
          50%      { opacity: 1;    text-shadow: 0 0 10px rgba(248,113,113,0.4); }
        }
      `}</style>

      <div className="mb-root">

        {/* Top bar */}
        <div className="mb-topbar">
          <div className="mb-brand">VIG<span>i</span>L</div>
          <div className="mb-clock">{fmt(time)}</div>
        </div>

        {/* Main content */}
        <div className="mb-screen">

          {/* Status badge */}
          <div className="mb-badge">
            <div className="mb-badge-row">
              <span className="mb-badge-key">
                <span className="mb-dot-pulse" />
                Device Class
              </span>
              <span className="mb-badge-val">Mobile</span>
            </div>
            <div className="mb-badge-divider" />
            <div className="mb-badge-row">
              <span className="mb-badge-key">Operational Status</span>
              <span className="mb-badge-val">Restricted</span>
            </div>
          </div>

          {/* Logo with scanning rings */}
          <div className="mb-logo-wrap">
            <div className="mb-ring" />
            <div className="mb-ring" />
            <div className="mb-ring" />
            <img src="/vigil-icon.png" alt="VIGIL" className="mb-logo-img" />
          </div>

          {/* Headline */}
          <p className="mb-headline">VIGIL is not an app.</p>

          {/* Body */}
          <p className="mb-body">
            It monitors live infrastructure, processes real-time telemetry,
            runs autonomous AI agents, and detects anomalies across
            active systems —
          </p>
          <p className="mb-simultaneously">All of it. Simultaneously.</p>
          <p className="mb-tried">None of that survives a 6-inch screen. And we tried.</p>

          {/* Directive */}
          <div className="mb-directive-wrap">
            <div className="mb-directive">
              <svg className="mb-directive-icon" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="1.4"
                strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2"/>
                <path d="M8 21h8M12 17v4"/>
              </svg>
              <div className="mb-directive-line">
                <span className="mb-directive-label">ACTION REQUIRED</span>
                <span className="mb-directive-text">Open on a Desktop or Laptop to proceed</span>
              </div>
            </div>
          </div>

        </div>

        {/* Footer — fixed, never competes with content */}
        <div className="mb-footer-fixed">
          <div className="mb-footer">
            <span className="mb-footer-brand">VIGIL COMMAND CENTER</span>
            <span className="mb-footer-sep">|</span>
            Report to a larger screen.
            <span className="mb-footer-quip">
              This message will not self-destruct.<br/>
              Your phone just can&apos;t display the rest.
            </span>
          </div>
        </div>

        <div className="mb-bottom-bar" />
      </div>
    </>
  )
}
