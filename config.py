import os


class Config:
    APP_NAME = "Code Cleaner"
    API_PREFIX = "/api/v1"

    MAX_CONTENT_LENGTH = int(
        os.getenv(
            "MAX_CONTENT_LENGTH",
            str(5 * 1024 * 1024),
        )
    )

    MAX_FILE_SIZE = int(
        os.getenv(
            "MAX_FILE_SIZE",
            str(5 * 1024 * 1024),
        )
    )

    DEBUG = os.getenv("FLASK_DEBUG", "false").lower() == "true"

    CORS_ORIGINS = [
        origin.strip()
        for origin in os.getenv("CORS_ORIGINS", "").split(",")
        if origin.strip()
    ]

    SUPPORTED_EXTENSIONS = {
        ".js": "javascript",
        ".jsx": "javascript",
        ".mjs": "javascript",
        ".cjs": "javascript",

        ".ts": "typescript",
        ".tsx": "typescript",

        ".py": "python",

        ".cs": "csharp",

        ".java": "java",

        ".dart": "dart",
    }