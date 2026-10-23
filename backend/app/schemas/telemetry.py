from typing import Literal
from .common import CamelModel


class SensorReading(CamelModel):
    timestamp: str
    time_full: str
    temperature: float
    humidity: float
    freezer_temp: float
    door_open: bool
    status: Literal['optimal', 'warning', 'critical']


class TelemetryIngestPayload(CamelModel):
    device_id: str
    temperature: float
    humidity: float
    freezer_temp: float
    door_open: bool
