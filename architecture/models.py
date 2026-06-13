"""
VIGIL NEXUS — Pydantic Models
Typed schemas for sensor readings, risk results, enriched risk data,
and alert objects used across all agents.
"""

from pydantic import BaseModel


class SensorReading(BaseModel):
    signal_strength: float
    temperature: float
    vibration: float
    maintenance_days: int
    weather: str


class RiskResult(BaseModel):
    station_id: str
    risk_score: float
    risk_level: str
    sensor_data: dict


class EnrichedRisk(BaseModel):
    station_id: str
    risk_score: float
    risk_level: str
    sensor_data: dict
    trains_affected: int
    next_train: str


class AlertObject(BaseModel):
    id: str
    timestamp: str
    station: str
    risk_score: float
    risk_level: str
    message: str
    recommended_action: str
