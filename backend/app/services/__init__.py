from fastapi import Depends
from .inventory_service import InventoryService
from ..repositories import get_inventory_repository, BaseInventoryRepository


def get_inventory_service(
    repo: BaseInventoryRepository = Depends(get_inventory_repository),
) -> InventoryService:
    return InventoryService(repo)


__all__ = ["InventoryService", "get_inventory_service"]
