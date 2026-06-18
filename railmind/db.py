"""
db.py — Supabase persistence layer.

Two tables (create via Supabase SQL editor before first run):

    create table train_state (
        train_id text primary key,
        track_section text,
        signal_voltage float8,
        vibration_hz float8,
        speed_kmh float8,
        temperature_celsius float8,
        is_anomaly boolean,
        anomaly_score float8,
        severity text,
        updated_at timestamptz default now()
    );

    create table alert_history (
        id bigint generated always as identity primary key,
        train_id text,
        track_section text,
        severity text,
        anomaly_score float8,
        recommended_action text,
        agent_trace jsonb,
        source text,
        created_at timestamptz default now()
    );

Env vars required: SUPABASE_URL, SUPABASE_KEY.

PERFORMANCE: all writes are fire-and-forget — never awaited inline in the
SSE loop or in the /agent/analyze response path. Write failures are
logged and swallowed; they must never affect the user-facing response or
stall the stream.
"""

import asyncio
import logging
import os

from supabase import create_client, Client

logger = logging.getLogger("vigil.db")

_SUPABASE_URL = os.environ.get("SUPABASE_URL")
_SUPABASE_KEY = os.environ.get("SUPABASE_KEY")

_client = None
if _SUPABASE_URL and _SUPABASE_KEY:
    try:
        _client = create_client(_SUPABASE_URL, _SUPABASE_KEY)
    except Exception as exc:
        logger.error(f"Supabase client init failed: {exc}")
else:
    logger.warning("SUPABASE_URL/SUPABASE_KEY not set — persistence disabled, app still works.")


def _upsert_train_state_sync(record: dict) -> None:
    if _client is None:
        return
    try:
        _client.table("train_state").upsert(record).execute()
    except Exception as exc:
        logger.warning(f"train_state upsert failed: {exc}")


def _insert_alert_sync(record: dict) -> None:
    if _client is None:
        return
    try:
        _client.table("alert_history").insert(record).execute()
    except Exception as exc:
        logger.warning(f"alert_history insert failed: {exc}")


def upsert_train_state(reading: dict, prediction: dict) -> None:
    """Fire-and-forget rolling state upsert. Call from the SSE loop per tick."""
    if _client is None:
        return
    record = {
        "train_id": reading.get("train_id"),
        "track_section": reading.get("track_section"),
        "signal_voltage": reading.get("signal_voltage"),
        "vibration_hz": reading.get("vibration_hz"),
        "speed_kmh": reading.get("speed_kmh"),
        "temperature_celsius": reading.get("temperature_celsius"),
        "is_anomaly": prediction.get("is_anomaly"),
        "anomaly_score": prediction.get("anomaly_score"),
        "severity": prediction.get("severity"),
    }
    try:
        loop = asyncio.get_event_loop()
        loop.run_in_executor(None, _upsert_train_state_sync, record)
    except RuntimeError:
        pass


def insert_alert(reading: dict, prediction: dict, recommended_action: str, agent_trace: list, source: str) -> None:
    """Fire-and-forget alert + Groq-output persistence."""
    if _client is None:
        return
    record = {
        "train_id": reading.get("train_id"),
        "track_section": reading.get("track_section"),
        "severity": prediction.get("severity"),
        "anomaly_score": prediction.get("anomaly_score"),
        "recommended_action": recommended_action,
        "agent_trace": agent_trace,
        "source": source,
    }
    try:
        loop = asyncio.get_event_loop()
        loop.run_in_executor(None, _insert_alert_sync, record)
    except RuntimeError:
        pass
