from typing import Any

import httpx

from ..config import get_settings


class TelegramService:
    async def send_message(self, message: str) -> dict[str, Any]:
        settings = get_settings()
        if not settings.telegram_bot_token or not settings.telegram_chat_id:
            raise RuntimeError("Telegram bot token and chat ID are not configured.")

        url = f"https://api.telegram.org/bot{settings.telegram_bot_token}/sendMessage"
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.post(
                url,
                json={
                    "chat_id": settings.telegram_chat_id,
                    "text": message,
                    "disable_web_page_preview": True,
                },
            )
            response.raise_for_status()
            payload = response.json()
            if not payload.get("ok"):
                raise RuntimeError("Telegram rejected the message.")
            return payload
