from datetime import datetime, timezone
from typing import Annotated

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from google.genai import types

from ai_agent import understand_command
from config import client, GEMINI_MODEL
from models import FoodCommand


class TranscriptRequest(BaseModel):
    transcript: str


app = FastAPI(title="Tech4Food AI API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["POST", "GET"],
    allow_headers=["*"],
)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/api/v1/ai/voice-parse", response_model=FoodCommand)
def parse_transcript(request: TranscriptRequest) -> FoodCommand:
    try:
        result = understand_command(request.transcript)
        return result
    except Exception as error:
        raise HTTPException(status_code=502, detail="Gemini could not process the command.") from error


@app.post("/api/v1/ai/image-detect", response_model=FoodCommand)
async def detect_food(
    image: Annotated[UploadFile, File(...)],
    transcript: Annotated[str, Form()] = "",
) -> FoodCommand:
    if not image.content_type or not image.content_type.startswith("image/"):
        raise HTTPException(status_code=415, detail="The uploaded file must be an image.")

    image_bytes = await image.read()
    if not image_bytes:
        raise HTTPException(status_code=400, detail="The uploaded image is empty.")

    prompt = f"""
You are the Tech4Food food safety vision agent. Analyze the attached food/package image.
Return JSON matching the requested schema.
- Identify the food name, category, quantity, unit, and likely storage location.
- Read a printed expiry, best-before, use-by, or sell-by date if visible; otherwise use null.
- date_added must be the current UTC timestamp: {datetime.now(timezone.utc).isoformat()}.
- Estimate shelf life in days only when no reliable printed expiry is visible.
- Never invent a printed expiry date. Use ISO date format YYYY-MM-DD when the year is clear.
- If the image is not food or is unreadable, set action to "unknown", food_name to "",
  clarification_needed to true, and explain what is needed.
- The optional user instruction is: {transcript or "none"}.
"""

    try:
        response = client.models.generate_content(
            model=GEMINI_MODEL,
            contents=[
                types.Part.from_bytes(data=image_bytes, mime_type=image.content_type),
                prompt,
            ],
            config={
                "response_mime_type": "application/json",
                "response_schema": FoodCommand,
            },
        )
        if not response.text:
            raise ValueError("Gemini returned an empty response.")
        return FoodCommand.model_validate_json(response.text)
    except Exception as error:
        raise HTTPException(status_code=502, detail="Gemini could not analyze the image.") from error
