#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# VIGIL RailMind — Quick Start Script
# Run from the railmind/ directory:  bash start.sh
# ─────────────────────────────────────────────────────────────────────────────
set -e

cd "$(dirname "$0")"

# ── 1. Guard: GROQ_API_KEY must be set ────────────────────────────────────────
if [ -z "$GROQ_API_KEY" ]; then
  echo ""
  echo "  ⚠️  GROQ_API_KEY is not set."
  echo "  Export it before running:"
  echo "  export GROQ_API_KEY=gsk_..."
  echo ""
  exit 1
fi

# ── 2. Activate venv (create if missing) ─────────────────────────────────────
if [ ! -d "venv" ]; then
  echo "→ Creating virtual environment..."
  python3 -m venv venv
fi
source venv/bin/activate

# ── 3. Install dependencies ───────────────────────────────────────────────────
echo "→ Installing/updating dependencies..."
pip install -q -r requirements.txt

# ── 4. Rebuild model if pkl is missing ───────────────────────────────────────
if [ ! -f "vigil_model.pkl" ]; then
  echo "→ vigil_model.pkl not found — regenerating..."
  if [ ! -f "sensors.csv" ]; then
    echo "→ sensors.csv not found — generating training data..."
    python data_generator.py
  fi
  python model.py
fi

# ── 5. Start uvicorn ─────────────────────────────────────────────────────────
echo ""
echo "✅  VIGIL RailMind starting on http://0.0.0.0:8000"
echo "    Stream:  http://localhost:8000/stream"
echo "    Health:  http://localhost:8000/health"
echo ""
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
