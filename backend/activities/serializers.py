from rest_framework import serializers

from activities.models import UserFilmActivitie
from gallery.models import Film


class UserActivitieSerializer(serializers.ModelSerializer):
    """Сериализатор для фильмов."""

    class Meta:
        model = UserFilmActivitie
        fields = ('id', 'user', 'film', 'is_planned', 'is_watched', 'rating', 'is_public',)
        read_only_fields = ('is_watched', 'rating', 'is_public')
