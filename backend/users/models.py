from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """Модель пользователя."""

    email = models.EmailField(
        'Email', max_length=254, unique=True,
        blank=False, null=False
    )
    first_name = models.CharField(
        'Имя', max_length=150,
        blank=False, null=False
    )
    last_name = models.CharField(
        'Фамилия', max_length=150,
        blank=False, null=False
    )
    avatar = models.ImageField(
        'Аватар',
        upload_to='avatars/',
        default='avatars/default_avatar.png',
        blank=True,
        null=True
    )

    class Meta:
        verbose_name = 'Пользователь'
        verbose_name_plural = 'Пользователи'

    def __str__(self):
        return self.username
