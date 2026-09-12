import sqlite3
import datetime
from pathlib import Path
from config import DB_PATH


def get_db_connection():
    connection = sqlite3.connect(str(DB_PATH))
    connection.row_factory = sqlite3.Row
    return connection


def init_memory():
    """Initializes the SQLite database with conversations table."""
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS conversations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            role TEXT NOT NULL,
            message TEXT NOT NULL,
            tool_used TEXT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    """)

    conn.commit()
    conn.close()


def save_message(role: str, message: str, tool_used: str = None):
    """Saves a conversation message with timestamp and optional tool metadata."""
    conn = get_db_connection()
    cursor = conn.cursor()

    now = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    cursor.execute(
        """
        INSERT INTO conversations (role, message, tool_used, timestamp)
        VALUES (?, ?, ?, ?)
        """,
        (role, message, tool_used, now),
    )

    conn.commit()
    conn.close()


def get_recent_messages(limit: int = 15):
    """Returns the most recent messages formatted as list of dicts."""
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute(
        """
        SELECT id, role, message, tool_used, timestamp
        FROM conversations
        ORDER BY id DESC
        LIMIT ?
        """,
        (limit,),
    )

    rows = cursor.fetchall()
    conn.close()

    # Return in chronological order
    formatted = [
        {
            "id": row["id"],
            "role": row["role"],
            "message": row["message"],
            "tool_used": row["tool_used"],
            "timestamp": row["timestamp"],
        }
        for row in reversed(rows)
    ]
    return formatted


def clear_memory():
    """Wipes all conversation history."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM conversations")
    conn.commit()
    conn.close()
    return "Memory banks purged, sir."
