import os
import asyncio
from pathlib import Path

# Try edge-tts for studio-grade natural human voices
try:
    import edge_tts
    HAS_EDGE_TTS = True
except ImportError:
    HAS_EDGE_TTS = False

try:
    import pyttsx3
    HAS_PYTTSX3 = True
except ImportError:
    HAS_PYTTSX3 = False

# Dedicated Jenny Neural Studio Voice
DEDICATED_VOICE = "en-US-JennyNeural"
DEFAULT_NEURAL_VOICE = DEDICATED_VOICE



async def synthesize_neural_audio_bytes(text: str, voice: str = None) -> bytes:
    """
    Generates high-fidelity MP3 audio bytes using Microsoft Edge Neural TTS.
    Produces studio broadcast quality female human voice without API keys.
    """
    target_voice = voice if voice and "Neural" in voice else DEFAULT_NEURAL_VOICE
    communicate = edge_tts.Communicate(text, target_voice)
    audio_chunks = []
    async for chunk in communicate.stream():
        if chunk["type"] == "audio":
            audio_chunks.append(chunk["data"])
    return b"".join(audio_chunks)


def get_tts_engine():
    if not HAS_PYTTSX3:
        return None
    try:
        engine = pyttsx3.init()
        engine.setProperty("rate", 175)
        engine.setProperty("volume", 0.95)

        voices = engine.getProperty("voices")
        if voices:
            female_voice = None
            for v in voices:
                v_name = v.name.lower()
                v_id = v.id.lower()
                if any(k in v_name or k in v_id for k in ["zira", "female", "hazel", "eva", "susan", "catherine", "helen", "samantha"]):
                    female_voice = v
                    break
            
            if female_voice:
                engine.setProperty("voice", female_voice.id)
            elif len(voices) > 1:
                engine.setProperty("voice", voices[1].id)
            else:
                engine.setProperty("voice", voices[0].id)
        return engine
    except Exception as e:
        print(f"[TTS Initialization Error]: {e}")
        return None


def speak(text: str):
    """Speaks text using local synthesis."""
    print(f"[JARVIS Speech]: {text}")
    try:
        engine = get_tts_engine()
        if engine:
            engine.say(text)
            engine.runAndWait()
    except Exception as e:
        print(f"[TTS Error]: {e}")
