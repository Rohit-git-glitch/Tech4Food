import os
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import field_validator


class Settings(BaseSettings):
    app_name: str = "Tech4Food Smart Fridge API"
    api_version: str = "1.0.0"
    environment: str = "development"
    api_prefix: str = "/api/v1"
    host: str = "127.0.0.1"
    port: int = 8001

    # CORS origins
    allowed_origins: str = "http://localhost:5173,http://127.0.0.1:5173,http://localhost:5174,http://127.0.0.1:5174"

    # Database & Repository
    use_in_memory_repo: bool = True
    supabase_url: str = ""
    supabase_key: str = ""

    # Future integration placeholders
    gemini_api_key: str = ""
    esp32_webhook_secret: str = ""

    model_config = SettingsConfigDict(
        env_file=os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    @property
    def cors_origins_list(self) -> List[str]:
        if isinstance(self.allowed_origins, str):
            return [origin.strip() for origin in self.allowed_origins.split(",") if origin.strip()]
        return [
            "http://localhost:5173",
            "http://127.0.0.1:5173",
            "http://localhost:5174",
            "http://127.0.0.1:5174",
        ]


settings = Settings()


def get_settings() -> Settings:
    return settings
