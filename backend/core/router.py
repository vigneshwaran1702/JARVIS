from tools.system import open_application, get_system_stats, get_current_time_date
from tools.browser import open_website, search_google
from tools.files import list_directory
from tools.github import open_github_repo
from core.memory import clear_memory


def execute_command(command: str):
    """
    Evaluates commands deterministically first.
    If matching a known action/tool pattern, executes it.
    Otherwise returns None to let the LLM brain reason over it.
    """
    import re
    # Clean text: remove punctuation except math symbols and periods in urls
    raw_text = command.lower().strip()
    clean_text = re.sub(r"[?!,;'\"]", "", raw_text).strip()

    # Time / Date queries (e.g. "what's the time", "time", "what time is it", "current date", "today's date")
    time_keywords = ["time", "clock", "date", "today", "current time", "what time", "whats the time"]
    if any(k in clean_text.split() for k in ["time", "clock", "date", "today"]) or any(phrase in clean_text for phrase in ["whats the time", "what is the time", "what time is it", "tell me the time", "current time", "what date", "whats the date", "what is the date", "todays date"]):
        return get_current_time_date()

    # Hardware stats queries
    if any(phrase in clean_text for phrase in ["system status", "system stats", "cpu usage", "battery", "hardware status", "telemetry", "system load", "diagnostics", "status"]):
        stats = get_system_stats()
        summary = (
            f"Diagnostics nominal, sir. CPU load is at {stats['cpu_percent']}%, "
            f"RAM is at {stats['ram_percent']}% ({stats['ram_used_gb']} GB used), "
            f"and power cell is at {stats['battery_percent']}%{' (plugged in)' if stats['is_charging'] else ''}."
        )
        return {
            "success": True,
            "response": summary,
            "tool": "system.stats",
            "stats": stats,
        }

    # Clear memory command
    if any(phrase in clean_text for phrase in ["clear memory", "wipe memory", "reset memory", "purge memory", "delete memory"]):
        msg = clear_memory()
        return {
            "success": True,
            "response": msg,
            "tool": "memory.clear",
        }

    # Weather queries (e.g. "what's the weather", "weather in London")
    if "weather" in clean_text:
        return search_google(raw_text)

    # Basic Math calculation (e.g. "calculate 25 * 4", "what is 50 + 20")
    math_match = re.search(r"(?:calculate|what is|compute)\s+([0-9\.\s\+\-\*\/\(\)]+)", clean_text)
    if math_match:
        expr = math_match.group(1).strip()
        try:
            # Safe eval of numbers and operators only
            if re.match(r"^[\d\.\s\+\-\*\/\(\)]+$", expr):
                result = eval(expr, {"__builtins__": None}, {})
                return {
                    "success": True,
                    "response": f"The calculated result of {expr} is {result}, sir.",
                    "tool": "system.calculator",
                }
        except Exception:
            pass

    # Search queries
    if clean_text.startswith("search ") or clean_text.startswith("google ") or clean_text.startswith("find "):
        query = re.sub(r"^(search for|search|google|find)\s+", "", raw_text, flags=re.IGNORECASE).strip()
        return search_google(query)

    # Open / Launch commands
    if clean_text.startswith("open ") or clean_text.startswith("launch ") or clean_text.startswith("start "):
        target = re.sub(r"^(open|launch|start)\s+", "", raw_text, flags=re.IGNORECASE).strip()

        # Check for GitHub targets
        if target.lower().startswith("github "):
            sub = target[7:].strip()
            return open_github_repo(sub)

        # Check if known website or URL
        if "." in target or target.lower() in ["google", "youtube", "github", "reddit", "chatgpt", "netflix", "gmail", "claude", "gemini", "twitter", "x"]:
            return open_website(target)

        # Try application launcher
        app_res = open_application(target)
        if app_res.get("success"):
            return app_res

        # Fallback to web search if application not recognized
        return open_website(target)

    # Directory inspection
    if "list files" in clean_text or "show files" in clean_text or "list directory" in clean_text:
        return list_directory()

    return None

