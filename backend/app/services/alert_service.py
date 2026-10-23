
from datetime import datetime, timezone


def get_expiry_alert(item):
    try:
        expiry = datetime.fromisoformat(
            item.estimated_expiry_date.replace("Z", "+00:00")
        )

        if expiry.tzinfo is None:
            expiry = expiry.replace(tzinfo=timezone.utc)

        remaining = (
            expiry - datetime.now(timezone.utc)
        ).total_seconds()

        # Expired items are handled separately.
        if 0 < remaining <= 24 * 60 * 60:
            return (
                f"⚠️ Expiry reminder: {item.name}\n"
                "Estimated shelf life remaining: 1 day or less.\n"
                f"Location: {item.location}"
            )

        if remaining <= 0:
            return (
                f"⏰ Expiry alert: {item.name}\n"
                "This item has passed its estimated expiry date. "
                "Please check its condition."
            )

    except (ValueError, AttributeError):
        pass

    return None
