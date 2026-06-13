"""
VIGIL NEXUS — LangGraph Multi-Agent Orchestrator
Four agents wired in a state graph:
  WatcherAgent → AnalyzerAgent → AlertAgent → OrchestratorAgent
Runs on a 30-second async loop. Never crashes.
"""

import asyncio
import json
from datetime import datetime
from typing import TypedDict
from uuid import uuid4

from langgraph.graph import StateGraph, START, END

# 1. Importing the new ML-powered live data!
from demo_data import get_live_rail_data
from models import AlertObject


# ═══════════════════════════════════════════════════════════════
# SHARED STATE & CONSTANTS
# ═══════════════════════════════════════════════════════════════

alert_log: list[dict] = []
connected_clients: set = set()

# Dummy schedules mapped to Aditya's sections (SECTION_A to SECTION_J)
TRAIN_SCHEDULE = {
    f"SECTION_{chr(65+i)}": [f"EXP-{1000+i}", f"PASS-{2000+i}"] for i in range(10)
}

# ═══════════════════════════════════════════════════════════════
# LANGGRAPH TYPED STATE
# ═══════════════════════════════════════════════════════════════

class VIGILState(TypedDict):
    raw_scores: list       
    high_risk: list        
    new_alerts: list       
    cycle_count: int       


# ═══════════════════════════════════════════════════════════════
# AGENT 1 — WatcherAgent
# ═══════════════════════════════════════════════════════════════

def watcher_agent(state: VIGILState) -> dict:
    """
    Polls 15 live stations and routes them through Aditya's ML model.
    """
    cycle_count = state.get("cycle_count", 0) + 1
    try:
        results = get_live_rail_data(num_stations=15)
        print(f"[WatcherAgent] Cycle {cycle_count} — pulled 15 live station readings")
        return {"raw_scores": results, "cycle_count": cycle_count}
    except Exception as e:
        print(f"[WatcherAgent] ⚠ Error: {e}")
        return {"raw_scores": [], "cycle_count": cycle_count}


# ═══════════════════════════════════════════════════════════════
# AGENT 2 — AnalyzerAgent
# ═══════════════════════════════════════════════════════════════

def analyzer_agent(state: VIGILState) -> dict:
    """
    Filters stations with an ML anomaly score > 0.70 or CRITICAL level.
    """
    try:
        raw_scores = state.get("raw_scores", [])
        high_risk = []

        for entry in raw_scores:
            # Aditya's model outputs a decimal out of 1.0!
            if entry.get("risk_score", 0) > 0.70 or entry.get("risk_level") == "CRITICAL":
                station_id = entry["station_id"]
                trains = TRAIN_SCHEDULE.get(station_id, ["No scheduled trains"])
                trains_affected = len(trains) if trains[0] != "No scheduled trains" else 0

                enriched = {
                    "station_id": station_id,
                    "risk_score": entry["risk_score"],
                    "risk_level": entry["risk_level"],
                    "sensor_data": {
                        "voltage": entry.get("signal_voltage"),
                        "vibration": entry.get("vibration_hz"),
                        "speed": entry.get("speed_kmh"),
                        "temp": entry.get("temperature_celsius")
                    },
                    "trains_affected": trains_affected,
                    "next_train": trains[0],
                }
                high_risk.append(enriched)

        print(f"[AnalyzerAgent] {len(high_risk)} stations above ML threshold")
        return {"high_risk": high_risk}

    except Exception as e:
        print(f"[AnalyzerAgent] ⚠ Error: {e}")
        return {"high_risk": []}


# ═══════════════════════════════════════════════════════════════
# AGENT 3 — AlertAgent
# ═══════════════════════════════════════════════════════════════

def alert_agent(state: VIGILState) -> dict:
    """
    Generates AlertObjects for all high-risk stations.
    """
    try:
        high_risk = state.get("high_risk", [])

        if not high_risk:
            print("[AlertAgent] No high-risk stations this cycle")
            return {"new_alerts": []}

        new_alerts = []

        for entry in high_risk:
            alert = AlertObject(
                id=str(uuid4()),
                timestamp=datetime.utcnow().isoformat(),
                station=entry["station_id"],
                risk_score=entry["risk_score"],
                risk_level=entry["risk_level"],
                message=f"ML Anomaly detected at {entry['station_id']}. Affected scheduled trains: {entry['next_train']}.",
                recommended_action="Dispatch maintenance crew immediately and restrict sector speeds."
            )
            new_alerts.append(alert.model_dump())

        print(f"[AlertAgent] Generated {len(new_alerts)} alerts")
        return {"new_alerts": new_alerts}

    except Exception as e:
        print(f"[AlertAgent] ⚠ Error: {e}")
        return {"new_alerts": []}


# ═══════════════════════════════════════════════════════════════
# AGENT 4 — OrchestratorAgent
# ═══════════════════════════════════════════════════════════════

def orchestrator_agent(state: VIGILState) -> dict:
    """
    Appends new alerts to the global alert_log (max 50),
    and broadcasts each to all connected WebSocket clients.
    """
    try:
        new_alerts = state.get("new_alerts", [])

        for alert in new_alerts:
            alert_log.append(alert)

        # Trim to 50 most recent
        while len(alert_log) > 50:
            alert_log.pop(0)

        # Broadcast to WebSocket clients
        if new_alerts and connected_clients:
            payload = json.dumps(new_alerts)
            stale_clients = set()
            for client in connected_clients:
                try:
                    asyncio.get_event_loop().create_task(client.send_text(payload))
                except Exception:
                    stale_clients.add(client)
            connected_clients.difference_update(stale_clients)

        print(f"[OrchestratorAgent] Alert log now has {len(alert_log)} entries")
        return {}

    except Exception as e:
        print(f"[OrchestratorAgent] ⚠ Error: {e}")
        return {}


# ═══════════════════════════════════════════════════════════════
# BUILD LANGGRAPH
# ═══════════════════════════════════════════════════════════════

def build_graph():
    graph = StateGraph(VIGILState)

    graph.add_node("WatcherAgent", watcher_agent)
    graph.add_node("AnalyzerAgent", analyzer_agent)
    graph.add_node("AlertAgent", alert_agent)
    graph.add_node("OrchestratorAgent", orchestrator_agent)

    graph.add_edge(START, "WatcherAgent")
    graph.add_edge("WatcherAgent", "AnalyzerAgent")
    graph.add_edge("AnalyzerAgent", "AlertAgent")
    graph.add_edge("AlertAgent", "OrchestratorAgent")
    graph.add_edge("OrchestratorAgent", END)

    return graph.compile()


# ═══════════════════════════════════════════════════════════════
# ASYNC AGENT LOOP
# ═══════════════════════════════════════════════════════════════

async def run_agent_loop():
    print("[VIGIL CORE] Starting ML-powered agent loop...")
    compiled = build_graph()

    cycle_count = 0

    while True:
        try:
            cycle_count += 1
            print(f"\n{'═' * 60}")
            print(f"  VIGIL CYCLE {cycle_count}")
            print(f"{'═' * 60}")

            result = compiled.invoke({
                "raw_scores": [],
                "high_risk": [],
                "new_alerts": [],
                "cycle_count": cycle_count - 1,
            })

            cycle_count = result.get("cycle_count", cycle_count)

        except Exception as e:
            print(f"[VIGIL CORE] ⚠ Cycle {cycle_count} failed: {e}")

        await asyncio.sleep(30)