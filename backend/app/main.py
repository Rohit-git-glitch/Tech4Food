from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
from .config import get_settings
from .routers import (
    health_router,
    inventory_router,
    telemetry_router,
    alerts_router,
    activities_router,
    ai_router,
)

settings = get_settings()

app = FastAPI(
    title=settings.app_name,
    description="""
# Tech4Food Smart Fridge Backend API (Stage 1)

REST API supporting the Tech4Food intelligent food inventory and food safety monitoring dashboard.
Provides real-time CRUD operations, food categorization, shelf-life review projections, and placeholder contracts for telemetry, alerts, and audit logging.
    """,
    version=settings.api_version,
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_origin_regex=r"^https?://(localhost|127\.0\.0\.1)(:\d+)?$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Routers under /api/v1
app.include_router(health_router, prefix=settings.api_prefix)
app.include_router(inventory_router, prefix=settings.api_prefix)
app.include_router(telemetry_router, prefix=settings.api_prefix)
app.include_router(alerts_router, prefix=settings.api_prefix)
app.include_router(activities_router, prefix=settings.api_prefix)
app.include_router(ai_router, prefix=settings.api_prefix)


@app.get("/", include_in_schema=False)
def root():
    """Redirect root to OpenAPI interactive documentation."""
    return RedirectResponse(url="/docs")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.host,
        port=settings.port,
        reload=True,
    )
