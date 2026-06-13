# VIGIL — Vigilant Infrastructure Guardian Intelligence Layer

> "We don't wait for failure. We see it coming."

---

## What is VIGIL?

VIGIL is a multi-agent AI platform that acts as the autonomous
nervous system for critical infrastructure. It watches, predicts,
and acts on anomalies — without waiting for a human to notice.

Built for **Far Away 2026** 

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
| ActionAgent | Recommends corrective actions in plain English |

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
| Frontend | React + TailwindCSS + Recharts |
| Backend | Python + FastAPI + Uvicorn |
| ML Model | Scikit-learn IsolationForest |
| Agents | LangChain Multi-Agent Orchestration |
| Dev Tool | Google Antigravity + Claude Sonnet 4.6 |

---

## Team

| Name | Role |
|------|------|
| Mayank Rajput | Web Dev — Dashboard & Integration Lead |
| Aditya Pathak | ML Engineer — Anomaly Detection & Backend |
| Parth Sarthi  | System Designer — Architecture & Documentation |
| Tejas Dhadich | Designer — Data Visualization & Presentation |

---

## Run Locally

### Backend (RailMind API)
```bash
cd railmind
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python data_generator.py
python model.py
uvicorn main:app --reload --port 8000
```
API runs at: http://localhost:8000

### Frontend (VIGIL Dashboard)
```bash
cd vigil-dashboard
npm install
npm run dev
```
Dashboard runs at: http://localhost:5173

---

## Folder Structure 
vigil-platform/
├── railmind/              # ML backend — Aditya
├── vigil-dashboard/       # React frontend — Web Dev Lead
├── architecture/          # System design — Parth
├── presentation/          # Pitch deck — Tejas
└── docs/                  # Setup and demo script

---

## Tagline

*VIGIL — Vigilant Infrastructure Guardian Intelligence Layer*
*"We don't wait for failure. We see it coming."* 