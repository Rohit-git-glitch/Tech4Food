import uuid
from datetime import datetime, timedelta, timezone
from typing import List, Optional, Dict
from .base import BaseInventoryRepository
from ..schemas.inventory import (
    FoodItemCreate,
    FoodItemUpdate,
    FoodItemResponse,
    StorageLocation,
    FoodCategory,
    FoodStatus,
)


def get_relative_iso_date(days_offset: int) -> str:
    """Helper to return an ISO 8601 UTC timestamp offset by days."""
    dt = datetime.now(timezone.utc) + timedelta(days=days_offset)
    return dt.isoformat()


DEFAULT_GUIDELINES: Dict[str, str] = {
    'Dairy & Eggs': 'Keep refrigerated below 4°C. Consume within 7 days of opening.',
    'Produce': 'High humidity crisper drawer. Keep dry to prevent wilting.',
    'Meat & Seafood': 'Store on lowest shelf. Cook or freeze within 48 hours.',
    'Leftovers': 'Airtight container. Reheat thoroughly to internal 74°C.',
    'Beverages': 'Refrigerate once opened. Store upright.',
    'Condiments & Sauces': 'Can be stored in door compartments.',
    'Bakery': 'Keep in cool dry place or freeze.',
    'Other': 'Check packaging guidance and maintain refrigeration.',
}


def compute_status(expiry_iso: str) -> FoodStatus:
    try:
        expiry_dt = datetime.fromisoformat(expiry_iso.replace('Z', '+00:00'))
        now = datetime.now(timezone.utc)
        diff_days = (expiry_dt - now).total_seconds() / 86400.0

        if diff_days < 0:
            return 'Expired'
        elif diff_days <= 0.5:
            return 'Requires Attention'
        elif diff_days <= 2.0:
            return 'Approaching Expiry'
        else:
            return 'Fresh'
    except Exception:
        return 'Fresh'


