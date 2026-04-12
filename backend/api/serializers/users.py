# api/serializers.py
from django.contrib.auth import get_user_model
from rest_framework import serializers
from django.conf import settings

User = get_user_model()


class CustomUserSerializer(serializers.ModelSerializer):
    """Кастомный сериализатор для пользователя."""

    class Meta:
        model = User
        fields = [
            'id',
            'username',
            'first_name',
            'last_name',
            'avatar',
        ]

    # full_name = serializers.SerializerMethodField(read_only=True)
    # avatar_url = serializers.SerializerMethodField(read_only=True)
    # date_joined_formatted = serializers.SerializerMethodField(read_only=True)
    # films_count = serializers.SerializerMethodField(read_only=True)
    
    # class Meta:
    #     model = User
    #     fields = (
    #         'id',
    #         'email',
    #         'username',
    #         'first_name',
    #         'last_name',
    #         'full_name',
    #         'avatar',
    #         'avatar_url',
    #         'bio',
    #         'location',
    #         'birth_date',
    #         'date_joined',
    #         'date_joined_formatted',
    #         'last_login',
    #         'is_active',
    #         'films_count',
    #     )
    #     read_only_fields = (
    #         'id', 
    #         'email', 
    #         'date_joined', 
    #         'last_login', 
    #         'is_active'
    #     )
    #     extra_kwargs = {
    #         'password': {'write_only': True},
    #         'avatar': {'write_only': True},  # Скрываем поле с файлом
    #     }
    
    # def get_full_name(self, obj):
    #     """Возвращает полное имя пользователя."""
    #     if obj.first_name or obj.last_name:
    #         return f"{obj.first_name} {obj.last_name}".strip()
    #     return obj.username
    
    # def get_avatar_url(self, obj):
    #     """Возвращает URL аватара или дефолтную аватарку."""
    #     if obj.avatar:
    #         request = self.context.get('request')
    #         if request:
    #             return request.build_absolute_uri(obj.avatar.url)
    #         return obj.avatar.url
    #     return None  # Фронтенд сам подставит дефолтную
    
    # def get_date_joined_formatted(self, obj):
    #     """Возвращает отформатированную дату регистрации."""
    #     return obj.date_joined.strftime('%d.%m.%Y')
    
    # def get_films_count(self, obj):
    #     """Возвращает количество фильмов пользователя."""
    #     # Используем related_name='activities' из модели UserFilmActivity
    #     if hasattr(obj, 'activities'):
    #         return obj.activities.filter(is_watched=True).count()
    #     return 0
    
    # def to_representation(self, instance):
    #     """Добавляем дополнительные данные при сериализации."""
    #     data = super().to_representation(instance)
        
    #     # Убираем None значения для чистоты ответа
    #     return {k: v for k, v in data.items() if v is not None}
