from django.contrib.auth import get_user_model
from django.core.validators import (MinValueValidator,
                                    MaxValueValidator,)
from django.db import models

from gallery.models import Film


User = get_user_model()


class UserFilmActivities(models.Model):
    """
    Пользовательские активности.

    Основная модель для связит Пользователь - Фильм.
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
    )
    is_planned = models.BooleanField('Буду смотерь', default=False)
    is_wathed = models.BooleanField('Посмотрел', default=False)
    rating = models.SmallIntegerField(
        'Оценка',
        null=True,
        blank=True,
        validators= [
            MinValueValidator(0, 'Миинмальная балл 0.'),
            MaxValueValidator(10, 'Максимальный балл 10.')
        ]
    )
    is_public = models.BooleanField('Публичный', default=False)
    # Остановился здесь __________________________________________________________________________________________________________________________
    last_watched_date = models.DateTimeField()
    created_at = models.DateField()
    updated_at = models.DateField()


class HistoryWatching(models.Model):
    """История просмотров пользователей."""


class Collections(models.Model):
    """Подборки.

    Сборники с фильмами.
    """


class CollectionFilms(models.Model):
    """"""


class Review(models.Model):
    """Рецензии к кинопроизведениям."""


class CommentReview(models.Model):
    """Комментарий к рецензии."""
