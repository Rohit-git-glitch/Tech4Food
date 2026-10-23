from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query, status
from ..schemas.inventory import (
    FoodItemCreate,
    FoodItemUpdate,
    FoodLocationUpdate,
    FoodItemResponse,
    StorageLocation,
    FoodCategory,
    FoodStatus,
)
from ..services import InventoryService, get_inventory_service

router = APIRouter(prefix="/inventory", tags=["Inventory"])


@router.get("", response_model=List[FoodItemResponse])
def list_inventory(
    location: Optional[StorageLocation] = Query(None, description="Filter by storage location"),
    category: Optional[FoodCategory] = Query(None, description="Filter by food category"),
    status: Optional[FoodStatus] = Query(None, description="Filter by shelf-life status"),
    search: Optional[str] = Query(None, description="Search by food name, notes, or category"),
    service: InventoryService = Depends(get_inventory_service),
) -> List[FoodItemResponse]:
    """Retrieve all food items with optional filtering and search."""
    return service.list_inventory(location=location, category=category, status=status, search=search)


@router.post("", response_model=FoodItemResponse, status_code=status.HTTP_201_CREATED)
def create_food_item(
    item: FoodItemCreate,
    service: InventoryService = Depends(get_inventory_service),
) -> FoodItemResponse:
    """Log a new food item into smart fridge inventory."""
    return service.add_item(item)


@router.get("/{item_id}", response_model=FoodItemResponse)
def get_food_item(
    item_id: str,
    service: InventoryService = Depends(get_inventory_service),
) -> FoodItemResponse:
    """Retrieve a single food record by its unique ID."""
    food = service.get_item(item_id)
    if not food:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Food item with ID '{item_id}' not found",
        )
    return food


@router.put("/{item_id}", response_model=FoodItemResponse)
def update_food_item(
    item_id: str,
    updates: FoodItemUpdate,
    service: InventoryService = Depends(get_inventory_service),
) -> FoodItemResponse:
    """Update details of an existing food record."""
    updated = service.update_item(item_id, updates)
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Food item with ID '{item_id}' not found",
        )
    return updated


@router.patch("/{item_id}/location", response_model=FoodItemResponse)
def relocate_food_item(
    item_id: str,
    payload: FoodLocationUpdate,
    service: InventoryService = Depends(get_inventory_service),
) -> FoodItemResponse:
    """Relocate a food item to a new storage zone (Refrigerator, Freezer, or Pantry/Crisper)."""
    relocated = service.relocate_item(item_id, payload.target_location)
    if not relocated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Food item with ID '{item_id}' not found",
        )
    return relocated


@router.delete("/{item_id}", response_model=Dict[str, Any])
def delete_food_item(
    item_id: str,
    reason: Optional[str] = Query(None, description="Optional reason for removal"),
    service: InventoryService = Depends(get_inventory_service),
) -> Dict[str, Any]:
    """Remove a food item from smart fridge inventory."""
    deleted = service.remove_item(item_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Food item with ID '{item_id}' not found",
        )
    return {
        "success": True,
        "message": f"Food item '{item_id}' removed successfully",
        "deletedId": item_id,
        "reason": reason or "consumed",
    }
