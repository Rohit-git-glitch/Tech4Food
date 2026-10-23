from typing import Optional
from .base import BaseInventoryRepository
from .in_memory import InMemoryInventoryRepository
from .sqlite import SqliteInventoryRepository
from ..config import get_settings

_in_memory_instance: Optional[InMemoryInventoryRepository] = None
_sqlite_instance: Optional[SqliteInventoryRepository] = None


def get_inventory_repository() -> BaseInventoryRepository:
    """
    Dependency injection provider for the inventory repository.
    
    Returns the persistent SQLite repository by default for development and production,
    or the in-memory repository if USE_IN_MEMORY_REPO=true is explicitly configured.
    """
    global _in_memory_instance, _sqlite_instance
    settings = get_settings()

    if settings.use_in_memory_repo:
        if _in_memory_instance is None:
            _in_memory_instance = InMemoryInventoryRepository()
        return _in_memory_instance

    # Default persistent storage: SQLite
    if _sqlite_instance is None:
        _sqlite_instance = SqliteInventoryRepository(settings.resolved_sqlite_db_path)
    return _sqlite_instance


def reset_repository_instances() -> None:
    """Resets cached singleton instances (primarily for testing and isolation)."""
    global _in_memory_instance, _sqlite_instance
    _in_memory_instance = None
    _sqlite_instance = None


__all__ = [
    "BaseInventoryRepository",
    "InMemoryInventoryRepository",
    "SqliteInventoryRepository",
    "get_inventory_repository",
    "reset_repository_instances",
]
