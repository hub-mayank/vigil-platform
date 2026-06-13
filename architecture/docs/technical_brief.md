# VIGIL — Vigilant Infrastructure Guardian Intelligence Layer
*Team Navadhara | Far Away 2026*

VIGIL is an autonomous, multi-agent AI platform designed for real-time infrastructure monitoring. Built on a modular **NEXUS architecture**, it moves beyond reactive detection to predictive prevention.

---

### 🚀 Architecture Overview
VIGIL utilizes a stateful **LangGraph** pipeline to process data streams with high reliability:



1. **WatcherAgent:** Polling & ML Inference engine.
2. **AnalyzerAgent:** Anomaly filtering (>0.70 threshold) & context enrichment.
3. **AlertAgent:** Deterministic template-based safety protocol generation.
4. **OrchestratorAgent:** WebSocket-based real-time state broadcast.

---

### 🧠 Core Intelligence Modules
* **RailMind (Active):** Monitors Indian Railways signal voltage, vibration, and temperature using an **Isolation Forest** classifier to prevent signal failures.
* **OrbitMind (Roadmapped):** Aerospace extension for autonomous mission health monitoring (Gaganyaan G1).

---

### 🛠 Tech Stack
* **Backend:** Python, FastAPI, LangGraph
* **ML Engine:** scikit-learn (Isolation Forest)
* **Transport:** WebSockets (Real-time), REST (Sync)
* **Frontend:** React, TailwindCSS, Recharts

---

### 💡 Why NEXUS?
VIGIL’s domain-agnostic core allows for **Zero-Friction Onboarding**. By decoupling ML intelligence from the core Orchestrator, we can scale from railway signals to power grids or satellite telemetry without altering the base architecture.

---

### ⚙️ Quick Start
1. **Install:** `pip3 install fastapi uvicorn langgraph scikit-learn pandas numpy`
2. **Run:** `python3 main.py`
3. **Connect:** Point WebSocket client to `ws://localhost:8001/ws/alerts`.

---
*VIGIL: Predicting the future, protecting the present.*