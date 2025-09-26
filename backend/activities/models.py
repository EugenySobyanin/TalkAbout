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
    is_wathed = models.BooleanField('Просмотрено', default=False)
    rating = models.SmallIntegerField(
        'Оценка',
        null=True,
        blank=True,
        validators=[
            MinValueValidator(0, 'Миинмальная балл 0.'),
            MaxValueValidator(10, 'Максимальный балл 10.')
        ]
    )
    is_public = models.BooleanField('Публичный', default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True, db_index=True)


class HistoryWatching(models.Model):
    """История просмотров пользователей."""

    user_film_activities = models.ForeignKey(
        UserFilmActivities,
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


class Collections(models.Model):
    """
    Подборки/Коллекции с фильмами.

    Подборки могут создавать и пользоватали и админы.
    """
    # Остановился здесь_________________________________________________________________________________


class CollectionFilms(models.Model):
    """"""


class Review(models.Model):
    """Рецензии к кинопроизведениям."""


class CommentReview(models.Model):
    """Комментарий к рецензии."""
