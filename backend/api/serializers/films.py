from rest_framework import serializers

from gallery.models import Film


# Упрощенная версия для разработки
class FilmSerializer(serializers.ModelSerializer):
    """Сериализатор для одного фильма."""

    class Meta:
        model = Film
        fields = [
            'id',
            'kinopoisk_api_id',
            'name',
            'alternative_name',
            'en_name',
            'description',
            'short_description',
            'slogan',
            'year',
            'movie_length',
            'rating_mpaa',
            'age_rating',
            'budget_value',
            'budget_currency',
        ]


# Упрощенная версия для разработки
class ListFilmSerilizer(serializers.ModelSerializer):
    """Сериализатор для списков фильмов."""

    class Meta:
        model = Film
        fields = [
            'id',
            'name',
            'year',
            'movie_length',
        ]
