from abc import ABC, abstractmethod
from typing import List, Optional
from ..schemas.inventory import (
    FoodItemCreate,
    FoodItemUpdate,
    FoodItemResponse,
    StorageLocation,
    FoodCategory,
    FoodStatus,
)


class BaseInventoryRepository(ABC):
    """Abstract interface for inventory repositories."""

    @abstractmethod
    def get_all(
        self,
        location: Optional[StorageLocation] = None,
        category: Optional[FoodCategory] = None,
        status: Optional[FoodStatus] = None,
        search: Optional[str] = None,
    ) -> List[FoodItemResponse]:
        pass

    @abstractmethod
    def get_by_id(self, item_id: str) -> Optional[FoodItemResponse]:
        pass

    @abstractmethod
    def create(self, item: FoodItemCreate) -> FoodItemResponse:
        pass

    @abstractmethod
    def update(self, item_id: str, updates: FoodItemUpdate) -> Optional[FoodItemResponse]:
        pass

    @abstractmethod
    def delete(self, item_id: str) -> bool:
        pass

    @abstractmethod
    def move_location(self, item_id: str, target_location: StorageLocation) -> Optional[FoodItemResponse]:
        pass

    @abstractmethod
    def is_connected(self) -> bool:
        pass

    @abstractmethod
    def get_provider_name(self) -> str:
        pass
