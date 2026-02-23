from django.contrib.auth import get_user_model
from django.db import models

from gallery.models import Film


User = get_user_model()


class BaseCreatedUpdated(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True, db_index=True)

    class Meta:
        abstract = True


class Compilation(BaseCreatedUpdated):
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
        through='CompilationsFilms',
        verbose_name='Фильмы',
    )


class CompilationsFilms(BaseCreatedUpdated):
    """Связь Подборка - Фильм (многие ко многиим)."""

    collection = models.ForeignKey(
        Compilation,
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
