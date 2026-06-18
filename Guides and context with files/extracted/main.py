import asyncio
import json
import logging
import os
import random
import time
from collections import defaultdict
from contextlib import asynccontextmanager
from datetime import datetime, timezone

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field, field_validator
from groq import Groq

import model
import db
import weather
from rail_data import real_train_id, random_train_slot, random_section_slot, junction_name

logger = logging.getLogger("vigil")

# Startup: auto-generate model + warm weather cache
@asynccontextmanager
async def lifespan(app: FastAPI):
    model_path = os.path.join(os.path.dirname(__file__), "vigil_model.pkl")
    data_path  = os.path.join(os.path.dirname(__file__), "sensors.csv")

    if not os.path.exists(model_path):
        logger.warning("vigil_model.pkl not found - auto-generating training data and model...")
        try:
            if not os.path.exists(data_path):
                from data_generator import generate_data
                generate_data()
                logger.info("sensors.csv generated.")
            model.train_model()
            logger.info("vigil_model.pkl trained and saved.")
        except Exception as exc:
            logger.error(f"Model auto-generation failed: {exc}")

    try:
        await weather.warm_cache_on_startup()
        logger.info("Weather cache warmed.")
    except Exception as exc:
        logger.warning(f"Weather cache warm-up failed (non-fatal): {exc}")

    yield


app = FastAPI(
    title="VIGIL RailMind Backend API",
    version="1.1.0",
    lifespan=lifespan,
)

# CORS
_extra = os.environ.get("ALLOWED_ORIGINS", "")
_allowed_origins = [
    "https://vigil-platform-six.vercel.app",
    "http://localhost:5173",
    "http://localhost:3000",
    *[o.strip() for o in _extra.split(",") if o.strip()],
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=_allowed_origins,
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)

# Rate limiter
_RATE_LIMIT   = 10
_RATE_WINDOW  = 60
_rate_store = defaultdict(list)

def _check_rate_limit(ip):
    now   = time.monotonic()
    calls = _rate_store[ip]
    _rate_store[ip] = [t for t in calls if now - t < _RATE_WINDOW]
    if len(_rate_store[ip]) >= _RATE_LIMIT:
        raise HTTPException(
            status_code=429,
            detail=f"Rate limit exceeded: max {_RATE_LIMIT} AI analysis calls per {_RATE_WINDOW}s per IP."
        )
    _rate_store[ip].append(now)

    if random.randint(0, 99) == 0:
        stale = [k for k, v in list(_rate_store.items()) if not v]
        for k in stale:
            del _rate_store[k]

# Groq client
groq_client = Groq(api_key=os.environ.get("GROQ_API_KEY"))

# Request model
class SensorReading(BaseModel):
    train_id:            str   = Field(..., min_length=1, max_length=50,  example="TRAIN_001")
    track_section:       str   = Field(..., min_length=1, max_length=20,  example="SECTION_A")
    signal_voltage:      float = Field(..., ge=0.0,   le=500.0,  example=230.5)
    vibration_hz:        float = Field(..., ge=0.0,   le=500.0,  example=48.2)
    speed_kmh:           float = Field(..., ge=0.0,   le=500.0,  example=85.0)
    temperature_celsius: float = Field(..., ge=-50.0, le=150.0,  example=34.5)

    @field_validator("train_id")
    @classmethod
    def validate_train_id(cls, v):
        v = v.strip()
        if not v:
            raise ValueError("train_id cannot be empty")
        return ''.join(c for c in v if c.isalnum() or c in '-_')

    @field_validator("track_section")
    @classmethod
    def validate_track_section(cls, v):
        v = v.strip()
        if not v:
            raise ValueError("track_section cannot be empty")
        return ''.join(c for c in v if c.isalnum() or c in '-_')


# Routes

@app.get("/health")
def health_check():
    return {"status": "VIGIL RailMind Online"}


@app.post("/analyze")
def analyze_reading(reading: SensorReading):
    try:
        prediction = model.predict(reading.model_dump())
        return prediction
    except Exception:
        raise HTTPException(status_code=500, detail="Analysis failed. Check server logs.")


