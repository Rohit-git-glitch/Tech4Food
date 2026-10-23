from typing import List, Optional
from ..repositories.base import BaseInventoryRepository
from ..schemas.inventory import (
    FoodItemCreate,
    FoodItemUpdate,
    FoodItemResponse,
    StorageLocation,
    FoodCategory,
    FoodStatus,
)


class InventoryService:
    def __init__(self, repo: BaseInventoryRepository):
        self.repo = repo

    def list_inventory(
        self,
        location: Optional[StorageLocation] = None,
        category: Optional[FoodCategory] = None,
        status: Optional[FoodStatus] = None,
        search: Optional[str] = None,
    ) -> List[FoodItemResponse]:
        return self.repo.get_all(location=location, category=category, status=status, search=search)

    def get_item(self, item_id: str) -> Optional[FoodItemResponse]:
        return self.repo.get_by_id(item_id)

    def add_item(self, item: FoodItemCreate) -> FoodItemResponse:
        return self.repo.create(item)

    def update_item(self, item_id: str, updates: FoodItemUpdate) -> Optional[FoodItemResponse]:
        return self.repo.update(item_id, updates)

    def remove_item(self, item_id: str) -> bool:
        return self.repo.delete(item_id)

    def relocate_item(self, item_id: str, target_location: StorageLocation) -> Optional[FoodItemResponse]:
        return self.repo.move_location(item_id, target_location)
