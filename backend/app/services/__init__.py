from .inventory_service import InventoryService
from ..repositories import get_inventory_repository


def get_inventory_service() -> InventoryService:
    repo = get_inventory_repository()
    return InventoryService(repo)


__all__ = ["InventoryService", "get_inventory_service"]
