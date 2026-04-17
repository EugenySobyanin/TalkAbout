from typing import Optional


def cut_str(string: Optional[str], max_length: int) -> str:
    """Укорачивает строку и добавляет ... в конце.

    Args:
        string: исходная строка
        max_length: ограничение по длине
    """
    if not string:
        return ''

    if len(string) > max_length:
        return string[:max_length] + '...'

    return string
