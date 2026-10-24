from datetime import datetime, timezone

from google import genai
from google.genai import types

from ..config import get_settings
from ..schemas.ai import FoodCommand, GeminiFoodCommand


def _client() -> tuple[genai.Client, str]:
    settings = get_settings()
    if not settings.gemini_api_key:
        raise RuntimeError("GEMINI_API_KEY is not configured.")
    return (
        genai.Client(
            api_key=settings.gemini_api_key,
            http_options=types.HttpOptions(
                timeout=45_000,
                retry_options=types.HttpRetryOptions(attempts=1),
            ),
        ),
        settings.gemini_model,
    )


def parse_transcript(text: str) -> FoodCommand:
    client, model = _client()
    prompt = f"""
You are the Tech4Food smart-fridge command interpretation agent.
Return JSON matching the requested schema.
- Identify add, remove, move, or unknown.
- Extract food name, quantity, unit, and storage location.
- Never invent quantity or location.
- Return category, confidence, and a shelf-life recommendation when identifiable.
- Set date_added to this current UTC timestamp: {datetime.now(timezone.utc).isoformat()}.
- Do not claim an inventory operation was completed.

User command: {text}
"""
    response = client.models.generate_content(
        model=model,
        contents=prompt,
        config={
            "response_mime_type": "application/json",
            "response_schema": GeminiFoodCommand,
        },
    )
    return _validate_response(response.text)


def detect_image(image_bytes: bytes, mime_type: str, transcript: str = "") -> FoodCommand:
    client, model = _client()
    prompt = f"""
You are the Tech4Food food safety vision agent. Analyze the attached food/package image.
Return JSON matching the requested schema.
- Identify food name, category, quantity, unit, and likely storage location.
- Read a printed expiry, best-before, use-by, or sell-by date if visible; otherwise null.
- Set date_added to this current UTC timestamp: {datetime.now(timezone.utc).isoformat()}.
- Estimate shelf life only when no reliable printed expiry is visible.
- Never invent a printed expiry date. Use YYYY-MM-DD when the year is clear.
- If the image is not food or unreadable, set action to unknown and request clarification.
- Optional user instruction: {transcript or "none"}
"""
    response = client.models.generate_content(
        model=model,
        contents=[types.Part.from_bytes(data=image_bytes, mime_type=mime_type), prompt],
        config={
            "response_mime_type": "application/json",
            "response_schema": GeminiFoodCommand,
        },
    )
    return _validate_response(response.text)


def _validate_response(response_text: str | None) -> FoodCommand:
    if not response_text:
        raise ValueError("Gemini returned an empty response.")
    result = FoodCommand.model_validate_json(response_text)
    if result.action == "unknown" or not result.food_name.strip():
        result.clarification_needed = True
        if not result.clarification_question:
            result.clarification_question = "Which food item and action do you mean?"
    return result
