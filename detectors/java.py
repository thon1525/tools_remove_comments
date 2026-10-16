from cleaners.generic import remove_comments


def clean_java(
    source: str,
    *,
    preserve_blank_lines: bool = True,
) -> str:

    return remove_comments(
        source,
        line_comments=("//",),
        block_comments=(("/*", "*/"),),
        preserve_blank_lines=preserve_blank_lines,
    )