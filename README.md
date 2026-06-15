# VIGIL — Vigilant Infrastructure Guardian Intelligence Layer

> "We don't wait for failure. We see it coming."

---

## What is VIGIL?

VIGIL is a multi-agent AI platform that acts as the autonomous
nervous system for critical infrastructure. It watches, predicts,
and acts on anomalies — without waiting for a human to notice.

Built for **Far Away 2026**

🔴 **Live Demo:** [vigil-platform-six.vercel.app](https://vigil-platform-six.vercel.app)

---

## The Problem

- Indian Railways faces 12,000+ signal failures annually
- Japan's H3 rocket has failed twice in 3 years
- Both systems rely on human operators who are aging,
  shrinking in number, and cannot watch everything at once

---

## The Solution — Two Modules, One Brain

### Module A — RailMind (Round 1 — Active)
Autonomous monitoring of Indian Railways sensor data.
Three specialized agents work in parallel:

| Agent | Job |
|-------|-----|
| WatchAgent | Ingests and monitors live sensor data streams |
| AlertAgent | Classifies anomalies — Critical / Warning / Normal |
| ActionAgent | Recommends corrective actions in plain English using Groq LLM |

### Module B — OrbitMind (Round 2 — Architected)
Same VIGIL architecture. New domain.
Applied to aerospace — satellite health monitoring,
launch anomaly detection, and autonomous mission triage
for ISRO Gaganyaan-era missions.

---

## Architecture

VIGIL is built on a modular, plugin-based architecture.
New infrastructure domains plug in as modules without
changing the core agent orchestration layer.

See `/architecture/vigil_architecture.png` for the full diagram.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React + TailwindCSS + Recharts + Leaflet |
| Backend | Python + FastAPI + Uvicorn |
| ML Model | Scikit-learn IsolationForest |
| AI Agents | Groq llama-3.3-70b-versatile (ActionAgent) |
| Frontend Hosting | Vercel (auto-deploy on `git push`) |
| Backend Hosting | Railway (permanent URL, auto-deploy on `git push`) |

---

## Team

| Name | Role |
|------|------|
| Mayank Rajput | Web Dev — Dashboard & Integration Lead |
| Aditya Pathak | ML Engineer — Anomaly Detection & Backend |
| Parth Sarthi  | System Designer — Architecture & Documentation |
| Tejas Dhadich | Designer — Data Visualization & Presentation |

---

## Deployed URLs

| Service | URL |
|---------|-----|
| Dashboard | https://vigil-platform-six.vercel.app |
| Backend API | https://vigil-platform-production-5bda.up.railway.app |
| API Docs | https://vigil-platform-production-5bda.up.railway.app/docs |
| Health Check | https://vigil-platform-production-5bda.up.railway.app/health |

---

## Run Locally

### Backend (RailMind API)

```bash
cd railmind
export GROQ_API_KEY=your_groq_key_here
bash start.sh
```

API runs at: http://localhost:8000  
Auto-generates `sensors.csv` and trains `vigil_model.pkl` on first run.

### Frontend (VIGIL Dashboard)

```bash
cd vigil-dashboard
npm install
npm run dev
```

Dashboard runs at: http://localhost:5173  
Create a `.env.local` file:
```
VITE_STREAM_URL=http://localhost:8000/stream
VITE_AGENT_API_URL=http://localhost:8000
```

---

## Folder Structure

```
vigil-platform/
├── railmind/              # FastAPI ML backend — Aditya
│   ├── main.py            # API routes + SSE stream
│   ├── model.py           # IsolationForest anomaly detection
│   ├── data_generator.py  # Training data generator
│   ├── requirements.txt   # Python dependencies
│   ├── Procfile           # Railway start command
│   ├── railway.json       # Railway build config
│   ├── nixpacks.toml      # Force Python builder on Railway
│   └── start.sh           # Local dev quick-start script
├── vigil-dashboard/       # React frontend — Mayank
├── architecture/          # System design — Parth
├── presentation/          # Pitch deck — Tejas
└── docs/                  # Setup and demo script
```

---

## Tagline

*VIGIL — Vigilant Infrastructure Guardian Intelligence Layer*  
*"We don't wait for failure. We see it coming."*