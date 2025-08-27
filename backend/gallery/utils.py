def cut_str(string: str, max_length: int) -> str:
    """Укорачивает строку и добавляет ... в конце.

    Args:
        string - исходная строка (название фильма и тд.)
        max_length - ограничение по длине
    """
    if len(string) > max_length:
        return string[:max_length] + '...'
    return string
