from fastapi import APIRouter, Depends, HTTPException

from ..services import InventoryService, get_inventory_service
from ..services.telegram_alert_service import TelegramAlertService

router = APIRouter(prefix="/telegram", tags=["Telegram alerts"])


@router.post("/expiry-check")
async def trigger_expiry_check(
    service: InventoryService = Depends(get_inventory_service),
) -> dict[str, int]:
    try:
        sent = await TelegramAlertService().check_expiring_items(service.list_inventory())
        return {"sent": sent}
    except RuntimeError as error:
        raise HTTPException(status_code=503, detail=str(error)) from error
    except Exception as error:
        raise HTTPException(status_code=502, detail="Telegram alert delivery failed.") from error