class InMemoryInventoryRepository(BaseInventoryRepository):
    """
    In-Memory Inventory Repository for Stage 1.
    Pre-seeded with sample data to ensure immediate compatibility with the frontend.
    """

    def __init__(self):
        self._items: Dict[str, FoodItemResponse] = {}
        self._seed_initial_data()

    def _seed_initial_data(self):
        initial = [
            FoodItemResponse(
                id="food-001",
                name="Fresh Whole Milk",
                category="Dairy & Eggs",
                quantity=1.0,
                unit="L",
                location="Refrigerator",
                date_added=get_relative_iso_date(-5),
                estimated_shelf_life_days=7,
                estimated_expiry_date=get_relative_iso_date(2),
                storage_guidance="Keep refrigerated below 4°C. Consume within 7 days of opening.",
                status="Approaching Expiry",
                notes="Opened 5 days ago.",
            ),
            FoodItemResponse(
                id="food-002",
                name="Organic Baby Spinach",
                category="Produce",
                quantity=250.0,
                unit="g",
                location="Pantry/Crisper",
                date_added=get_relative_iso_date(-4),
                estimated_shelf_life_days=5,
                estimated_expiry_date=get_relative_iso_date(1),
                storage_guidance="High humidity crisper drawer. Keep dry to prevent wilting.",
                status="Approaching Expiry",
                notes="Pre-washed.",
            ),
            FoodItemResponse(
                id="food-003",
                name="Atlantic Salmon Fillet",
                category="Meat & Seafood",
                quantity=400.0,
                unit="g",
                location="Refrigerator",
                date_added=get_relative_iso_date(-2),
                estimated_shelf_life_days=2,
                estimated_expiry_date=get_relative_iso_date(0),
                storage_guidance="Store on lowest shelf. Cook or freeze immediately.",
                status="Requires Attention",
                notes="Raw fresh fish - use today or freeze.",
            ),
            FoodItemResponse(
                id="food-004",
                name="Greek Yogurt (Plain)",
                category="Dairy & Eggs",
                quantity=500.0,
                unit="g",
                location="Refrigerator",
                date_added=get_relative_iso_date(-2),
                estimated_shelf_life_days=10,
                estimated_expiry_date=get_relative_iso_date(8),
                storage_guidance="Store on middle shelf. Keep lid tightly closed.",
                status="Fresh",
                notes="Unopened seal.",
            ),
            FoodItemResponse(
                id="food-005",
                name="Free-Range Eggs",
                category="Dairy & Eggs",
                quantity=10.0,
                unit="items",
                location="Refrigerator",
                date_added=get_relative_iso_date(-6),
                estimated_shelf_life_days=21,
                estimated_expiry_date=get_relative_iso_date(15),
                storage_guidance="Keep in original carton on middle shelf.",
                status="Fresh",
                notes="Carton of 12 (2 used).",
            ),
            FoodItemResponse(
                id="food-006",
                name="Chicken Breast Fillets",
                category="Meat & Seafood",
                quantity=2.0,
                unit="packs",
                location="Freezer",
                date_added=get_relative_iso_date(-10),
                estimated_shelf_life_days=90,
                estimated_expiry_date=get_relative_iso_date(80),
                storage_guidance="Deep frozen at -18°C. Thaw in refrigerator before cooking.",
                status="Fresh",
                notes="Vacuum packed.",
            ),
        ]
        for item in initial:
            self._items[item.id] = item

    def get_all(
        self,
        location: Optional[StorageLocation] = None,
        category: Optional[FoodCategory] = None,
        status: Optional[FoodStatus] = None,
        search: Optional[str] = None,
    ) -> List[FoodItemResponse]:
        results = list(self._items.values())

        if location:
            results = [item for item in results if item.location == location]
        if category:
            results = [item for item in results if item.category == category]
        if status:
            results = [item for item in results if item.status == status]
        if search:
            q = search.strip().lower()
            results = [
                item for item in results
                if q in item.name.lower()
                or (item.notes and q in item.notes.lower())
                or q in item.category.lower()
            ]

        # Recompute status dynamically
        refreshed = []
        for item in results:
            updated_status = compute_status(item.estimated_expiry_date)
            if updated_status != item.status:
                item_dict = item.model_dump()
                item_dict['status'] = updated_status
                item = FoodItemResponse(**item_dict)
            refreshed.append(item)

        return refreshed

    def get_by_id(self, item_id: str) -> Optional[FoodItemResponse]:
        item = self._items.get(item_id)
        if not item:
            return None
        # Recalculate status
        updated_status = compute_status(item.estimated_expiry_date)
        if updated_status != item.status:
            item_dict = item.model_dump()
            item_dict['status'] = updated_status
            item = FoodItemResponse(**item_dict)
            self._items[item_id] = item
        return item

    def create(self, item: FoodItemCreate) -> FoodItemResponse:
        item_id = f"food-{uuid.uuid4().hex[:8]}"
        now_iso = datetime.now(timezone.utc).isoformat()
        expiry_iso = get_relative_iso_date(item.estimated_shelf_life_days)
        guidance = item.storage_guidance or DEFAULT_GUIDELINES.get(item.category, "Store safely.")

        new_item = FoodItemResponse(
            id=item_id,
            name=item.name.strip(),
            category=item.category,
            quantity=item.quantity,
            unit=item.unit,
            location=item.location,
            date_added=now_iso,
            estimated_shelf_life_days=item.estimated_shelf_life_days,
            estimated_expiry_date=expiry_iso,
            storage_guidance=guidance,
            status=compute_status(expiry_iso),
            notes=item.notes,
        )
        self._items[item_id] = new_item
        return new_item

    def update(self, item_id: str, updates: FoodItemUpdate) -> Optional[FoodItemResponse]:
        existing = self.get_by_id(item_id)
        if not existing:
            return None

        data = existing.model_dump()
        update_dict = updates.model_dump(exclude_unset=True)

        for key, val in update_dict.items():
            if val is not None:
                data[key] = val

        # If estimated_shelf_life_days updated, recompute expiry date
        if updates.estimated_shelf_life_days is not None:
            data['estimated_expiry_date'] = get_relative_iso_date(updates.estimated_shelf_life_days)
            data['status'] = compute_status(data['estimated_expiry_date'])

        updated_item = FoodItemResponse(**data)
        self._items[item_id] = updated_item
        return updated_item

    def delete(self, item_id: str) -> bool:
        if item_id in self._items:
            del self._items[item_id]
            return True
        return False

    def move_location(self, item_id: str, target_location: StorageLocation) -> Optional[FoodItemResponse]:
        existing = self.get_by_id(item_id)
        if not existing:
            return None

        data = existing.model_dump()
        data['location'] = target_location
        updated = FoodItemResponse(**data)
        self._items[item_id] = updated
        return updated

    def is_connected(self) -> bool:
        # In-memory storage is always internally connected and available
        return True

    def get_provider_name(self) -> str:
        return "in-memory-demo"
