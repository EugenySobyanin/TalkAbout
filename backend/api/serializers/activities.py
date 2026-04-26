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
        fields = (
            'id',
            'name',
            'year',
            'poster_url',
            'poster_preview_url',
            'description',
            'movie_length',
            'kinopoisk_rating',
            'kinopoisk_votes',
            'imdb_rating',
            'imdb_votes',
        )


class ActivitySerializer(serializers.ModelSerializer):
    """Сериализатор активностей."""

    user = UserSerializer(many=False, read_only=True)
    film = FilmSerializer(many=False, read_only=True)

    class Meta:
        model = UserFilmActivity
        fields = (
            'id',
            'user',
            'film',
            'is_planned',
            'planned_at',
            'is_watched',
            'watched_at',
            'rating',
            'is_public_for_planned',
            'is_public_for_watched',
        )


class AddActivitySerializer(serializers.ModelSerializer):
    """Сериализатор для добавления активностей."""

    film_id = serializers.IntegerField(write_only=True)
    film = FilmSerializer(read_only=True)

    class Meta:
        model = UserFilmActivity
        fields = (
            'id',
            'film_id',
            'film',
            'is_planned',
            'is_watched',
            'rating',
            'is_public_for_planned',
            'is_public_for_watched',
        )

    def validate_film_id(self, value):
        """Проверяем, что фильм с таким ID существует."""
        try:
            Film.objects.get(pk=value)
        except Film.DoesNotExist:
            raise serializers.ValidationError(f"Фильм с id {value} не найден")
        return value

    def create(self, validated_data):
        """Создаем или обновляем активность."""
        film_id = validated_data.pop('film_id')
        film = Film.objects.get(pk=film_id)
        user = validated_data.pop('user')

        activity, created = UserFilmActivity.objects.get_or_create(
            film=film,
            user=user,
            defaults=validated_data,
        )

        if not created:
            for attr, value in validated_data.items():
                setattr(activity, attr, value)
            activity.save()

        return activity
