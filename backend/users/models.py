import uuid

from django.contrib.auth.models import AbstractUser
from django.db import models

from .utils import delete_old_avatar
from talk_about.constants import DEFAULT_AVATAR_PATH
from talk_about.utils import delete_folder_with_all_files


def user_avatar_path(instance, filename):
    """Путь для аватара пользователя."""
    ext = filename.split('.')[-1]  # Получаем расширение файла
    filename = f'{uuid.uuid4()}.{ext}'  # Генерируем уникальное имя файла
    return f'users/user_{instance.id}/avatar/{filename}'


class User(AbstractUser):
    """Модель пользователя."""

    class Role(models.TextChoices):
        ADMIN = 'ADMIN', 'Администратор'
        MODERATOR = 'MODERATOR', 'Модератор'
        USER = 'USER', 'Пользователь'

    role = models.CharField(
        max_length=20,
        choices=Role.choices,
        default=Role.USER,
        verbose_name='Роль'
    )

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
        upload_to=user_avatar_path,
        default=DEFAULT_AVATAR_PATH,
        blank=True,
        null=True
    )
    registered = models.DateField(
        'Зарегистрировался',
        auto_now_add=True
    )

    class Meta:
        verbose_name = 'Пользователь'
        verbose_name_plural = 'Пользователи'

    def __str__(self):
        return f'{self.pk} - {self.first_name} {self.last_name}'

    def save(self, *args, **kwargs):
        # Автоматическое удаление старого аватара.
        delete_old_avatar(self)
        super().save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        # Удаляет папку пользователя со всем содержимым
        folder_path = f'users/user_{self.pk}'
        delete_folder_with_all_files(folder_path)
        super().delete(*args, **kwargs)

    @property
    def is_admin(self):
        return self.role == self.Role.ADMIN

    @property
    def is_moderator(self):
        return self.role == self.Role.MODERATOR
