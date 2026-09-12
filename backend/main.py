from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import os
import sys
from pathlib import Path

# Ensure backend root is in sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent))

from api.routes import router
from config import ASSISTANT_NAME

app = FastAPI(
    title=f"{ASSISTANT_NAME} AI Core",
    description="Autonomous Assistant Backend with Memory, Tool Router, and Hardware Telemetry",
    version="1.0.0",
)

# CORS configuration for React frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows localhost:5173, 127.0.0.1, etc.
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)


@app.get("/")
def home():
    return {
        "status": "online",
        "assistant": ASSISTANT_NAME,
        "endpoints": {
            "status": "/status",
            "system_stats": "/system-stats",
            "command": "POST /command",
            "memory": "GET /memory",
        },
    }


if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
