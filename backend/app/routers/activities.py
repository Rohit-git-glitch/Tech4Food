from typing import Dict, Any
from fastapi import APIRouter

router = APIRouter(prefix="/activities", tags=["Activity History (Placeholder)"])


@router.get("/status", response_model=Dict[str, Any])
def activities_status() -> Dict[str, Any]:
    """
    Status of the activity history and audit trail service.
    Centralized event streaming is planned for Stage 2.
    """
    return {
        "module": "activities",
        "status": "placeholder",
        "connected": False,
        "message": "Persistent audit logging for user operations and alerts is scheduled for Stage 2.",
        "plannedEndpoints": [
            "GET /api/v1/activities",
            "POST /api/v1/activities/log",
            "GET /api/v1/activities/export",
        ],
    }
