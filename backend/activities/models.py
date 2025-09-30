from django.contrib.auth import get_user_model
from django.core.validators import (MinValueValidator,
                                    MaxValueValidator,)
from django.db import models

from gallery.models import Film


User = get_user_model()


class BaseCreatedUpdated(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True, db_index=True)

    class Meta:
        abstract = True


class UserFilmActivitie(BaseCreatedUpdated):
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


class HistoryWatching(BaseCreatedUpdated):
    """История просмотров пользователей."""

    user_film_activities = models.ForeignKey(
        UserFilmActivitie,
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


class Collection(BaseCreatedUpdated):
    """
    Подборки/Коллекции с фильмами.

    Подборки могут создавать и пользоватали и админы.
    """

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        verbose_name='Пользователь',
        related_name='collections',
    )
    title = models.CharField(
        'Название подборки',
        max_length=255,
        null=True,
        blank=True
    )
    description = models.CharField(
        'Описание подборки',
        max_length=500,
        null=True,
        blank=True
    )
    is_public = models.BooleanField('Публичный', default=False)
    films = models.ManyToManyField(
        Film,
        through='CollectionFilms',
        verbose_name='Фильмы',
    )


class CollectionFilms(BaseCreatedUpdated):
    """Связь Подборка - Фильм (многие ко многиим)."""

    collection = models.ForeignKey(
        Collection,
        on_delete=models.CASCADE,
        verbose_name='Подборка',
        # related_name=...
    )
    film = models.ForeignKey(
        Film,
        on_delete=models.CASCADE,
        verbose_name='Фильм',
        # related_name=...
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
