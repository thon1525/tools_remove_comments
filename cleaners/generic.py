from __future__ import annotations


def remove_comments(
    source: str,
    *,
    line_comments: tuple[str, ...] = ("//",),
    block_comments: tuple[tuple[str, str], ...] = (
        ("/*", "*/"),
    ),
    preserve_blank_lines: bool = True,
) -> str:
    """
    Lexically remove comments while preserving quoted strings.

    This intentionally does not parse the complete language grammar.
    It is designed as a safe baseline for C-style languages.
    """

    result: list[str] = []

    i = 0
    length = len(source)

    in_string: str | None = None
    escaped = False
    in_line_comment = False
    in_block_comment = False

    while i < length:
        char = source[i]

        # ----------------------------
        # Inside line comment
        # ----------------------------

        if in_line_comment:
            if char == "\n":
                in_line_comment = False
                result.append("\n")
            elif preserve_blank_lines:
                result.append(" ")

            i += 1
            continue

        # ----------------------------
        # Inside block comment
        # ----------------------------

        if in_block_comment:
            closed = False

            for _, end in block_comments:
                if source.startswith(end, i):
                    in_block_comment = False
                    i += len(end)
                    closed = True
                    break

            if closed:
                continue

            if char == "\n":
                result.append("\n")
            elif preserve_blank_lines:
                result.append(" ")

            i += 1
            continue

        # ----------------------------
        # Inside quoted string
        # ----------------------------

        if in_string is not None:
            result.append(char)

            if escaped:
                escaped = False

            elif char == "\\":
                escaped = True

            elif char == in_string:
                in_string = None

            i += 1
            continue

        # ----------------------------
        # Start quoted string
        # ----------------------------

        if char in ('"', "'"):
            in_string = char
            result.append(char)
            i += 1
            continue

        # ----------------------------
        # Start line comment
        # ----------------------------

        found_line_comment = False

        for marker in line_comments:
            if source.startswith(marker, i):
                in_line_comment = True
                i += len(marker)
                found_line_comment = True
                break

        if found_line_comment:
            continue

        # ----------------------------
        # Start block comment
        # ----------------------------

        found_block_comment = False

        for start, _ in block_comments:
            if source.startswith(start, i):
                in_block_comment = True
                i += len(start)
                found_block_comment = True
                break

        if found_block_comment:
            continue

        result.append(char)
        i += 1

    return "".join(result)