from typing import Annotated

import httpx
from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from google.genai.errors import APIError

from ..schemas.ai import FoodCommand, TranscriptRequest
from ..services.gemini_service import detect_image, parse_transcript

router = APIRouter(prefix="/ai", tags=["AI"])


@router.post("/voice-parse", response_model=FoodCommand)
def voice_parse(request: TranscriptRequest) -> FoodCommand:
    transcript = request.transcript.strip()
    try:
        return parse_transcript(transcript)
    except (httpx.ReadTimeout, httpx.RemoteProtocolError) as error:
        raise HTTPException(
            status_code=504 if isinstance(error, httpx.ReadTimeout) else 502,
            detail=(
                "Gemini did not respond before the 45-second timeout. Please try again."
                if isinstance(error, httpx.ReadTimeout)
                else "Gemini closed the upstream connection before returning a response. Please try again."
            ),
        ) from error
    except (RuntimeError, ValueError, APIError) as error:
        raise HTTPException(status_code=502, detail=str(error)) from error


@router.post("/image-detect", response_model=FoodCommand)
async def image_detect(
    image: Annotated[UploadFile, File(...)],
    transcript: Annotated[str, Form()] = "",
) -> FoodCommand:
    if not image.content_type or not image.content_type.startswith("image/"):
        raise HTTPException(status_code=415, detail="The uploaded file must be an image.")
    image_bytes = await image.read()
    if not image_bytes:
        raise HTTPException(status_code=400, detail="The uploaded image is empty.")
    try:
        return detect_image(image_bytes, image.content_type, transcript)
    except (httpx.ReadTimeout, httpx.RemoteProtocolError) as error:
        raise HTTPException(
            status_code=504 if isinstance(error, httpx.ReadTimeout) else 502,
            detail=(
                "Gemini did not respond before the 45-second timeout. Please try again."
                if isinstance(error, httpx.ReadTimeout)
                else "Gemini closed the upstream connection before returning a response. Please try again."
            ),
        ) from error
    except (RuntimeError, ValueError, APIError) as error:
        raise HTTPException(status_code=502, detail=str(error)) from error
