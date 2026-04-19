import django_filters
from django_filters import rest_framework as filters

from gallery.models import (
    Film,
    Genre,
    Person,
    Country,
)


class FilmFilter(filters.FilterSet):
    """Фильтр фильмов с явными min/max параметрами для фронтенда."""

    # Год выпуска
    year_min = filters.NumberFilter(field_name='year', lookup_expr='gte')
    year_max = filters.NumberFilter(field_name='year', lookup_expr='lte')

    # Длительность
    movie_length_min = filters.NumberFilter(field_name='movie_length', lookup_expr='gte')
    movie_length_max = filters.NumberFilter(field_name='movie_length', lookup_expr='lte')

    # Рейтинг Кинопоиска
    kinopoisk_rating_min = filters.NumberFilter(field_name='kinopoisk_rating', lookup_expr='gte')
    kinopoisk_rating_max = filters.NumberFilter(field_name='kinopoisk_rating', lookup_expr='lte')

    # Рейтинг IMDb
    imdb_rating_min = filters.NumberFilter(field_name='imdb_rating', lookup_expr='gte')
    imdb_rating_max = filters.NumberFilter(field_name='imdb_rating', lookup_expr='lte')

    # Возрастной рейтинг
    age_rating = filters.NumberFilter(field_name='age_rating')

    # Жанры
    genres = filters.ModelMultipleChoiceFilter(
        field_name='genres__id',
        to_field_name='id',
        queryset=Genre.objects.all(),
        label='Жанры (ID)',
    )

    # Страны
    countries = filters.ModelMultipleChoiceFilter(
        field_name='countries__id',
        to_field_name='id',
        queryset=Country.objects.all(),
        label='Страны (ID)',
    )

    # Персоны
    persons = filters.ModelMultipleChoiceFilter(
        field_name='persons__id',
        to_field_name='id',
        queryset=Person.objects.all(),
        label='Персоны (ID)',
    )

    class Meta:
        model = Film
        fields = []
