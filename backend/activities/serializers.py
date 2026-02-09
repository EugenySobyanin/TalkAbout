from rest_framework import serializers

from activities.models import UserFilmActivitie
from gallery.models import Film


class AddUserActivitySerializer(serializers.ModelSerializer):
    """Сериализатор для добавления активностей."""

    class Meta:
        model = UserFilmActivitie
        fields = ('id', 'user', 'film',
                  'is_planned', 'is_watched', 'rating', 'is_public')


class UserActivitySerializer(serializers.ModelSerializer):
    """Сериализатор активностей."""
    # Нужен серилизатор для пользователя
    # Нужен сериализатор для фильма

    class Meta:
        model = UserFilmActivitie
        fields = ('id', 'user', 'film',
                  'is_planned', 'is_watched', 'rating', 'is_public')
