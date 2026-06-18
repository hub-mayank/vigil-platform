# VIGIL — REAL DATA UPGRADE — ANTIGRAVITY EXECUTION GUIDE

## Context
Adds: (1) real Indian train numbers + station names replacing placeholder
labels, (2) live weather (Open-Meteo) blended into synthetic sensor
baseline, (3) Supabase persistence for alert history + Groq output.
All changes are additive — existing endpoints/shapes unchanged, only
extended.

## Files provided (in this delivery)
Backend: `rail_data.py`, `weather.py`, `db.py`, `data_generator.py` (replaces old), `main.py` (replaces old)
Frontend: `VigilStreamProvider.jsx`, `AlertFeed.jsx`, `AlertModal.jsx` (all replace old)

---

## STEP 1 — Supabase setup (5 min)
1. Create free project at supabase.com.
2. SQL Editor → run the two CREATE TABLE statements from the top
   docstring of `db.py` (train_state, alert_history).
3. Project Settings → API → copy Project URL and anon public key.

## STEP 2 — Backend env vars (Railway dashboard)
Add:
SUPABASE_URL=<project url>
SUPABASE_KEY=<anon key>
GROQ_API_KEY=<existing key, unchanged>

## STEP 3 — Backend files (railmind/ folder)
Replace: main.py, data_generator.py
Add new: rail_data.py, weather.py, db.py
Update requirements.txt — add two lines: httpx, supabase

## STEP 4 — Force regeneration of stale data
Delete sensors.csv and vigil_model.pkl from the Railway deployment if
they persist across deploys (check Railway volume settings — if none,
skip, fresh deploy regenerates them). The lifespan hook in main.py
auto-regenerates both on missing-file detection.

## STEP 5 — Deploy backend
Push to railmind-backend branch — Railway auto-deploys.
Verify: GET /health returns {"status": "VIGIL RailMind Online"}
Verify: GET /stream (browser tab) — events now include
real_train_number and real_station_name fields.
Check Railway logs for "Weather cache warmed." — confirms Open-Meteo
reachable. If it logs a warning instead, app still works (graceful
fallback), just without live weather blend until cache populates.

## STEP 6 — Frontend files (vigil-dashboard/src/)
Replace: VigilStreamProvider.jsx, components/AlertFeed.jsx,
components/AlertModal.jsx
No new imports/packages required.

## STEP 7 — Deploy frontend
Push to vigil-frontend branch — Vercel auto-deploys.
Verify on live Vercel URL: Live Alert Feed shows real train numbers
(e.g. "12301") and real station names (e.g. "New Delhi") instead of
TRAIN_001/SECTION_A. Click a Critical alert — modal shows same real
labels, "Internal ref: TRAIN_XXX · SECTION_X" as secondary line.

## STEP 8 — Verify Supabase is receiving data
Supabase dashboard — Table Editor — train_state should show rows
updating every ~2s (one per train). alert_history should show rows
appearing whenever a Warning/Critical fires, with agent_trace (jsonb)
and source ('groq' / 'ml_fallback' / 'ml_stream') populated.

## STEP 9 — Smoke test /agent/analyze end-to-end
curl -X POST https://<railway-url>/agent/analyze \
  -H "Content-Type: application/json" \
  -d '{"train_id":"TRAIN_001","track_section":"SECTION_A","signal_voltage":195.0,"vibration_hz":85.0,"speed_kmh":145.0,"temperature_celsius":67.0}'

Expect: real_train_number "12301", real_station_name "New Delhi",
AI-generated recommended_action, agent_trace ending in Groq success
line. Then confirm a matching row appeared in Supabase alert_history.

## Rollback
If anything breaks: revert main.py/data_generator.py to prior versions,
remove rail_data.py/weather.py/db.py imports. No DB migration needed to
roll back — Supabase tables simply stop receiving writes, nothing else
depends on them.
