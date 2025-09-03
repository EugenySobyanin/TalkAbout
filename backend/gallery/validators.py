from django.core.exceptions import ValidationError
from django.utils import timezone

from gallery.constants import MAX_FUTURE_PERIOD_RELEASE


def validate_max_future_year(value):
    """Валидатор для проверки года выпуска фильма."""
    if value is None:
        return
    max_year = timezone.now().year + MAX_FUTURE_PERIOD_RELEASE
    if value > max_year:
        raise ValidationError(f"Слишком будущий год. Максимум: {max_year}")
