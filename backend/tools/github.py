import os
import requests
import webbrowser


def open_github_repo(repo_name: str) -> dict:
    """Opens a GitHub profile or repository."""
    clean = repo_name.strip()
    if "/" in clean:
        url = f"https://github.com/{clean}"
    else:
        url = f"https://github.com/{clean}"

    webbrowser.open(url)
    return {
        "success": True,
        "response": f"Opening GitHub destination '{url}', sir.",
        "tool": "github.open",
        "url": url,
    }


def get_user_status(username: str) -> dict:
    """Fetches public GitHub profile info."""
    try:
        res = requests.get(f"https://api.github.com/users/{username}", timeout=5)
        if res.status_code == 200:
            data = res.json()
            return {
                "success": True,
                "response": f"GitHub user {username} has {data.get('public_repos', 0)} public repos and {data.get('followers', 0)} followers.",
                "tool": "github.user_status",
            }
        else:
            return {
                "success": False,
                "response": f"Could not retrieve GitHub info for user {username}.",
                "tool": "github.user_status",
            }
    except Exception as e:
        return {
            "success": False,
            "response": f"GitHub connection error: {str(e)}",
            "tool": "github.user_status",
        }
