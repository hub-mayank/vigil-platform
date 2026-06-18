"""
rail_data.py — Real Indian Railways metadata (static, public, legal).

Source: Wikipedia "Train numbering in India" (5-digit numbering scheme,
1XXXX/2XXXX = long-distance express/superfast) and "List of railway
junction stations in India" (major junction names/states). No scraping,
no auth, no rate limits — these are fixed reference tables, hardcoded
once and reused.

This module does NOT provide live train positions (no public legal API
exists for that — confirmed). It provides REAL train numbers and REAL
station names so the synthetic sensor simulation uses authentic labels
instead of placeholder TRAIN_001/SECTION_A strings.
"""

import random

# 50 real Indian Railways train numbers, all valid 5-digit superfast/express
# range (12xxx/22xxx = superfast, per the official numbering scheme).
# Mapped 1:1 against your existing internal TRAIN_001..TRAIN_050 slots so
# nothing downstream (model.py, frontend) needs to change shape.
REAL_TRAIN_NUMBERS = [
    "12301", "12302", "12951", "12952", "12009", "12010", "12259", "12260",
    "22691", "22692", "12626", "12627", "12723", "12724", "12839", "12840",
    "12925", "12926", "12903", "12904", "12137", "12138", "12615", "12616",
    "12649", "12650", "12621", "12622", "12423", "12424", "12431", "12432",
    "12555", "12556", "12565", "12566", "12273", "12274", "12295", "12296",
    "12321", "12322", "12381", "12382", "12869", "12870", "12841", "12842",
    "12245", "12246",
]

# 10 real junction stations — matches the existing SECTION_A..SECTION_J
# slots used throughout the codebase (frontend map markers, model.py, etc).
# (station name, station code, state) — from the junction-stations table.
REAL_JUNCTIONS = {
    "SECTION_A": {"name": "New Delhi",  "code": "NDLS", "state": "Delhi"},
    "SECTION_B": {"name": "Lucknow",     "code": "LJN",  "state": "Uttar Pradesh"},
    "SECTION_C": {"name": "Kolkata",     "code": "KOAA", "state": "West Bengal"},
    "SECTION_D": {"name": "Patna",       "code": "PNBE", "state": "Bihar"},
    "SECTION_E": {"name": "Hyderabad",   "code": "HYB",  "state": "Telangana"},
    "SECTION_F": {"name": "Chennai",     "code": "MAS",  "state": "Tamil Nadu"},
    "SECTION_G": {"name": "Mumbai",      "code": "CSMT", "state": "Maharashtra"},
    "SECTION_H": {"name": "Ahmedabad",   "code": "ADI",  "state": "Gujarat"},
    "SECTION_I": {"name": "Nagpur",      "code": "NGP",  "state": "Maharashtra"},
    "SECTION_J": {"name": "Pune",        "code": "PUNE", "state": "Maharashtra"},
}

# Lat/long for the weather lookup (Open-Meteo needs coordinates, not names)
JUNCTION_COORDS = {
    "SECTION_A": (28.6139, 77.2090),
    "SECTION_B": (26.8467, 80.9462),
    "SECTION_C": (22.5726, 88.3639),
    "SECTION_D": (25.5941, 85.1376),
    "SECTION_E": (17.3850, 78.4867),
    "SECTION_F": (13.0827, 80.2707),
    "SECTION_G": (19.0760, 72.8777),
    "SECTION_H": (23.0225, 72.5714),
    "SECTION_I": (21.1458, 79.0882),
    "SECTION_J": (18.5204, 73.8567),
}

_TRAIN_SLOT_MAP = {f"TRAIN_{i:03d}": REAL_TRAIN_NUMBERS[i - 1] for i in range(1, 51)}


def real_train_id(internal_id: str) -> str:
    """Map internal TRAIN_001 slot -> real 5-digit train number for display."""
    return _TRAIN_SLOT_MAP.get(internal_id, internal_id)


def random_train_slot() -> str:
    """Pick a random internal slot (TRAIN_001..TRAIN_050) — unchanged behavior."""
    return f"TRAIN_{random.randint(1, 50):03d}"


def random_section_slot() -> str:
    """Pick a random internal section slot (SECTION_A..SECTION_J) — unchanged behavior."""
    return f"SECTION_{chr(random.randint(65, 74))}"


def junction_name(section_slot: str) -> str:
    return REAL_JUNCTIONS.get(section_slot, {}).get("name", section_slot)
