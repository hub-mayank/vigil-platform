import asyncio
import json
import random
from datetime import datetime
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

import model

app = FastAPI(title="VIGIL RailMind Backend API", version="1.0.0")

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class SensorReading(BaseModel):
    train_id: str = Field(..., example="TRAIN_001")
    track_section: str = Field(..., example="SECTION_A")
    signal_voltage: float = Field(..., example=230.5)
    vibration_hz: float = Field(..., example=48.2)
    speed_kmh: float = Field(..., example=85.0)
    temperature_celsius: float = Field(..., example=34.5)

@app.get("/health")
def health_check():
    return {"status": "VIGIL RailMind Online"}

@app.post("/analyze")
def analyze_reading(reading: SensorReading):
    try:
        prediction = model.predict(reading.model_dump())
        return prediction
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

async def sensor_stream_generator():
    """Generates continuous stream of sensor readings + anomaly predictions every 2s"""
    while True:
        # Determine if this iteration will generate an anomaly (20% chance)
        is_anomalous_sample = random.random() < 0.20
        
        train_id = f"TRAIN_{random.randint(1, 50):03d}"
        track_section = f"SECTION_{chr(random.randint(65, 74))}"
        
        if is_anomalous_sample:
            # Generate one or more anomalous parameters
            anomaly_type = random.randint(0, 3)
            
            # Default normal values first
            signal_voltage = random.uniform(220.0, 240.0)
            vibration_hz = random.uniform(40.0, 60.0)
            speed_kmh = random.uniform(60.0, 120.0)
            temperature_celsius = random.uniform(25.0, 45.0)
            
            if anomaly_type == 0:
                signal_voltage = random.choice([random.uniform(170.0, 210.0), random.uniform(250.0, 280.0)])
            elif anomaly_type == 1:
                vibration_hz = random.choice([random.uniform(10.0, 35.0), random.uniform(65.0, 100.0)])
            elif anomaly_type == 2:
                speed_kmh = random.choice([random.uniform(10.0, 50.0), random.uniform(130.0, 170.0)])
            else:
                temperature_celsius = random.choice([random.uniform(5.0, 20.0), random.uniform(50.0, 80.0)])
        else:
            # Generate normal values
            signal_voltage = random.uniform(220.0, 240.0)
            vibration_hz = random.uniform(40.0, 60.0)
            speed_kmh = random.uniform(60.0, 120.0)
            temperature_celsius = random.uniform(25.0, 45.0)
            
            
        reading_dict = {
            "timestamp": datetime.now().isoformat(),
            "train_id": train_id,
            "track_section": track_section,
            "signal_voltage": round(signal_voltage, 2),
            "vibration_hz": round(vibration_hz, 2),
            "speed_kmh": round(speed_kmh, 2),
            "temperature_celsius": round(temperature_celsius, 2)
        }
        
        # Analyze with model
        analysis = model.predict(reading_dict)
        
        # Merge reading details and prediction details
        event_data = {**reading_dict, **analysis}
        
        # Yield as Server-Sent Event formatted string
        yield f"data: {json.dumps(event_data)}\n\n"
        await asyncio.sleep(2)

@app.get("/stream")
async def stream_sensors():
    return StreamingResponse(sensor_stream_generator(), media_type="text/event-stream")
