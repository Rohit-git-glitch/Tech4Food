from typing import Dict, Any
from .common import CamelModel


class ModuleStatus(CamelModel):
    inventory: str
    telemetry: str
    alerts: str
    activities: str
    gemini_ai: str
    esp32_hardware: str


class HealthCheckResponse(CamelModel):
    status: str
    app_name: str
    api_version: str
    environment: str
    database_connected: bool
    database_provider: str
    database_status_message: str
    modules: ModuleStatus
