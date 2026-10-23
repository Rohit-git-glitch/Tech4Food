from typing import Optional, Literal
from .common import CamelModel


class SafetyAlertResponse(CamelModel):
    id: str
    title: str
    message: str
    severity: Literal['critical', 'warning', 'info']
    category: Literal['temperature', 'expiry', 'sensor', 'storage', 'door']
    timestamp: str
    acknowledged: bool
    acknowledged_at: Optional[str] = None
    related_food_item_id: Optional[str] = None
