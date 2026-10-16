from pathlib import Path

from config import Config


def detect_language(filename: str) -> str | None:
    extension = Path(filename).suffix.lower()

    return Config.SUPPORTED_EXTENSIONS.get(extension)


def supported_languages() -> list[str]:
    return [
        "javascript",
        "typescript",
        "python",
        "csharp",
        "java",
        "dart",
    ]