from typing import Dict, Any
from fastapi import APIRouter

router = APIRouter(prefix="/alerts", tags=["Safety Alerts (Placeholder)"])


@router.get("/status", response_model=Dict[str, Any])
def alerts_status() -> Dict[str, Any]:
    """
    Status of the automated safety alerts service.
    Excursion evaluation and cloud acknowledgement are planned for Stage 2.
    """
    return {
        "module": "alerts",
        "status": "placeholder",
        "connected": False,
        "message": "Persistent safety alerts and automatic excursion monitors are scheduled for Stage 2.",
        "plannedEndpoints": [
            "GET /api/v1/alerts",
            "PATCH /api/v1/alerts/{id}/acknowledge",
            "POST /api/v1/alerts",
        ],
    }
