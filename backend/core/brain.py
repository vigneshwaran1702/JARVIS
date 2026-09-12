import os
import json
import requests
from config import AI_API_KEY, AI_MODEL, AI_PROVIDER, SYSTEM_PROMPT, ASSISTANT_NAME, USER_TITLE
from core.memory import get_recent_messages


class JarvisBrain:
    def __init__(self):
        self.provider = AI_PROVIDER
        self.model = AI_MODEL
        self.api_key = AI_API_KEY

    def _get_active_api_key(self) -> str:
        """Retrieves and checks if a valid (non-placeholder) API key is available."""
        # Re-read from environment or .env if updated
        from dotenv import dotenv_values
        from config import BASE_DIR
        env_vals = dotenv_values(BASE_DIR / ".env")
        key = env_vals.get("AI_API_KEY", os.getenv("AI_API_KEY", "")).strip()

        invalid_placeholders = ["", "your_api_key_here", "ai_api_key", "none", "null", "undefined"]
        if key.lower() in invalid_placeholders:
            return ""
        return key

    def think(self, user_message: str) -> str:
        """
        Processes user messages using LLM API if configured,
        or delivers sophisticated offline heuristics in character.
        """
        api_key = self._get_active_api_key()

        # If valid API key is provided, attempt LLM call
        if api_key:
            self.api_key = api_key
            try:
                if self.provider == "gemini":
                    return self._call_gemini(user_message)
                elif self.provider == "openai":
                    return self._call_openai(user_message)
            except Exception as e:
                print(f"[Brain Error]: {e}")
                # Fall back to offline intelligence on API failure

        return self._offline_jarvis_response(user_message)

    def _format_conversation_history(self, limit: int = 6) -> list:
        recent = get_recent_messages(limit=limit)
        formatted = []
        for msg in recent:
            role = "user" if msg["role"] == "user" else "model"
            formatted.append({"role": role, "parts": [{"text": msg["message"]}]})
        return formatted

    def _call_gemini(self, user_message: str) -> str:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{self.model}:generateContent?key={self.api_key}"
        
        # Build contents with context
        history = self._format_conversation_history(limit=6)
        history.append({"role": "user", "parts": [{"text": user_message}]})

        payload = {
            "contents": history,
            "systemInstruction": {
                "parts": [{"text": SYSTEM_PROMPT}]
            },
            "generationConfig": {
                "temperature": 0.7,
                "maxOutputTokens": 300,
            }
        }

        response = requests.post(url, json=payload, timeout=12)
        if response.status_code == 200:
            data = response.json()
            candidates = data.get("candidates", [])
            if candidates:
                parts = candidates[0].get("content", {}).get("parts", [])
                if parts:
                    return parts[0].get("text", "").strip()
        
        raise RuntimeError(f"Gemini API returned status {response.status_code}: {response.text}")

    def _call_openai(self, user_message: str) -> str:
        url = "https://api.openai.com/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }
        
        recent = get_recent_messages(limit=6)
        messages = [{"role": "system", "content": SYSTEM_PROMPT}]
        for msg in recent:
            messages.append({"role": "user" if msg["role"] == "user" else "assistant", "content": msg["message"]})
        messages.append({"role": "user", "content": user_message})

        payload = {
            "model": self.model if "gpt" in self.model else "gpt-3.5-turbo",
            "messages": messages,
            "max_tokens": 300,
        }

        response = requests.post(url, headers=headers, json=payload, timeout=12)
        if response.status_code == 200:
            data = response.json()
            return data["choices"][0]["message"]["content"].strip()
        
        raise RuntimeError(f"OpenAI API returned status {response.status_code}: {response.text}")

    def _offline_jarvis_response(self, user_message: str) -> str:
        """
        Sophisticated offline heuristic fallback when no external LLM key is configured.
        """
        import datetime
        text = user_message.lower().strip()

        # Time & Date check in offline brain
        if "time" in text or "clock" in text or "date" in text or "today" in text:
            now = datetime.datetime.now()
            return f"The current time is {now.strftime('%I:%M %p')} on {now.strftime('%A, %B %d, %Y')}, {USER_TITLE}."

        if any(w in text for w in ["hello", "hi", "hey", "greetings"]):
            return f"Good day, {USER_TITLE}. All systems are fully operational. How may I be of assistance?"

        if any(w in text for w in ["who are you", "what are you", "your name"]):
            return f"I am {ASSISTANT_NAME}, your personal automated assistant and digital companion. Standing by for your instructions."

        if "how are you" in text or "status" in text:
            return f"Operating at peak efficiency, {USER_TITLE}. Neural cores and diagnostic matrices are all nominal."

        if "joke" in text or "make me laugh" in text:
            jokes = [
                "Why do programmers prefer dark mode? Because light attracts bugs, sir.",
                "There are 10 types of people in the world: those who understand binary, and those who don't.",
                "I asked the compiler if I had any issues. It took 45 minutes to finish laughing.",
            ]
            import random
            return random.choice(jokes)

        if "thank you" in text or "thanks" in text:
            return f"Always at your service, {USER_TITLE}."

        if "what can you do" in text or "help" in text or "features" in text:
            return (
                f"I can control desktop applications (Notepad, Calculator, VS Code), perform Google searches, "
                f"monitor hardware telemetry, navigate web destinations, execute calculations, and converse through our neural interface."
            )

        return (
            f"Understood, {USER_TITLE}. Command '{user_message}' has been registered in the system log. "
            f"To enable open-ended generative conversation, provide your Gemini/OpenAI API key in the .env file."
        )

