from fastapi import APIRouter, Depends
from ..config import Settings, get_settings
from ..schemas.health import HealthCheckResponse, ModuleStatus
from ..repositories import get_inventory_repository, BaseInventoryRepository

router = APIRouter(tags=["Health"])


@router.get("/health", response_model=HealthCheckResponse)
def get_health(
    settings: Settings = Depends(get_settings),
    repo: BaseInventoryRepository = Depends(get_inventory_repository),
) -> HealthCheckResponse:
    """
    Health check endpoint returning system status, database connection state, and module readiness.
    """
    has_supabase_creds = bool(settings.supabase_url and settings.supabase_key)
    provider = repo.get_provider_name()
    if provider == "sqlite":
        db_provider = "sqlite"
        db_connected = repo.is_connected()
        db_message = f"SQLite persistent database active ({settings.sqlite_db_path})"
    elif has_supabase_creds and not settings.use_in_memory_repo:
        db_provider = "supabase"
        db_connected = False  # Set to true when real network ping succeeds
        db_message = "Supabase configured but live connection validation pending"
    else:
        db_provider = "in-memory"
        db_connected = True
        db_message = "In-memory repository active (Supabase not configured)"

    return HealthCheckResponse(
        status="healthy",
        app_name=settings.app_name,
        api_version=settings.api_version,
        environment=settings.environment,
        database_connected=db_connected,
        database_provider=db_provider,
        database_status_message=db_message,
        modules=ModuleStatus(
            inventory="operational",
            telemetry="not_connected (placeholder)",
            alerts="not_connected (placeholder)",
            activities="not_connected (placeholder)",
            gemini_ai="not_connected",
            esp32_hardware="not_connected",
        ),
    )
