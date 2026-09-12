import os
from pathlib import Path


def list_directory(folder_path: str = None) -> dict:
    """Lists files and folders safely in the workspace or home directory."""
    try:
        target = Path(folder_path).resolve() if folder_path else Path.cwd()
        if not target.exists():
            return {
                "success": False,
                "response": f"Directory '{target}' does not exist, sir.",
                "tool": "files.list_directory",
            }

        items = os.listdir(target)[:15]  # Limit to 15 entries for readability
        item_list = ", ".join(items) if items else "Empty directory"
        return {
            "success": True,
            "response": f"Contents of {target.name or target}: {item_list}",
            "tool": "files.list_directory",
            "count": len(items),
        }
    except Exception as e:
        return {
            "success": False,
            "response": f"File system inspection failed: {str(e)}",
            "tool": "files.list_directory",
        }
