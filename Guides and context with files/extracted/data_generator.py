import pandas as pd
import numpy as np
from datetime import datetime, timedelta

from rail_data import _TRAIN_SLOT_MAP, REAL_JUNCTIONS

def generate_data():
    np.random.seed(42)
    n_rows = 10000
    n_anomalies = 200

    start_time = datetime.now() - timedelta(days=10)
    timestamps = [start_time + timedelta(seconds=i * 60) for i in range(n_rows)]

    # Internal slots unchanged (TRAIN_001.., SECTION_A..) — model.py and the
    # rest of the pipeline still key off these. Real train numbers / station
    # names are attached as additional display-only columns so nothing
    # downstream breaks, while output data now carries authentic labels.
    train_slots = [f"TRAIN_{np.random.randint(1, 51):03d}" for _ in range(n_rows)]
    section_slots = [f"SECTION_{chr(np.random.randint(65, 75))}" for _ in range(n_rows)]

    real_train_numbers = [_TRAIN_SLOT_MAP.get(t, t) for t in train_slots]
    real_station_names = [REAL_JUNCTIONS.get(s, {}).get("name", s) for s in section_slots]

    signal_voltage = np.random.uniform(220, 240, n_rows)
    vibration_hz = np.random.uniform(40, 60, n_rows)
    speed_kmh = np.random.uniform(60, 120, n_rows)
    temperature_celsius = np.random.uniform(25, 45, n_rows)

    anomaly_indices = np.random.choice(n_rows, n_anomalies, replace=False)

    for idx in anomaly_indices:
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
        'train_id': train_slots,                  # internal slot — model.py keys off this, unchanged
        'real_train_number': real_train_numbers,   # NEW — real 5-digit train number for display
        'track_section': section_slots,            # internal slot — unchanged
        'real_station_name': real_station_names,    # NEW — real junction station name for display
        'signal_voltage': np.round(signal_voltage, 2),
        'vibration_hz': np.round(vibration_hz, 2),
        'speed_kmh': np.round(speed_kmh, 2),
        'temperature_celsius': np.round(temperature_celsius, 2)
    })

    df.to_csv('sensors.csv', index=False)
    print("Successfully generated sensors.csv with 10,000 records (200 anomalies), real train/station labels attached.")

if __name__ == "__main__":
    generate_data()
