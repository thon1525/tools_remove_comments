from detectors.csharp import clean_csharp
from detectors.dart import clean_dart
from detectors.java import clean_java
from detectors.javascript import clean_javascript
from detectors.python import clean_python
from detectors.typescript import clean_typescript


CLEANERS = {
    "javascript": clean_javascript,
    "typescript": clean_typescript,
    "python": clean_python,
    "csharp": clean_csharp,
    "java": clean_java,
    "dart": clean_dart,
}


def clean_code(
    source: str,
    language: str,
    *,
    preserve_blank_lines: bool = True,
) -> str:

    language = language.strip().lower()

    cleaner = CLEANERS.get(language)

    if cleaner is None:
        supported = ", ".join(sorted(CLEANERS))

        raise ValueError(
            f"Unsupported language '{language}'. "
            f"Supported languages: {supported}"
        )

    return cleaner(
        source,
        preserve_blank_lines=preserve_blank_lines,
    )