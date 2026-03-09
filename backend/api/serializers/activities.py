from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404

from activities.models import UserFilmActivity
from gallery.models import Film


User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    """Сериализатор для пользователя."""

    class Meta:
        model = User
        fields = ('first_name', 'last_name', 'email')


class FilmSerializer(serializers.ModelSerializer):
    """Сериализатор для фильмов."""

    class Meta:
        model = Film
        fields = ('id', 'name', 'year')


class ActivitySerializer(serializers.ModelSerializer):
    """Сериализатор активностей."""

    user = UserSerializer(many=False, read_only=True)
    film = FilmSerializer(many=False, read_only=True)

    class Meta:
        model = UserFilmActivity
        fields = (
            'user', 'film',
            'is_planned', 'is_watched',
            'rating',
            'is_public_for_planned', 'is_public_for_watched'
        )


class AddActivitySerializer(serializers.ModelSerializer):
    """Сериализатор для добавления активностей."""

    film_id = serializers.IntegerField(write_only=True)  # Принимаем ID
    film = FilmSerializer(read_only=True)  # Возвращаем полный объект

    class Meta:
        model = UserFilmActivity
        fields = ('film_id', 'film', 'is_planned', 'is_watched', 'rating')

    def validate_film_id(self, value):
        """Проверяем, что фильм с таким ID существует."""
        try:
            Film.objects.get(pk=value)
        except Film.DoesNotExist:
            raise serializers.ValidationError(f"Фильм с id {value} не найден")
        return value

    def create(self, validated_data):
        """Создаем активность, преобразуя film_id в film."""
        film_id = validated_data.pop('film_id')
        film = Film.objects.get(pk=film_id)

        # user будет передан из perform_create
        return UserFilmActivity.objects.create(
            film=film,
            **validated_data
        )
