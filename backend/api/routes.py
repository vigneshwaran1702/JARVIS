from fastapi import APIRouter, Response
from pydantic import BaseModel
from typing import Optional

from core.brain import JarvisBrain
from core.memory import (
    init_memory,
    save_message,
    get_recent_messages,
    clear_memory,
)
from core.router import execute_command
from tools.system import get_system_stats
from voice.speaker import speak, synthesize_neural_audio_bytes, DEFAULT_NEURAL_VOICE, DEDICATED_VOICE

router = APIRouter()
brain = JarvisBrain()

# Initialize DB table on load
init_memory()


class CommandRequest(BaseModel):
    message: str
    voice_feedback: Optional[bool] = False


class SpeakRequest(BaseModel):
    text: str


class SynthesizeRequest(BaseModel):
    text: str
    voice: Optional[str] = DEDICATED_VOICE


@router.get("/status")
def status():
    return {
        "assistant": "JARVIS",
        "status": "online",
        "version": "1.0.0",
        "mode": "autonomous",
        "voice_engine": "jenny-studio-neural-voice",
    }


@router.get("/voices")
def get_voices():
    """Returns Jenny as the dedicated neural voice."""
    return {
        "voices": [
            {"id": "en-US-JennyNeural", "name": "Jenny (Studio Natural Female)", "desc": "Warm, articulate, and crystal-clear"}
        ],
        "default": DEDICATED_VOICE,
    }


@router.post("/synthesize-speech")
async def synthesize_speech(data: SynthesizeRequest):
    """
    Generates high-definition, crystal-clear studio neural audio MP3 with Jenny's voice.
    """
    clean_text = data.text.strip()
    if not clean_text:
        return Response(status_code=400, content="Text cannot be empty.")

    try:
        audio_bytes = await synthesize_neural_audio_bytes(clean_text, voice=DEDICATED_VOICE)
        return Response(content=audio_bytes, media_type="audio/mpeg")
    except Exception as e:
        print(f"[Neural Synthesis Error]: {e}")
        return Response(status_code=500, content=str(e))



@router.get("/system-stats")
def system_stats():
    return get_system_stats()


@router.post("/command")
def process_command(data: CommandRequest):
    user_message = data.message.strip()
    if not user_message:
        return {"assistant": "JARVIS", "response": "I did not detect any input, sir."}

    # Save user message to memory
    save_message("user", user_message)

    # 1. Attempt deterministic tool execution
    tool_output = execute_command(user_message)
    tool_used = None

    if tool_output:
        if isinstance(tool_output, dict):
            response_text = tool_output.get("response", "")
            tool_used = tool_output.get("tool")
        else:
            response_text = str(tool_output)
    else:
        # 2. Query the LLM Brain
        response_text = brain.think(user_message)

    # Save assistant response to memory
    save_message("jarvis", response_text, tool_used=tool_used)

    # Optional server-side speech synthesis
    if data.voice_feedback:
        try:
            speak(response_text)
        except Exception:
            pass

    return {
        "assistant": "JARVIS",
        "response": response_text,
        "tool_used": tool_used,
        "success": True,
    }


@router.get("/memory")
def fetch_memory(limit: int = 20):
    return {
        "messages": get_recent_messages(limit=limit)
    }


@router.delete("/memory")
def purge_memory():
    msg = clear_memory()
    return {"message": msg}


@router.post("/speak")
def speak_endpoint(data: SpeakRequest):
    speak(data.text)
    return {"status": "spoken"}
