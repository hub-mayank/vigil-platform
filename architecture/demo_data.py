import os
import sys
import random
from datetime import datetime

# 1. Map the path to Aditya's folder
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
BASE_DIR = os.path.dirname(CURRENT_DIR)
RAILMIND_DIR = os.path.join(BASE_DIR, "railmind")

# 2. Add RailMind to Python path so we can use his ML model
sys.path.append(RAILMIND_DIR)
import model # Importing Aditya's actual Scikit-Learn ML model!

def get_live_rail_data(num_stations=15):
    """Pulls live data using Aditya's exact generation and ML prediction logic."""
    readings = []
    
    for _ in range(num_stations):
        # Aditya's 20% anomaly chance logic
        is_anomalous_sample = random.random() < 0.20
        train_id = f"TRAIN_{random.randint(1, 50):03d}"
        track_section = f"SECTION_{chr(random.randint(65, 74))}"
        
        # Default normal values
        signal_voltage = random.uniform(220.0, 240.0)
        vibration_hz = random.uniform(40.0, 60.0)
        speed_kmh = random.uniform(60.0, 120.0)
        temperature_celsius = random.uniform(25.0, 45.0)
        
        if is_anomalous_sample:
            anomaly_type = random.randint(0, 3)
            if anomaly_type == 0:
                signal_voltage = random.choice([random.uniform(170.0, 210.0), random.uniform(250.0, 280.0)])
            elif anomaly_type == 1:
                vibration_hz = random.choice([random.uniform(10.0, 35.0), random.uniform(65.0, 100.0)])
            elif anomaly_type == 2:
                speed_kmh = random.choice([random.uniform(10.0, 50.0), random.uniform(130.0, 170.0)])
            else:
                temperature_celsius = random.choice([random.uniform(5.0, 20.0), random.uniform(50.0, 80.0)])
                
        reading_dict = {
            "timestamp": datetime.now().isoformat(),
            "train_id": train_id,
            "track_section": track_section,
            "signal_voltage": round(signal_voltage, 2),
            "vibration_hz": round(vibration_hz, 2),
            "speed_kmh": round(speed_kmh, 2),
            "temperature_celsius": round(temperature_celsius, 2)
        }
        
        # Run the reading through Aditya's ML Model
        try:
            analysis = model.predict(reading_dict)
            # Map Aditya's ML keys to VIGIL's expected risk keys
            risk_score = analysis.get("anomaly_score", 0.1)
            risk_level = analysis.get("severity", "Normal").upper()
        except Exception as e:
            # Fallback if his model fails to load
            print(f"ML Warning: {e}")
            risk_score = 0.9 if is_anomalous_sample else 0.1
            risk_level = "CRITICAL" if is_anomalous_sample else "NORMAL"
            analysis = {}
        
        # Merge them and ensure VIGIL's required "station_id" exists
        event_data = {
            **reading_dict, 
            **analysis,
            "station_id": track_section, 
            "risk_score": risk_score,
            "risk_level": risk_level
        }
        readings.append(event_data)
        
    return readings