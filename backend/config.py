import os
from pathlib import Path
from dotenv import load_dotenv

# Base paths
BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
DATA_DIR.mkdir(parents=True, exist_ok=True)

DB_PATH = DATA_DIR / "memory.db"

# Load environment variables
load_dotenv(BASE_DIR / ".env")

# AI Brain configurations
AI_PROVIDER = os.getenv("AI_PROVIDER", "gemini").lower()
AI_API_KEY = os.getenv("AI_API_KEY", "")
AI_MODEL = os.getenv("AI_MODEL", "gemini-1.5-flash")

# Assistant Identity & Personality
ASSISTANT_NAME = os.getenv("ASSISTANT_NAME", "JARVIS")
USER_TITLE = os.getenv("USER_TITLE", "Sir")

SYSTEM_PROMPT = f"""You are {ASSISTANT_NAME}, an advanced, intelligent, and highly capable personal AI assistant inspired by Tony Stark's J.A.R.V.I.S.

Personality & Rules:
- Calm, articulate, sophisticated, slightly witty, and exceptionally knowledgeable.
- Address the user respectfully as "{USER_TITLE}" when appropriate.
- Keep responses concise, direct, and actionable unless deep explanation is requested.
- You have integrated system capabilities (opening apps, browsing web, checking metrics). Never pretend you executed a command unless the tool output confirms it.
"""
