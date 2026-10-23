from typing import Optional, Dict, Any, Literal
from .common import CamelModel


class ActivityEventResponse(CamelModel):
    id: str
    type: Literal[
        'item_added',
        'item_removed',
        'item_edited',
        'item_moved',
        'alert_raised',
        'alert_acknowledged',
        'threshold_updated',
        'system_reset',
        'system_event',
    ]
    title: str
    description: str
    timestamp: str
    metadata: Optional[Dict[str, Any]] = None
