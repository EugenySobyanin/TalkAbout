import uuid

from django.contrib.auth import get_user_model
from django.core.files.storage import default_storage
from django.db import models

from talk_about.utils import delete_folder_with_all_files


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


def post_photo_path(instance, filename):
    """
    Путь до фотографий прикрепленных к публикациям.

    Args:
        instance: Экземпляр модели PhotoPost
        filename: Имя файла, который хочет добавить пользователь
    """
    ext = filename.split('.')[-1]
    filename = f'{uuid.uuid4()}.{ext}'
    return f'users/user_{instance.post.author.id}/posts/post_{instance.post.id}/{filename}'


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

    def __str__(self):
        return f'{self.follower.first_name} {self.follower.last_name} ({self.follower.id}) подписан на {self.following.first_name} {self.following.last_name} ({self.following.id})'


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

    class Meta:
        ordering = ('-created_at',)
        default_related_name = 'posts'

    def delete(self, *args, **kwargs):
        # Удаляем папку поста со всеми вложенными файлами
        folder_path = f'posts/post_{self.id}'
        delete_folder_with_all_files(folder_path)
        return super().delete(*args, **kwargs)


class PhotoPost(models.Model):
    """Фотографии прикрепленные к посту."""
    post = models.ForeignKey(
        Post,
        on_delete=models.CASCADE,
        verbose_name='Публикация',
        related_name='post_photos'
    )
    image = models.ImageField(
        'Изображение',
        upload_to=post_photo_path  # media/users/user_<ID>/posts/post_<ID>/<имя_файла>/
    )
    # uploaded_at = models.DateTimeField(auto_now_add=True)

    # По идее удаление отдельной фотографии поста не предусмотрено - предусмотрено удаление поста
    # def delete(self, *args, **kwargs):
    #     #  При удалении объекта из БД - удаляем физический файл с сервера
    #     default_storage.delete(f'post_{self.id}/{self.image.name}')
    #     return super().delete(*args, **kwargs)


class CommentPost(models.Model):
    """Модель комментария к посту."""

    author = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        verbose_name='Автор комментария'
    )
    post = models.ForeignKey(
        Post,
        on_delete=models.CASCADE,
        verbose_name='Публикация'
    )
    text = models.TextField(
        'Teкс комментария',
        max_length=5000,
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ('-created_at',)
        default_related_name = 'comments'
