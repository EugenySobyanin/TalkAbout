import uuid

from django.contrib.auth import get_user_model
from django.core.files.storage import default_storage
from django.db import models


User = get_user_model()


def user_photo_path(instance, filename):
    """
    Путь до личных фотогрфий пользователя.

    Args:
        instance: Экземпляр модели PhotoUser
        filename: Имя файла, который хочет добавить пользователь
    """
    ext = filename.split('.')[-1]
    filename = f'{uuid.uuid4()}.{ext}'
    return f'users/user_{instance.user.id}/photos/{filename}'


class PhotoUser(models.Model):
    """Фотографии на странице пользователя."""
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='user_photos'
    )
    image = models.ImageField(
        'Изображение',
        upload_to=user_photo_path  # media/users/user_<ID>/photos/<имя_файла>/
    )
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def delete(self, *args, **kwargs):
        #  При удалении объекта из БД - удаляем физический файл с сервера
        default_storage.delete(self.image.name)
        return super().delete(*args, **kwargs)


class Follow(models.Model):
    """Подписки пользователя."""
    follower = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='user_subscriptions'  # Подписки
    )
    following = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='user_subscribers'  # Подписчики
    )


class Post(models.Model):
    """Публикации пользователей(на любую тематику)."""

    author = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
    )
    title = models.CharField(
        'Заголовок поста',
        max_length=255,
        blank=True,
        null=True,
    )
    text = models.TextField(
        'Текст поста',
        max_length=10000,
        blank=True,
        null=True
    )
    created_at = models.DateTimeField(auto_now_add=True)
