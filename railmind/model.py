import os
import pickle
import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest

MODEL_PATH = os.path.join(os.path.dirname(__file__), "vigil_model.pkl")

# Normal range constants
NORMAL_RANGES = {
    'signal_voltage': (220.0, 240.0),
    'vibration_hz': (40.0, 60.0),
    'speed_kmh': (60.0, 120.0),
    'temperature_celsius': (25.0, 45.0)
}

def train_model():
    data_path = os.path.join(os.path.dirname(__file__), "sensors.csv")
    if not os.path.exists(data_path):
        raise FileNotFoundError(f"Data file not found at {data_path}. Run data_generator.py first.")
        
    df = pd.read_csv(data_path)
    
    # Filter for normal data to train the Isolation Forest (semi-supervised approach)
    normal_df = df[
        (df['signal_voltage'] >= NORMAL_RANGES['signal_voltage'][0]) &
        (df['signal_voltage'] <= NORMAL_RANGES['signal_voltage'][1]) &
        (df['vibration_hz'] >= NORMAL_RANGES['vibration_hz'][0]) &
        (df['vibration_hz'] <= NORMAL_RANGES['vibration_hz'][1]) &
        (df['speed_kmh'] >= NORMAL_RANGES['speed_kmh'][0]) &
        (df['speed_kmh'] <= NORMAL_RANGES['speed_kmh'][1]) &
        (df['temperature_celsius'] >= NORMAL_RANGES['temperature_celsius'][0]) &
        (df['temperature_celsius'] <= NORMAL_RANGES['temperature_celsius'][1])
    ]
    
    features = ['signal_voltage', 'vibration_hz', 'speed_kmh', 'temperature_celsius']
    X = normal_df[features].values
    
    # Train IsolationForest
    # We use a low contamination since we trained on filtered normal data
    model = IsolationForest(n_estimators=100, random_state=42, contamination=0.01)
    model.fit(X)
    
    with open(MODEL_PATH, 'wb') as f:
        pickle.dump(model, f)
        
    print(f"Model successfully trained and saved to {MODEL_PATH}")

# Load model globally if it exists
model = None
if os.path.exists(MODEL_PATH):
    with open(MODEL_PATH, 'rb') as f:
        model = pickle.load(f)

def predict(row_dict: dict) -> dict:
    global model
    if model is None:
        if os.path.exists(MODEL_PATH):
            with open(MODEL_PATH, 'rb') as f:
                model = pickle.load(f)
        else:
            raise FileNotFoundError("Model not trained yet. Run model.py first.")
            
    # Extract features
    features = [
        row_dict.get('signal_voltage', 230.0),
        row_dict.get('vibration_hz', 50.0),
        row_dict.get('speed_kmh', 90.0),
        row_dict.get('temperature_celsius', 35.0)
    ]
    
    train_id = row_dict.get('train_id', 'UNKNOWN_TRAIN')
    track_section = row_dict.get('track_section', 'UNKNOWN_SECTION')
    
    # Check physical out of bounds
    out_of_bounds = []
    critical_bounds = []
    
    v_val = row_dict.get('signal_voltage', 230.0)
    vib_val = row_dict.get('vibration_hz', 50.0)
    spd_val = row_dict.get('speed_kmh', 90.0)
    temp_val = row_dict.get('temperature_celsius', 35.0)
    
    if v_val < 220.0 or v_val > 240.0:
        out_of_bounds.append(f"signal voltage ({v_val}V)")
        if v_val < 210.0 or v_val > 250.0:
            critical_bounds.append("voltage")
            
    if vib_val < 40.0 or vib_val > 60.0:
        out_of_bounds.append(f"vibration ({vib_val}Hz)")
        if vib_val < 35.0 or vib_val > 65.0:
            critical_bounds.append("vibration")
            
    if spd_val < 60.0 or spd_val > 120.0:
        out_of_bounds.append(f"speed ({spd_val}km/h)")
        if spd_val < 50.0 or spd_val > 135.0:
            critical_bounds.append("speed")
            
    if temp_val < 25.0 or temp_val > 45.0:
        out_of_bounds.append(f"temperature ({temp_val}°C)")
        if temp_val < 20.0 or temp_val > 50.0:
            critical_bounds.append("temperature")
            
    # Get model prediction and score
    # IsolationForest decision_function returns negative values for anomalies, positive for inliers.
    # Standard values range roughly from -0.5 to 0.5.
    raw_score = float(model.decision_function([features])[0])
    model_pred = model.predict([features])[0]
    
    # Map raw score [-0.5, 0.5] to [0, 1] anomaly probability (higher = more anomalous)
    # A normal score is usually positive (> 0.0). Anomalies have score < 0.0.
    anomaly_score = float(np.clip(0.5 - raw_score, 0.0, 1.0))
    
    # Force high score if explicitly out of bounds
    if len(out_of_bounds) > 0:
        anomaly_score = max(anomaly_score, 0.6)
    if len(critical_bounds) > 0:
        anomaly_score = max(anomaly_score, 0.85)
        
    is_anomaly = bool(model_pred == -1 or len(out_of_bounds) > 0)
    
    if not is_anomaly:
        severity = "Normal"
        recommended_action = f"System operating within normal parameters for {train_id} on {track_section}."
    else:
        if len(critical_bounds) > 0 or anomaly_score > 0.8:
            severity = "Critical"
            reasons = ", ".join(out_of_bounds)
            recommended_action = f"CRITICAL: Abnormal {reasons} detected for {train_id} on {track_section}. Immediately restrict speed and dispatch a track maintenance team."
        else:
            severity = "Warning"
            reasons = ", ".join(out_of_bounds)
            recommended_action = f"WARNING: Out-of-range {reasons} detected for {train_id} on {track_section}. Monitor parameters closely and schedule standard inspection at next station."
            
    return {
        "is_anomaly": is_anomaly,
        "anomaly_score": round(anomaly_score, 2),
        "severity": severity,
        "recommended_action": recommended_action
    }

if __name__ == "__main__":
    train_model()
