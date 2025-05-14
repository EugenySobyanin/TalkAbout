import os
import uuid

from django.contrib.auth.models import AbstractUser
from django.core.files.storage import default_storage  # Для работы с файлами
from django.db import models

from talk_about.constants import DEFAULT_AVATAR_PATH


def user_avatar_path(instance, filename):
    """Путь для аватара пользователя."""
    ext = filename.split('.')[-1]  # Получаем расширение файла
    filename = f'{uuid.uuid4()}.{ext}'  # Генерируем уникальное имя файла
    return f'users/user_{instance.id}/avatar/{filename}'


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
        return self.username

    def save(self, *args, **kwargs):
        """Автоматическое удаление старого аватара."""
        if self.pk:  # Если пользователь уже существует
            old_user = User.objects.get(pk=self.pk)
            old_avatar = old_user.avatar

            # Удаляем старый аватар только если он не дефолтный и изменился
            if (
                old_avatar and
                old_avatar != self.avatar and
                old_avatar.name != DEFAULT_AVATAR_PATH
            ):
                default_storage.delete(old_avatar.path)
        super().save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        """Удаляет папку пользователя со всем содержимым"""
        folder_path = f'users/user_{self.pk}'

        # Полный физический путь к папке
        full_path = default_storage.path(folder_path)

        if default_storage.exists(folder_path):
            # Удаляем все содержимое папки рекурсивно
            for root, dirs, files in os.walk(full_path, topdown=False):
                for name in files:
                    os.remove(os.path.join(root, name))
                for name in dirs:
                    os.rmdir(os.path.join(root, name))

            # Удаляем саму папку
            os.rmdir(full_path)

        super().delete(*args, **kwargs)
