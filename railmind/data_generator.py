import pandas as pd
import numpy as np
from datetime import datetime, timedelta

def generate_data():
    np.random.seed(42)
    n_rows = 10000
    n_anomalies = 200
    
    # Generate base normal data for all rows first
    start_time = datetime.now() - timedelta(days=10)
    timestamps = [start_time + timedelta(seconds=i * 60) for i in range(n_rows)]
    
    train_ids = [f"TRAIN_{np.random.randint(1, 51):03d}" for _ in range(n_rows)]
    track_sections = [f"SECTION_{chr(np.random.randint(65, 75))}" for _ in range(n_rows)]
    
    # Normal ranges
    signal_voltage = np.random.uniform(220, 240, n_rows)
    vibration_hz = np.random.uniform(40, 60, n_rows)
    speed_kmh = np.random.uniform(60, 120, n_rows)
    temperature_celsius = np.random.uniform(25, 45, n_rows)
    
    # Select 200 random indices to corrupt
    anomaly_indices = np.random.choice(n_rows, n_anomalies, replace=False)
    
    for idx in anomaly_indices:
        # Choose which variable to corrupt (or corrupt multiple)
        anomaly_choice = np.random.choice(['voltage', 'vibration', 'speed', 'temperature', 'multi'])
        
        if anomaly_choice == 'voltage':
            signal_voltage[idx] = np.random.choice([np.random.uniform(170, 210), np.random.uniform(250, 280)])
        elif anomaly_choice == 'vibration':
            vibration_hz[idx] = np.random.choice([np.random.uniform(10, 35), np.random.uniform(65, 100)])
        elif anomaly_choice == 'speed':
            speed_kmh[idx] = np.random.choice([np.random.uniform(10, 50), np.random.uniform(130, 170)])
        elif anomaly_choice == 'temperature':
            temperature_celsius[idx] = np.random.choice([np.random.uniform(5, 20), np.random.uniform(50, 80)])
        elif anomaly_choice == 'multi':
            signal_voltage[idx] = np.random.uniform(170, 210)
            vibration_hz[idx] = np.random.uniform(65, 100)
            speed_kmh[idx] = np.random.uniform(130, 170)
            temperature_celsius[idx] = np.random.uniform(50, 80)
            
    df = pd.DataFrame({
        'timestamp': [ts.isoformat() for ts in timestamps],
        'train_id': train_ids,
        'track_section': track_sections,
        'signal_voltage': np.round(signal_voltage, 2),
        'vibration_hz': np.round(vibration_hz, 2),
        'speed_kmh': np.round(speed_kmh, 2),
        'temperature_celsius': np.round(temperature_celsius, 2)
    })
    
    df.to_csv('sensors.csv', index=False)
    print("Successfully generated sensors.csv with 10,000 records (200 anomalies).")

if __name__ == "__main__":
    generate_data()
