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
    Remove comments without leaving comment-created blank lines.

    Example:

        const a = 1;

        /*
         * comment
         */

        const b = 2;

    becomes:

        const a = 1;
        const b = 2;

    while normal blank lines remain.
    """

    result: list[str] = []

    i = 0
    length = len(source)

    in_string: str | None = None
    escaped = False

    in_line_comment = False
    in_block_comment = False

    # True when a comment was removed from the current line.
    removed_comment_on_line = False

    # True when a block comment occupies a complete line.
    comment_only_line = False

    while i < length:

        char = source[i]

        # ==================================================
        # LINE COMMENT
        # ==================================================

        if in_line_comment:

            if char == "\n":
                in_line_comment = False

                # Remove trailing whitespace before comment.
                while result and result[-1] in (" ", "\t"):
                    result.pop()

                # Keep newline only if the line contained
                # actual source code.
                if not comment_only_line:
                    result.append("\n")

                removed_comment_on_line = False
                comment_only_line = False

            i += 1
            continue

        # ==================================================
        # BLOCK COMMENT
        # ==================================================

        if in_block_comment:

            # Find block comment end.
            closed = False

            for _, end in block_comments:

                if source.startswith(end, i):

                    in_block_comment = False

                    i += len(end)

                    closed = True

                    break

            if closed:
                continue

            # Do NOT copy comment newlines.
            #
            # This is important because:
            #
            # /*
            #  * comment
            #  */
            #
            # should not create empty lines.
            i += 1
            continue

        # ==================================================
        # STRING
        # ==================================================

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

        # ==================================================
        # STRING START
        # ==================================================

        if char in ("'", '"'):

            in_string = char

            result.append(char)

            i += 1
            continue

        # ==================================================
        # LINE COMMENT START
        # ==================================================

        found_line_comment = False

        for marker in line_comments:

            if source.startswith(marker, i):

                in_line_comment = True

                removed_comment_on_line = True

                # Check whether there is actual code before
                # the comment on this line.
                current_line = "".join(result).split("\n")[-1]

                comment_only_line = not current_line.strip()

                i += len(marker)

                found_line_comment = True

                break

        if found_line_comment:
            continue

        # ==================================================
        # BLOCK COMMENT START
        # ==================================================

        found_block_comment = False

        for start, _ in block_comments:

            if source.startswith(start, i):

                in_block_comment = True

                removed_comment_on_line = True

                # Check whether comment starts on an empty line.
                current_line = "".join(result).split("\n")[-1]

                comment_only_line = not current_line.strip()

                i += len(start)

                found_block_comment = True

                break

        if found_block_comment:
            continue

        # ==================================================
        # NEWLINE
        # ==================================================

        if char == "\n":

            current_line = "".join(result).split("\n")[-1]

            # If this line had a comment but no code,
            # don't keep the newline.
            if removed_comment_on_line and not current_line.strip():
                pass

            else:
                result.append("\n")

            removed_comment_on_line = False
            comment_only_line = False

            i += 1
            continue

        # ==================================================
        # NORMAL CHARACTER
        # ==================================================

        result.append(char)

        i += 1

    cleaned = "".join(result)

    return _final_cleanup(cleaned)


def _final_cleanup(source: str) -> str:
    """
    Final whitespace cleanup.

    - Removes trailing spaces.
    - Removes excessive blank lines.
    - Preserves indentation.
    - Preserves normal formatting.
    """

    lines = source.splitlines()

    output: list[str] = []

    previous_blank = False

    for line in lines:

        # Only remove trailing spaces.
        line = line.rstrip(" \t")

        if not line.strip():

            # Avoid multiple empty lines.
            if previous_blank:
                continue

            output.append("")

            previous_blank = True

            continue

        output.append(line)

        previous_blank = False

    # Remove blank lines at beginning.
    while output and not output[0].strip():
        output.pop(0)

    # Remove blank lines at end.
    while output and not output[-1].strip():
        output.pop()

    if not output:
        return ""

    return "\n".join(output) + "\n"