@app.post("/agent/analyze")
def agent_analyze(reading: SensorReading, request: Request):
    _check_rate_limit(request.client.host if request.client else "unknown")
    """
    Groq-powered analysis endpoint. Runs IsolationForest first, then on
    anomaly calls Groq llama-3.3-70b-versatile for a real AI recommendation.
    Falls back to ML template if Groq fails. Persists to Supabase
    (fire-and-forget, never blocks response).
    """
    try:
        prediction = model.predict(reading.model_dump())
    except Exception:
        raise HTTPException(status_code=500, detail="ML prediction failed. Check server logs.")

    ai_action   = prediction.get("recommended_action", "No action required.")
    agent_trace = ["WatchAgent: reading received"]
    source      = "ml_fallback"

    if prediction.get("is_anomaly"):
        agent_trace.append(f"AlertAgent: severity {prediction.get('severity', 'UNKNOWN')} flagged")
        try:
            response = groq_client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[{
                    "role": "user",
                    "content": (
                        f"You are VIGIL's ActionAgent monitoring Indian Railways.\n"
                        f"Anomaly detected on train {real_train_id(reading.train_id)} "
                        f"at {junction_name(reading.track_section)} ({reading.track_section}).\n"
                        f"Severity: {prediction.get('severity', 'UNKNOWN')}\n"
                        f"Signal voltage: {reading.signal_voltage}V\n"
                        f"Vibration: {reading.vibration_hz}Hz\n"
                        f"Speed: {reading.speed_kmh}km/h\n"
                        f"Temperature: {reading.temperature_celsius}C\n\n"
                        f"Give a 2-sentence operational recommendation for the station master. "
                        f"Be specific, urgent, and use railway terminology."
                    )
                }],
                max_tokens=150
            )
            ai_action = response.choices[0].message.content.strip()
            agent_trace.append("ActionAgent: Groq llama-3.3-70b-versatile recommendation generated")
            source = "groq"
        except Exception:
            agent_trace.append("ActionAgent: Groq unavailable - ML fallback used")
    else:
        agent_trace.append("ActionAgent: no anomaly - ML recommendation used")

    db.insert_alert(reading.model_dump(), prediction, ai_action, agent_trace, source)

    return {
        **reading.model_dump(),
        **prediction,
        "real_train_number": real_train_id(reading.train_id),
        "real_station_name": junction_name(reading.track_section),
        "recommended_action": ai_action,
        "agent_trace": agent_trace,
    }


# SSE stream

async def sensor_stream_generator():
    """
    Continuous SSE stream of sensor readings + anomaly predictions every 2s.
    Live weather (Open-Meteo, cached, non-blocking) nudges the synthetic
    temperature/vibration baseline toward real ambient conditions at each
    junction - real-world signal layered onto the synthetic simulation,
    not fabricated data.
    """
    while True:
        try:
            is_anomalous_sample = random.random() < 0.20

            train_slot   = random_train_slot()
            section_slot = random_section_slot()

            live_weather = weather.get_weather_nonblocking(section_slot)

            if is_anomalous_sample:
                anomaly_type        = random.randint(0, 3)
                signal_voltage      = random.uniform(220.0, 240.0)
                vibration_hz        = random.uniform(40.0, 60.0)
                speed_kmh           = random.uniform(60.0, 120.0)
                temperature_celsius = random.uniform(25.0, 45.0)

                if anomaly_type == 0:
                    signal_voltage = random.choice([
                        random.uniform(170.0, 210.0),
                        random.uniform(250.0, 280.0)
                    ])
                elif anomaly_type == 1:
                    vibration_hz = random.choice([
                        random.uniform(10.0, 35.0),
                        random.uniform(65.0, 100.0)
                    ])
                elif anomaly_type == 2:
                    speed_kmh = random.choice([
                        random.uniform(10.0, 50.0),
                        random.uniform(130.0, 170.0)
                    ])
                else:
                    temperature_celsius = random.choice([
                        random.uniform(5.0, 20.0),
                        random.uniform(50.0, 80.0)
                    ])
            else:
                signal_voltage      = random.uniform(220.0, 240.0)
                vibration_hz        = random.uniform(40.0, 60.0)
                speed_kmh           = random.uniform(60.0, 120.0)
                temperature_celsius = random.uniform(25.0, 45.0)

            # Layer real live weather onto the synthetic baseline (non-anomalous
            # ticks only - anomaly injection above already set deliberate
            # out-of-range values and must not be overwritten).
            if live_weather and not is_anomalous_sample:
                real_temp = live_weather.get("temp")
                real_wind = live_weather.get("wind")
                if real_temp is not None:
                    temperature_celsius = round(0.7 * real_temp + 0.3 * temperature_celsius, 2)
                if real_wind is not None:
                    vibration_hz = round(vibration_hz + min(real_wind * 0.3, 8.0), 2)

            reading_dict = {
                "timestamp":           datetime.now(timezone.utc).isoformat(),
                "train_id":            train_slot,
                "real_train_number":   real_train_id(train_slot),
                "track_section":       section_slot,
                "real_station_name":   junction_name(section_slot),
                "signal_voltage":      round(signal_voltage, 2),
                "vibration_hz":        round(vibration_hz, 2),
                "speed_kmh":           round(speed_kmh, 2),
                "temperature_celsius": round(temperature_celsius, 2),
            }

            analysis   = model.predict(reading_dict)
            event_data = {**reading_dict, **analysis}

            db.upsert_train_state(reading_dict, analysis)
            if analysis.get("is_anomaly"):
                db.insert_alert(
                    reading_dict, analysis,
                    analysis.get("recommended_action", ""),
                    ["WatchAgent: reading received",
                     f"AlertAgent: severity {analysis.get('severity', 'UNKNOWN')} flagged (stream tick)"],
                    "ml_stream",
                )

            yield f"data: {json.dumps(event_data)}\n\n"

        except Exception:
            error_event = {"type": "error", "message": "Stream tick failed, retrying..."}
            yield f"data: {json.dumps(error_event)}\n\n"

        await asyncio.sleep(2)


@app.get("/stream")
async def stream_sensors():
    return StreamingResponse(
        sensor_stream_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control":      "no-cache",
            "X-Accel-Buffering":  "no",
            "Connection":         "keep-alive",
        }
    )
