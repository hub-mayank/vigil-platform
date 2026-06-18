"""
weather.py — Live weather data layer, Open-Meteo (free, no API key, no auth).

Performance design (per the 3-hour build plan):
- NEVER call Open-Meteo inside the SSE hot loop (every 2s) — pointless
  (weather doesn't change every 2s) and risks hammering a free API.
- Per-city cache with a 15-minute TTL. Stale-while-revalidate: if cache is
  stale, return the stale value immediately AND kick off a background
  refresh (asyncio.create_task) — callers are never blocked waiting on a
  live HTTP call.
- All 10 junctions share ONE background refresh task at a time per city
  (a simple in-flight flag prevents duplicate concurrent requests if many
  SSE ticks land while a refresh is already running).
"""

import asyncio
import logging
import time

import httpx

from rail_data import JUNCTION_COORDS

logger = logging.getLogger("vigil.weather")

_CACHE_TTL_SECONDS = 15 * 60  # 15 minutes
_OPEN_METEO_URL = "https://api.open-meteo.com/v1/forecast"

# section_slot -> {"temp": float, "wind": float, "fetched_at": float}
_cache: dict[str, dict] = {}
_in_flight: set[str] = set()


def _is_stale(section_slot: str) -> bool:
    entry = _cache.get(section_slot)
    if entry is None:
        return True
    return (time.monotonic() - entry["fetched_at"]) > _CACHE_TTL_SECONDS


async def _fetch_and_cache(section_slot: str) -> None:
    if section_slot in _in_flight:
        return  # a refresh is already running for this city
    _in_flight.add(section_slot)
    try:
        lat, lon = JUNCTION_COORDS[section_slot]
        async with httpx.AsyncClient(timeout=5.0) as client:
            resp = await client.get(
                _OPEN_METEO_URL,
                params={
                    "latitude": lat,
                    "longitude": lon,
                    "current": "temperature_2m,wind_speed_10m",
                },
            )
            resp.raise_for_status()
            data = resp.json()
            current = data.get("current", {})
            _cache[section_slot] = {
                "temp": current.get("temperature_2m"),
                "wind": current.get("wind_speed_10m"),
                "fetched_at": time.monotonic(),
            }
    except Exception as exc:
        logger.warning(f"Weather fetch failed for {section_slot}: {exc}")
    finally:
        _in_flight.discard(section_slot)


def get_weather_nonblocking(section_slot: str):
    """
    Returns the cached weather for this junction, or None if nothing is
    cached yet. Never blocks. If the cache is stale, schedules a background
    refresh (fire-and-forget) and still returns the stale value immediately.
    """
    if _is_stale(section_slot):
        try:
            asyncio.create_task(_fetch_and_cache(section_slot))
        except RuntimeError:
            pass
    return _cache.get(section_slot)


async def warm_cache_on_startup():
    """Call once at app startup so the first SSE ticks already have real
    data instead of waiting for the first stale-check to trigger a fetch."""
    await asyncio.gather(*(_fetch_and_cache(s) for s in JUNCTION_COORDS), return_exceptions=True)
