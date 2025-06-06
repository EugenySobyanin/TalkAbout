import base64
import binascii
import uuid

from django.core.files.base import ContentFile
from django.db import transaction
from rest_framework import serializers

from blog.models import Post, PhotoPost


class Base64ImageField(serializers.ImageField):
    """Кастомное поле для обработки изображений.

    Исполльзуется для декодирования изображения,
    полученного в формате Base64.
    """

    def to_internal_value(self, data):
        if not data or not isinstance(data, str):
            return None
        
        if data.startswith('data:image'):
            try:
                format, imgstr = data.split(';base64,')
                ext = format.split('/')[-1]
                file_name = f"{uuid.uuid4()}.{ext}"
                return ContentFile(base64.b64decode(imgstr), name=file_name)
            except (ValueError, AttributeError, IndexError, binascii.Error):
                raise serializers.ValidationError("Некорректное base64 изображение")
        return None


class PostSerializer(serializers.ModelSerializer):
    """Сериализатор для постов."""
    # Для записи списка закодированных картинок
    images = serializers.ListField(
        child=Base64ImageField(),
        write_only=True,
        required=False,
        max_length=10
    )
    # Для чтения ссылок на картинки
    post_photos = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = ('id', 'author', 'title', 'text', 'created_at', 'images', 'post_photos')
        read_only_fields = ('author', 'post_photos')

    def get_post_photos(self, obj):
        """Возвращает список URL изображений поста."""
        request = self.context.get('request')
        return [request.build_absolute_uri(photo.image.url) for photo in obj.post_photos.all()]

    def create(self, validated_data):
        images = validated_data.pop('images', [])  # Безопасное извлечение

        with transaction.atomic():  # Обеспечиваем атомарность
            post = Post.objects.create(**validated_data)

            if images:
                posts_images = [
                    PhotoPost(post=post, image=img)
                    for img in images
                ]
                PhotoPost.objects.bulk_create(posts_images)
        return post
