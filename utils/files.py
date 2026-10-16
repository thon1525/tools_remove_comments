from __future__ import annotations

from io import BytesIO


def read_uploaded_file(
    uploaded_file,
    *,
    max_bytes: int,
) -> str:

    stream = uploaded_file.stream

    data = stream.read(max_bytes + 1)

    if len(data) > max_bytes:
        raise ValueError(
            "Uploaded file exceeds the maximum allowed size."
        )

    try:
        return data.decode("utf-8-sig")

    except UnicodeDecodeError as exc:
        raise ValueError(
            "File must be UTF-8 encoded text."
        ) from exc