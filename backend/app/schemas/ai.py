from typing import Literal

from pydantic import BaseModel, Field


class FoodCommand(BaseModel):
    action: Literal["add", "remove", "move", "unknown"] = "unknown"
    food_name: str = ""
    quantity: float | None = Field(default=None, gt=0)
    unit: str = "unknown"
    location: Literal["Refrigerator", "Freezer", "Pantry", "unknown"] = "unknown"
    destination_location: Literal[
        "Refrigerator", "Freezer", "Pantry", "unknown"
    ] = "unknown"
    clarification_needed: bool = False
    clarification_question: str = ""
    category: str = "Other"
    shelf_life_recommendation_days: int | None = Field(default=None, ge=1)
    printed_expiry_date: str | None = None
    date_added: str | None = None
    confidence: float = Field(default=0.0, ge=0.0, le=1.0)
    safety_advisory: str = ""


class GeminiFoodCommand(BaseModel):
    action: Literal["add", "remove", "move", "unknown"] = "unknown"
    food_name: str = ""
    quantity: float | None = None
    unit: str = "unknown"
    location: Literal["Refrigerator", "Freezer", "Pantry", "unknown"] = "unknown"
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


class TranscriptRequest(BaseModel):
    transcript: str = Field(..., min_length=1)
