from __future__ import annotations

import io
import tokenize


def remove_python_comments(
    source: str,
    *,
    preserve_blank_lines: bool = True,
) -> str:
    """
    Remove Python comments using Python's tokenizer.

    Python strings, including triple quoted strings, are preserved.
    """

    try:
        tokens = tokenize.generate_tokens(
            io.StringIO(source).readline
        )

        output: list[tuple[int, str]] = []

        for token in tokens:
            token_type = token.type
            token_string = token.string

            if token_type == tokenize.COMMENT:
                if preserve_blank_lines:
                    output.append(
                        (token_type, "")
                    )
                continue

            output.append(
                (token_type, token_string)
            )

        return tokenize.untokenize(output)

    except (tokenize.TokenError, IndentationError, SyntaxError):
        # Fall back to a conservative line scanner for incomplete
        # code pasted into the editor.
        return _fallback_python_clean(source)


def _fallback_python_clean(source: str) -> str:
    lines = []

    for line in source.splitlines(keepends=True):
        quote = None
        escaped = False
        output = []
        i = 0

        while i < len(line):
            char = line[i]

            if quote:
                output.append(char)

                if escaped:
                    escaped = False
                elif char == "\\":
                    escaped = True
                elif char == quote:
                    quote = None

                i += 1
                continue

            if char in ("'", '"'):
                quote = char
                output.append(char)
                i += 1
                continue

            if char == "#":
                break

            output.append(char)
            i += 1

        lines.append("".join(output))

    return "".join(lines)