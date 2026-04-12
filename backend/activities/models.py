from django.contrib.auth import get_user_model
from django.core.validators import (MinValueValidator,
                                    MaxValueValidator,)
from django.db import models
from django.utils import timezone

from gallery.models import Film


User = get_user_model()


class BaseCreatedUpdated(models.Model):
    created_at = models.DateTimeField(
        auto_now_add=True
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        db_index=True
    )

    class Meta:
        abstract = True


class UserFilmActivity(BaseCreatedUpdated):
    """
    Пользовательские активности.

    Основная модель для связи Пользователь - Фильм.
    """
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        verbose_name='Пользователь',
        related_name='activities',
    )
    film = models.ForeignKey(
        Film,
        on_delete=models.CASCADE,
        verbose_name='Фильм',
        related_name='film_activities',
    )
    is_planned = models.BooleanField(
        'Буду смотерь',
        default=False
    )
    planned_at = models.DateTimeField(
        'Дата добавления в планируемые',
        null=True,
        blank=True,
        help_text='Когда фильм был отмечен как планируемый'
    )
    is_watched = models.BooleanField(
        'Просмотрено',
        default=False
    )
    watched_at = models.DateTimeField(
        'Дата просмотра',
        null=True,
        blank=True,
        help_text='Когда фильм был отмечен как просмотренный'
    )
    rating = models.SmallIntegerField(
        'Оценка',
        null=True,
        blank=True,
        validators=[
            MinValueValidator(0, 'Миинмальная балл 0.'),
            MaxValueValidator(10, 'Максимальный балл 10.')
        ]
    )
    is_public_for_planned = models.BooleanField(
        'Публичный для планируемого',
        default=True
    )
    is_public_for_watched = models.BooleanField(
        'Публичный для просмотренного',
        default=True
    )

    def __str__(self) -> str:
        return f'{self.user} - {self.film} ({self.film.pk})- is_watched = {self.is_watched} - is_planned = {self.is_planned}'

    def save(self, *args, **kwargs):
        """Автоматически устанавливает watched_at при отметке как просмотренного."""
        # Если фильм отмечается как просмотренный и дата не установлена
        if self.is_watched and not self.watched_at:
            self.watched_at = timezone.now()
        # Если снимается отметка "просмотрено" - очищаем дату
        elif not self.is_watched and self.watched_at:
            self.watched_at = None

        # Если фильм отмечается как планируемый
        if self.is_planned and not self.planned_at:
            self.planned_at = timezone.now()
        # Если снимается отметка "буду смотреть"- очищаем дату
        elif not self.is_planned and self.planned_at:
            self.planned_at = None

        super().save(*args, **kwargs)


class HistoryWatching(BaseCreatedUpdated):
    """История просмотров пользователей."""

    user_film_activities = models.ForeignKey(
        UserFilmActivity,
        on_delete=models.CASCADE,
        verbose_name='Пользователь-Фильм',
        related_name='watching_history',
    )
    watched_date = models.DateTimeField(auto_now_add=True)
    comment = models.CharField(
        'Комментарий к просмотру',
        max_length=1000,
        null=True,
        blank=True
    )





class Review(BaseCreatedUpdated):
    """Рецензии к кинопроизведениям."""

    author = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        verbose_name='Пользователь',
    )
    film = models.ForeignKey(
        Film,
        on_delete=models.CASCADE,
        verbose_name='Фильм',
    )
    text = models.TextField('Текст рецензии')

    class Meta:
        default_related_name = 'reviews'


class CommentReview(models.Model):
    """Комментарий к рецензии."""

    author = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        verbose_name='Пользователь',
    )
    review = models.ForeignKey(
        Review,
        on_delete=models.CASCADE,
        verbose_name='Комментарий',
    )
    text = models.CharField('Текст комментария', max_length=2000)
    created_at = models.DateTimeField(auto_now_add=True)
