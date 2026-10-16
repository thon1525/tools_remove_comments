import re


SAFE_FILENAME = re.compile(
    r"^[a-zA-Z0-9._()\- ]+$"
)


def is_safe_filename(filename: str) -> bool:
    if not filename:
        return False

    if len(filename) > 255:
        return False

    if "/" in filename or "\\" in filename:
        return False

    return bool(SAFE_FILENAME.match(filename))