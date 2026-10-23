from .health import router as health_router
from .inventory import router as inventory_router
from .telemetry import router as telemetry_router
from .alerts import router as alerts_router
from .activities import router as activities_router
from .ai import router as ai_router

__all__ = [
    "health_router",
    "inventory_router",
    "telemetry_router",
    "alerts_router",
    "activities_router",
    "ai_router",
]
