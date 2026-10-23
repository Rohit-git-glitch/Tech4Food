
from typing import Literal
from pydantic import BaseModel, Field


class FoodCommand(BaseModel):
    """Structured interpretation of a user's food inventory command."""

    action: Literal["add", "remove", "move", "unknown"] = "unknown"

    food_name: str = Field(
        default="",
        description="Name of the food item"
    )

    quantity: float | None = Field(
        default=None,
        description="Quantity of food, if specified"
    )

    unit: str = Field(
        default="unknown",
        description="Quantity unit, such as pieces, kg, or L"
    )

    location: Literal[
        "Refrigerator", "Freezer", "Pantry", "unknown"
    ] = "unknown"

    destination_location: Literal[
        "Refrigerator", "Freezer", "Pantry", "unknown"
    ] = "unknown"

    clarification_needed: bool = False
    clarification_question: str = ""

    category: str = "Other"
    shelf_life_recommendation_days: int | None = None
    printed_expiry_date: str | None = None
    date_added: str | None = None
    confidence: float = 0.0
    safety_advisory: str = ""
