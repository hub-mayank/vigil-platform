"""
VIGIL NEXUS — FastAPI Application
Serves REST endpoints, WebSocket streaming, and launches the
LangGraph agent loop on startup. Port 8001.
"""

import asyncio
import json
from contextlib import asynccontextmanager

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

from agents import run_agent_loop, alert_log, connected_clients


# ═══════════════════════════════════════════════════════════════
# LIFESPAN — launch agent loop on startup
# ═══════════════════════════════════════════════════════════════

@asynccontextmanager
async def lifespan(app: FastAPI):
    asyncio.create_task(run_agent_loop())
    print("[VIGIL] System online. Agents initialising...")
    yield


# ═══════════════════════════════════════════════════════════════
# APP INIT
# ═══════════════════════════════════════════════════════════════

app = FastAPI(
    title="VIGIL NEXUS",
    description="Multi-Agent Railway Signal Intelligence Platform",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS — allow all origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ═══════════════════════════════════════════════════════════════
# GET /alerts
# ═══════════════════════════════════════════════════════════════

@app.get("/alerts")
async def get_alerts():
    """Returns alert_log as list (most recent first)."""
    if not alert_log:
        return []
    return list(reversed(alert_log))


# ═══════════════════════════════════════════════════════════════
# WebSocket /ws/alerts
# ═══════════════════════════════════════════════════════════════

@app.websocket("/ws/alerts")
async def websocket_alerts(websocket: WebSocket):
    """
    Real-time alert streaming.
    On connect: sends last 10 alerts immediately.
    Stays open for live broadcasts from OrchestratorAgent.
    """
    await websocket.accept()
    connected_clients.add(websocket)

    try:
        # Send last 10 alerts immediately
        recent = alert_log[-10:] if len(alert_log) >= 10 else alert_log[:]
        await websocket.send_text(json.dumps(recent))

        # Keep connection alive
        while True:
            await websocket.receive_text()

    except WebSocketDisconnect:
        pass
    except Exception:
        pass
    finally:
        connected_clients.discard(websocket)


# ═══════════════════════════════════════════════════════════════
# GET /architecture
# ═══════════════════════════════════════════════════════════════

@app.get("/architecture")
async def get_architecture():
    """Returns platform architecture metadata."""
    return {
        "platform": "VIGIL NEXUS",
        "version": "1.0.0",
        "modules": [
            {
                "id": "railmind",
                "name": "RailMind",
                "status": "active",
                "description": "Indian Railways Signal Intelligence",
            },
            {
                "id": "orbitmd",
                "name": "OrbitMind",
                "status": "roadmapped",
                "description": "Aerospace Intelligence Layer — Round 2",
            },
        ],
    }


# ═══════════════════════════════════════════════════════════════
# GET /health
# ═══════════════════════════════════════════════════════════════

@app.get("/health")
async def health_check():
    """Returns system health status."""
    return {
        "status": "ok",
        "agents": "running",
        "stations_monitored": 15,
        "alerts_generated": len(alert_log),
    }


# ═══════════════════════════════════════════════════════════════
# ENTRYPOINT
# ═══════════════════════════════════════════════════════════════

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8001, reload=False)
