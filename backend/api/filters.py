import django_filters
from django_filters import rest_framework as filters

from gallery.models import (
    Film,
    Type,
    Genre,
    Person,
    Country
)


class FilmFilter(filters.FilterSet):
    """Лаконичный фильтр только по нужным полям."""

    # Год (диапазон)
    year = filters.RangeFilter()

    # Длительность (диапазон)
    movie_length = filters.RangeFilter()

    # Рейтинг Кинопоиска (от и до)
    kinopoisk_rating = filters.RangeFilter()

    # Рейтинг IMDb (от и до)
    imdb_rating = filters.RangeFilter()

    # Возрастной рейтинг (точное совпадение)
    age_rating = filters.NumberFilter()

    # Бюджет (диапазон)
    budget_value = filters.RangeFilter()

    # Тип (можно несколько)
    type = filters.ModelMultipleChoiceFilter(
        field_name='type__id',
        to_field_name='id',
        queryset=Type.objects.all(),
        label='Тип (ID)'
    )

    # Жанр (можно несколько)
    genres = filters.ModelMultipleChoiceFilter(
        field_name='genres__id',
        to_field_name='id',
        queryset=Genre.objects.all(),
        label='Жанр (ID)'
    )

    # Страна (можно несколько)
    countries = filters.ModelMultipleChoiceFilter(
        field_name='countries__id',
        to_field_name='id',
        queryset=Country.objects.all(),
        label='Страна (ID)'
    )

    # Персоны (можно несколько)
    persons = filters.ModelMultipleChoiceFilter(
        field_name='persons__id',
        to_field_name='id',
        queryset=Person.objects.all(),
        label='Персона (ID)'
    )

    class Meta:
        model = Film
        fields = []
