import django_filters
from activities.models import UserFilmActivity


class ActivityFilter(django_filters.FilterSet):
    user_id = django_filters.NumberFilter(field_name='user_id')
    film_id = django_filters.NumberFilter(field_name='film_id')
    is_planned = django_filters.BooleanFilter(field_name='is_planned')
    is_watched = django_filters.BooleanFilter(field_name='is_watched')

    class Meta:
        model = UserFilmActivity
        fields = ['user_id', 'film_id', 'is_planned', 'is_watched']
