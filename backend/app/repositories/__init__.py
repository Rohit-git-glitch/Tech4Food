from .base import BaseInventoryRepository
from .in_memory import InMemoryInventoryRepository
from ..config import get_settings

_in_memory_instance = None


def get_inventory_repository() -> BaseInventoryRepository:
    """Dependency injection provider for inventory repository."""
    global _in_memory_instance
    settings = get_settings()

    if settings.use_in_memory_repo:
        if _in_memory_instance is None:
            _in_memory_instance = InMemoryInventoryRepository()
        return _in_memory_instance

    # Future: return SupabaseInventoryRepository(settings.supabase_url, settings.supabase_key)
    if _in_memory_instance is None:
        _in_memory_instance = InMemoryInventoryRepository()
    return _in_memory_instance


__all__ = ["BaseInventoryRepository", "InMemoryInventoryRepository", "get_inventory_repository"]
