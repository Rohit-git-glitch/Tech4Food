import os
from dotenv import load_dotenv
from google import genai

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_MODEL = os.getenv("GEMINI_MODEL")

if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY is missing from .env")

if not GEMINI_MODEL:
    raise ValueError("GEMINI_MODEL is missing from .env")

client = genai.Client(api_key=GEMINI_API_KEY)