from cleaners.python_cleaner import remove_python_comments


def clean_python(
    source: str,
    *,
    preserve_blank_lines: bool = True,
) -> str:

    return remove_python_comments(
        source,
        preserve_blank_lines=preserve_blank_lines,
    )