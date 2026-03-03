from rest_framework import serializers
from django.contrib.auth import get_user_model

from activities.models import UserFilmActivitie
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


class AddUserActivitySerializer(serializers.ModelSerializer):
    """Сериализатор для добавления активностей."""

    class Meta:
        model = UserFilmActivitie
        fields = ('id', 'user', 'film',
                  'is_planned', 'is_watched', 'rating', 'is_public')


class ActivitySerializer(serializers.ModelSerializer):
    """Сериализатор активностей."""

    user = UserSerializer(many=False, read_only=True)
    film = FilmSerializer(many=False, read_only=True)

    class Meta:
        model = UserFilmActivitie
        fields = ('user', 'film',
                  'is_planned', 'is_watched', 'rating', 'is_public')
