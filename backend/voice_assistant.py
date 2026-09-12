import sys
from pathlib import Path

# Ensure backend root is in sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent))

from voice.listener import listen
from voice.speaker import speak
from core.router import execute_command
from core.brain import JarvisBrain
from core.memory import init_memory, save_message
from config import ASSISTANT_NAME, USER_TITLE

brain = JarvisBrain()


def start_jarvis():
    init_memory()
    speak(f"Good day, {USER_TITLE}. {ASSISTANT_NAME} is online and listening.")

    while True:
        try:
            command = listen()
            if not command:
                continue

            clean_cmd = command.lower().strip()
            print(f"[Captured Voice]: {command}")

            # Shutdown checks
            if any(term in clean_cmd for term in ["shutdown jarvis", "exit jarvis", "stop jarvis", "goodbye jarvis", "power down"]):
                speak(f"Deactivating systems. Until next time, {USER_TITLE}.")
                break

            # Save user speech to memory
            save_message("user", command)

            # Check router for tool execution
            result = execute_command(command)
            tool_used = None

            if result:
                if isinstance(result, dict):
                    response = result.get("response", "")
                    tool_used = result.get("tool")
                else:
                    response = str(result)
            else:
                response = brain.think(command)

            save_message("jarvis", response, tool_used=tool_used)
            speak(response)

        except KeyboardInterrupt:
            speak(f"System interrupted. Shutting down, {USER_TITLE}.")
            break
        except Exception as e:
            print(f"[Error in Voice Loop]: {e}")


if __name__ == "__main__":
    start_jarvis()
