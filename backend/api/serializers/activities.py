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
            'poster',
            'description',
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

    film_id = serializers.IntegerField(write_only=True)  # Принимаем ID
    film = FilmSerializer(read_only=True)  # Возвращаем полный объект

    class Meta:
        model = UserFilmActivity
        fields = ('id', 'film_id', 'film', 'is_planned', 'is_watched')

    def validate_film_id(self, value):
        """Проверяем, что фильм с таким ID существует."""
        try:
            Film.objects.get(pk=value)
        except Film.DoesNotExist:
            raise serializers.ValidationError(f"Фильм с id {value} не найден")
        return value

    def create(self, validated_data):
        """Создаем или обновляем активность."""
        print(validated_data)
        film_id = validated_data.pop('film_id')
        film = Film.objects.get(pk=film_id)
        user = validated_data.get('user')
        print(user)

        # Проверяем существование активности
        try:
            activity = UserFilmActivity.objects.get(film=film, user=user)
            # Если активность существует, обновляем её
            return self.update(activity, validated_data)
        except UserFilmActivity.DoesNotExist:
            # Если активности нет, создаем новую
            return UserFilmActivity.objects.create(
                film=film,
                **validated_data
            )
