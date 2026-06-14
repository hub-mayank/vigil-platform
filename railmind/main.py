import asyncio
import json
import os
import random
from datetime import datetime, timezone
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field, field_validator
from groq import Groq

import model

app = FastAPI(title="VIGIL RailMind Backend API", version="1.0.0")

# ── CORS ──────────────────────────────────────────────────────────────────────
# FIX [VULN-1]: allow_origins=["*"] + allow_credentials=True is an invalid and
# exploitable combination — browsers block it and some proxies allow CSRF abuse.
# Credentials are only needed if the frontend sends cookies/auth headers (it doesn't).
# Wildcard origin is fine for a public read-only API; credentials must be False.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,       # was True — invalid with wildcard origin
    allow_methods=["GET", "POST"], # was ["*"] — lock to only what you use
    allow_headers=["Content-Type"],
)

# ── Groq client ───────────────────────────────────────────────────────────────
groq_client = Groq(api_key=os.environ.get("GROQ_API_KEY"))

# ── Request model ─────────────────────────────────────────────────────────────
# FIX [VULN-3]: Added bounds validation on all sensor fields.
# Without this, any float was accepted — callers could send extreme values
# that skew the IsolationForest model or crash downstream processing.
class SensorReading(BaseModel):
    train_id: str = Field(..., example="TRAIN_001")
    track_section: str = Field(..., example="SECTION_A")
    signal_voltage: float = Field(..., ge=0.0, le=500.0, example=230.5)
    vibration_hz: float = Field(..., ge=0.0, le=500.0, example=48.2)
    speed_kmh: float = Field(..., ge=0.0, le=500.0, example=85.0)
    temperature_celsius: float = Field(..., ge=-50.0, le=150.0, example=34.5)

    @field_validator("train_id")
    @classmethod
    def validate_train_id(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("train_id cannot be empty")
        return v.strip()

    @field_validator("track_section")
    @classmethod
    def validate_track_section(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("track_section cannot be empty")
        return v.strip()


# ── Routes ────────────────────────────────────────────────────────────────────

@app.get("/health")
def health_check():
    return {"status": "VIGIL RailMind Online"}


@app.post("/analyze")
def analyze_reading(reading: SensorReading):
    try:
        prediction = model.predict(reading.model_dump())
        return prediction
    except Exception:
        # FIX [VULN-2]: Never expose raw str(e) — it leaks model paths,
        # internal filenames, and stack details to the caller.
        raise HTTPException(status_code=500, detail="Analysis failed. Check server logs.")


@app.post("/agent/analyze")
def agent_analyze(reading: SensorReading):
    """
    Groq-powered analysis endpoint.
    Runs IsolationForest first, then — on anomaly — calls Groq
    llama-3.3-70b-versatile to generate a real AI recommendation instead
    of a template string.
    Non-anomalous readings return the ML prediction directly (no LLM call).
    Falls back to ML template if the Groq call fails — nothing breaks.
    """
    try:
        prediction = model.predict(reading.model_dump())
    except Exception:
        raise HTTPException(status_code=500, detail="ML prediction failed. Check server logs.")

    ai_action = prediction.get("recommended_action", "No action required.")
    agent_trace = ["WatchAgent: reading received"]

    if prediction.get("is_anomaly"):
        agent_trace.append(f"AlertAgent: severity {prediction.get('severity', 'UNKNOWN')} flagged")
        try:
            response = groq_client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[{
                    "role": "user",
                    "content": (
                        f"You are VIGIL's ActionAgent monitoring Indian Railways.\n"
                        f"Anomaly detected on {reading.train_id} at {reading.track_section}.\n"
                        f"Severity: {prediction.get('severity', 'UNKNOWN')}\n"
                        f"Signal voltage: {reading.signal_voltage}V\n"
                        f"Vibration: {reading.vibration_hz}Hz\n"
                        f"Speed: {reading.speed_kmh}km/h\n"
                        f"Temperature: {reading.temperature_celsius}°C\n\n"
                        f"Give a 2-sentence operational recommendation for the station master. "
                        f"Be specific, urgent, and use railway terminology."
                    )
                }],
                max_tokens=150
            )
            ai_action = response.choices[0].message.content.strip()
            agent_trace.append("ActionAgent: Groq llama-3.3-70b-versatile recommendation generated")
        except Exception:
            # FIX [VULN-2 pattern]: Groq failure is silent — fallback to ML template.
            # The endpoint still returns a valid response; demo never breaks.
            agent_trace.append("ActionAgent: Groq unavailable — ML fallback used")
    else:
        agent_trace.append("ActionAgent: no anomaly — ML recommendation used")

    return {
        **reading.model_dump(),
        **prediction,
        "recommended_action": ai_action,
        "agent_trace": agent_trace,
    }


# ── SSE stream ────────────────────────────────────────────────────────────────

async def sensor_stream_generator():
    """
    Generates a continuous SSE stream of sensor readings + anomaly predictions every 2s.
    FIX [VULN-5]: Wrapped model.predict() in try/except — previously an exception
    inside the generator would silently kill the stream with no recovery.
    Now errors are emitted as a typed SSE event and the stream continues.
    FIX [VULN-6]: datetime.now() replaced with datetime.now(timezone.utc).isoformat()
    to produce unambiguous UTC timestamps instead of naive local-time strings.
    """
    while True:
        try:
            is_anomalous_sample = random.random() < 0.20

            train_id = f"TRAIN_{random.randint(1, 50):03d}"
            track_section = f"SECTION_{chr(random.randint(65, 74))}"

            if is_anomalous_sample:
                anomaly_type = random.randint(0, 3)
                signal_voltage = random.uniform(220.0, 240.0)
                vibration_hz = random.uniform(40.0, 60.0)
                speed_kmh = random.uniform(60.0, 120.0)
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
                signal_voltage = random.uniform(220.0, 240.0)
                vibration_hz = random.uniform(40.0, 60.0)
                speed_kmh = random.uniform(60.0, 120.0)
                temperature_celsius = random.uniform(25.0, 45.0)

            reading_dict = {
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "train_id": train_id,
                "track_section": track_section,
                "signal_voltage": round(signal_voltage, 2),
                "vibration_hz": round(vibration_hz, 2),
                "speed_kmh": round(speed_kmh, 2),
                "temperature_celsius": round(temperature_celsius, 2),
            }

            analysis = model.predict(reading_dict)
            event_data = {**reading_dict, **analysis}
            yield f"data: {json.dumps(event_data)}\n\n"

        except Exception as exc:
            # Stream stays alive — emit error event so frontend can show it
            error_event = {"type": "error", "message": "Stream tick failed, retrying..."}
            yield f"data: {json.dumps(error_event)}\n\n"

        await asyncio.sleep(2)


@app.get("/stream")
async def stream_sensors():
    # FIX [VULN-4]: Added Cache-Control and X-Accel-Buffering headers.
    # Without these, proxies (nginx, Cloudflare) buffer the SSE stream,
    # which causes the frontend to receive events in delayed bursts instead of live.
    return StreamingResponse(
        sensor_stream_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        }
    )
