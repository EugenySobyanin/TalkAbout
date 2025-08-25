from django.core.exceptions import ValidationError
from django.utils import timezone

from backend.gallery.constants import MAX_FUTURE_PERIOD_RELEASE


class MaxYearValidator:
    """Фильм слишком в будущем.

    Валидатор носит исключительн формальный характер.
    Якобы нельзя добавить фильмы, релиз которых
    запланирован в далеком будущем.
    """
    def __call__(self, value):
        if value is None:
            return
        max_year = timezone.now().year + MAX_FUTURE_PERIOD_RELEASE
        if value > max_year:
            raise ValidationError(f"Слишком будущий год. Максимум: {max_year}")
