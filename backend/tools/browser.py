import webbrowser
import urllib.parse

ALLOWED_SITES = {
    "google": "https://www.google.com",
    "github": "https://github.com",
    "youtube": "https://www.youtube.com",
    "chatgpt": "https://chat.openai.com",
    "claude": "https://claude.ai",
    "gemini": "https://gemini.google.com",
    "stackoverflow": "https://stackoverflow.com",
    "reddit": "https://www.reddit.com",
    "twitter": "https://twitter.com",
    "x": "https://x.com",
    "netflix": "https://www.netflix.com",
    "gmail": "https://mail.google.com",
}


def open_website(target: str) -> dict:
    """Opens a known website or arbitrary valid URL."""
    clean_target = target.lower().strip()
    url = ALLOWED_SITES.get(clean_target)

    if not url:
        if clean_target.startswith("http://") or clean_target.startswith("https://"):
            url = clean_target
        elif "." in clean_target and " " not in clean_target:
            url = f"https://{clean_target}"
        else:
            return search_google(target)

    try:
        webbrowser.open(url)
        return {
            "success": True,
            "response": f"Opening {target} in your default browser, sir.",
            "tool": "browser.open_website",
            "url": url,
        }
    except Exception as e:
        return {
            "success": False,
            "response": f"Unable to open {target}: {str(e)}",
            "tool": "browser.open_website",
        }


def search_google(query: str) -> dict:
    """Performs a Google web search."""
    clean_query = query.strip()
    encoded_query = urllib.parse.quote_plus(clean_query)
    url = f"https://www.google.com/search?q={encoded_query}"

    try:
        webbrowser.open(url)
        return {
            "success": True,
            "response": f"Searching Google for '{clean_query}', sir.",
            "tool": "browser.search_google",
            "url": url,
        }
    except Exception as e:
        return {
            "success": False,
            "response": f"Search failed: {str(e)}",
            "tool": "browser.search_google",
        }
