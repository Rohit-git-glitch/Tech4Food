from datetime import datetime, timedelta, timezone

from app.schemas.inventory import FoodItemResponse
from app.services.telegram_alert_service import get_expiry_alert


def make_item(expiry: datetime) -> FoodItemResponse:
    return FoodItemResponse(
        id="food-test",
        name="Test Milk",
        category="Dairy & Eggs",
        quantity=1,
        unit="L",
        location="Refrigerator",
        date_added=datetime.now(timezone.utc).isoformat(),
        estimated_shelf_life_days=7,
        estimated_expiry_date=expiry.isoformat(),
        storage_guidance="Keep refrigerated.",
        status="Approaching Expiry",
    )


def test_expiry_alert_for_item_within_24_hours():
    result = get_expiry_alert(make_item(datetime.now(timezone.utc) + timedelta(hours=12)))

    assert result is not None
    assert result[0] == "within-24-hours:food-test"
    assert "Test Milk" in result[1]


def test_expiry_alert_for_expired_item():
    result = get_expiry_alert(make_item(datetime.now(timezone.utc) - timedelta(minutes=1)))

    assert result is not None
    assert result[0] == "expired:food-test"


def test_no_expiry_alert_for_item_beyond_24_hours():
    result = get_expiry_alert(make_item(datetime.now(timezone.utc) + timedelta(days=2)))

    assert result is None
