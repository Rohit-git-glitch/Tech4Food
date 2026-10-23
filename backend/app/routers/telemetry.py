from typing import Dict, Any, List
from fastapi import APIRouter, status
from ..schemas.telemetry import SensorReading

router = APIRouter(prefix="/telemetry", tags=["Telemetry (Placeholder)"])


@router.get("/status", response_model=Dict[str, Any])
def telemetry_status() -> Dict[str, Any]:
    """
    Status of the environmental sensor telemetry service.
    Hardware and live MQTT/Webhook ingestion are planned for Stage 2.
    """
    return {
        "module": "telemetry",
        "status": "placeholder",
        "connected": False,
        "hardware": "ESP32 + DHT22 / DS18B20",
        "message": "Physical hardware and persistent sensor ingestion are scheduled for Stage 2. Use frontend sample telemetry for Stage 1.",
        "plannedEndpoints": [
            "GET /api/v1/telemetry/latest",
            "GET /api/v1/telemetry/history?hours=24",
            "POST /api/v1/telemetry/ingest",
        ],
    }
