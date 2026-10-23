from typing import Optional, Literal
from pydantic import Field
from .common import CamelModel

FoodCategory = Literal[
    'Produce',
    'Dairy & Eggs',
    'Meat & Seafood',
    'Leftovers',
    'Beverages',
    'Condiments & Sauces',
    'Bakery',
    'Other',
]

StorageLocation = Literal['Refrigerator', 'Freezer', 'Pantry/Crisper']

UnitType = Literal['items', 'g', 'kg', 'ml', 'L', 'packs', 'slices', 'bottles', 'cans']

FoodStatus = Literal['Fresh', 'Approaching Expiry', 'Requires Attention', 'Expired']


class FoodItemBase(CamelModel):
    name: str = Field(..., min_length=1, max_length=255, description="Food name")
    category: FoodCategory = Field(..., description="Food categorization")
    quantity: float = Field(..., gt=0, description="Quantity of food stored")
    unit: UnitType = Field(default="items", description="Unit of measurement")
    location: StorageLocation = Field(default="Refrigerator", description="Storage compartment")
    estimated_shelf_life_days: int = Field(default=7, ge=1, le=3650, description="Estimated shelf life in days")
    storage_guidance: Optional[str] = Field(default=None, description="Storage recommendations")
    notes: Optional[str] = Field(default=None, description="Additional context or batch notes")


class FoodItemCreate(FoodItemBase):
    """Schema for adding new food items."""
    pass


class FoodItemUpdate(CamelModel):
    """Schema for editing an existing food item."""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    category: Optional[FoodCategory] = None
    quantity: Optional[float] = Field(None, gt=0)
    unit: Optional[UnitType] = None
    location: Optional[StorageLocation] = None
    estimated_shelf_life_days: Optional[int] = Field(None, ge=1, le=3650)
    storage_guidance: Optional[str] = None
    status: Optional[FoodStatus] = None
    notes: Optional[str] = None


class FoodLocationUpdate(CamelModel):
    """Schema for relocating food between zones."""
    target_location: StorageLocation = Field(..., description="Destination storage location")


class FoodItemResponse(CamelModel):
    """Schema for food items returned to client."""
    id: str
    name: str
    category: FoodCategory
    quantity: float
    unit: UnitType
    location: StorageLocation
    date_added: str
    estimated_shelf_life_days: int
    estimated_expiry_date: str
    storage_guidance: str
    status: FoodStatus
    notes: Optional[str] = None
