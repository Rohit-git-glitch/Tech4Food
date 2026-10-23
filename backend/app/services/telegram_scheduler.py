import asyncio
import logging

from ..config import get_settings
from .telegram_alert_service import TelegramAlertService

logger = logging.getLogger(__name__)


async def run_telegram_alert_scheduler(stop_event: asyncio.Event) -> None:
    settings = get_settings()
    checker = TelegramAlertService()
    interval = max(60, settings.telegram_check_interval_seconds)
    while not stop_event.is_set():
        try:
            await checker.check_expiring_items()
        except Exception:
            logger.exception("Telegram expiry check failed.")
        try:
            await asyncio.wait_for(stop_event.wait(), timeout=interval)
        except asyncio.TimeoutError:
            continue
