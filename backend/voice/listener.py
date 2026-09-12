import speech_recognition as sr


def listen() -> str:
    """Captures microphone input and converts speech to text."""
    recognizer = sr.Recognizer()

    try:
        with sr.Microphone() as source:
            print("[JARVIS Audio]: Listening for command...")
            recognizer.adjust_for_ambient_noise(source, duration=0.6)
            audio = recognizer.listen(source, timeout=5, phrase_time_limit=8)

        try:
            text = recognizer.recognize_google(audio)
            print(f"[User Voice]: {text}")
            return text
        except sr.UnknownValueError:
            return ""
        except sr.RequestError as e:
            print(f"[STT Service Error]: {e}")
            return ""
    except Exception as e:
        print(f"[Microphone Error]: {e}")
        return ""
