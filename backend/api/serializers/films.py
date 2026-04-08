from django.db.models import Avg
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
# Нужно добавить поле для оценки
class SeaarchListFilmSerilizer(serializers.ModelSerializer):
    """Сериализатор для списков фильмов."""

    rating = serializers.SerializerMethodField()

    class Meta:
        model = Film
        fields = [
            'id',
            'name',
            'alternative_name',
            'en_name',
            'year',
            'movie_length',
            'poster',
            'logo',
            'rating',
            'kinopoisk_rating',
            'imdb_rating',
            'short_description',
        ]

    def get_rating(self, obj):
        """
        Вычисляет средний рейтинг фильма из активностей пользователей
        Учитываются только те активности, где rating не null
        """
        # Используем аннотацию, если она есть в queryset
        if hasattr(obj, 'avg_rating'):
            return round(obj.avg_rating, 1) if obj.avg_rating else None

        # Если аннотации нет, вычисляем
        result = obj.film_activities.filter(
            rating__isnull=False
        ).aggregate(Avg('rating'))['rating__avg']

        return round(result, 1) if result else None
