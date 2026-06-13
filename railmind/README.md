# VIGIL RailMind Backend

Anomaly detection and intelligence monitoring API for Indian Railways track/train telemetry, using FastAPI and Isolation Forest.

## Setup & Running

1. **Activate virtual environment:**
   ```bash
   source venv/bin/activate
   ```

2. **Generate data and train the model:**
   ```bash
   python data_generator.py
   python model.py
   ```

3. **Start the API server:**
   ```bash
   uvicorn main:app --reload --port 8000
   ```

## API Specification

- **GET `/health`**: Check system status.
- **POST `/analyze`**: Submit real-time sensor measurements to analyze.
- **GET `/stream`**: Consume SSE stream of telemetry (updates every 2 seconds).
