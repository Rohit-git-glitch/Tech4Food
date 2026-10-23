from datetime import datetime, timezone
from typing import Iterable

from ..config import get_settings
from ..repositories import get_inventory_repository
from ..schemas.inventory import FoodItemResponse
from .telegram_service import TelegramService


def get_expiry_alert(item: FoodItemResponse) -> tuple[str, str] | None:
    try:
        expiry = datetime.fromisoformat(
            item.estimated_expiry_date.replace("Z", "+00:00")
        )
        if expiry.tzinfo is None:
            expiry = expiry.replace(tzinfo=timezone.utc)
        remaining = (expiry - datetime.now(timezone.utc)).total_seconds()
    except (AttributeError, TypeError, ValueError):
        return None

    if remaining <= 0:
        return (
            f"expired:{item.id}",
            f"⏰ Expired food alert\n{item.name} has passed its estimated expiry date.\n"
            f"Location: {item.location}\nPlease check its condition before consuming.",
        )
    if remaining <= 24 * 60 * 60:
        hours = max(1, round(remaining / 3600))
        return (
            f"within-24-hours:{item.id}",
            f"⚠️ Expiry reminder\n{item.name} may expire in about {hours} hour(s).\n"
            f"Location: {item.location}",
        )
    return None


class TelegramAlertService:
    def __init__(self, telegram: TelegramService | None = None):
        self.telegram = telegram or TelegramService()

    async def check_expiring_items(
        self, items: Iterable[FoodItemResponse] | None = None
    ) -> int:
        settings = get_settings()
        if not settings.telegram_alerts_enabled:
            return 0

        repository = get_inventory_repository()
        candidates = list(items) if items is not None else repository.get_all()
        sent_count = 0
        for item in candidates:
            alert = get_expiry_alert(item)
            if alert is None:
                continue
            alert_key, message = alert
            if not repository.claim_notification(alert_key):
                continue
            try:
                await self.telegram.send_message(message)
            except Exception:
                repository.release_notification(alert_key)
                raise
            sent_count += 1
        return sent_count
