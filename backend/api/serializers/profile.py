from django.contrib.auth import get_user_model
from rest_framework import serializers

from api.serializers.users import CustomUserSerializer
from activities.models import UserFilmActivity
from compilations.models import Compilation
from gallery.models import Film
from blog.models import PhotoUser, Follow

User = get_user_model()


class ProfileFilmSerializer(serializers.ModelSerializer):
    """Короткий сериализатор фильма для страницы пользователя."""

    class Meta:
        model = Film
        fields = (
            'id',
            'name',
            'year',
            'kinopoisk_rating',
            'imdb_rating',
            'poster_url',
            'poster_preview_url',
            'logo_url',
            'logo_preview_url',
        )


class PhotoUserSerializer(serializers.ModelSerializer):
    """Сериализатор фотографий пользователя."""

    image_url = serializers.SerializerMethodField()

    class Meta:
        model = PhotoUser
        fields = (
            'id',
            'image',
            'image_url',
            'uploaded_at',
        )

    def get_image_url(self, obj):
        if not obj.image:
            return None

        request = self.context.get('request')
        if request:
            return request.build_absolute_uri(obj.image.url)
        return obj.image.url


class UserFilmActivityProfileSerializer(serializers.ModelSerializer):
    """Сериализатор активностей пользователя для профиля."""

    film = ProfileFilmSerializer(read_only=True)

    class Meta:
        model = UserFilmActivity
        fields = (
            'id',
            'film',
            'is_planned',
            'planned_at',
            'is_watched',
            'watched_at',
            'rating',
            'is_public_for_planned',
            'is_public_for_watched',
            'created_at',
            'updated_at',
        )


class CompilationProfileSerializer(serializers.ModelSerializer):
    """Сериализатор подборок пользователя для профиля."""

    films = ProfileFilmSerializer(many=True, read_only=True)
    films_count = serializers.SerializerMethodField()

    class Meta:
        model = Compilation
        fields = (
            'id',
            'title',
            'description',
            'is_public',
            'films_count',
            'films',
            'created_at',
            'updated_at',
        )

    def get_films_count(self, obj):
        return obj.films.count()


class SubscriptionSerializer(serializers.ModelSerializer):
    """На кого подписан пользователь."""

    following = CustomUserSerializer(read_only=True)

    class Meta:
        model = Follow
        fields = (
            'id',
            'following',
        )


class SubscriberSerializer(serializers.ModelSerializer):
    """Кто подписан на пользователя."""

    follower = CustomUserSerializer(read_only=True)

    class Meta:
        model = Follow
        fields = (
            'id',
            'follower',
        )


class UserProfileSerializer(serializers.ModelSerializer):
    """Полный сериализатор страницы пользователя."""

    full_name = serializers.SerializerMethodField()
    avatar_url = serializers.SerializerMethodField()

    activities = serializers.SerializerMethodField()
    watched_activities = serializers.SerializerMethodField()
    planned_activities = serializers.SerializerMethodField()

    compilations = serializers.SerializerMethodField()
    user_photos = serializers.SerializerMethodField()

    subscriptions = serializers.SerializerMethodField()
    subscribers = serializers.SerializerMethodField()

    activities_count = serializers.SerializerMethodField()
    watched_count = serializers.SerializerMethodField()
    planned_count = serializers.SerializerMethodField()
    compilations_count = serializers.SerializerMethodField()
    subscriptions_count = serializers.SerializerMethodField()
    subscribers_count = serializers.SerializerMethodField()
    photos_count = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = (
            'id',
            'username',
            'email',
            'first_name',
            'last_name',
            'full_name',
            'avatar',
            'avatar_url',
            'registered',

            'activities_count',
            'watched_count',
            'planned_count',
            'compilations_count',
            'subscriptions_count',
            'subscribers_count',
            'photos_count',

            'activities',
            'watched_activities',
            'planned_activities',
            'compilations',
            'user_photos',
            'subscriptions',
            'subscribers',
        )

    def get_full_name(self, obj):
        return f'{obj.first_name} {obj.last_name}'.strip()

    def get_avatar_url(self, obj):
        if not obj.avatar:
            return None

        request = self.context.get('request')
        if request:
            return request.build_absolute_uri(obj.avatar.url)
        return obj.avatar.url

    def get_activities(self, obj):
        queryset = obj.activities.select_related('film').order_by('-updated_at')
        return UserFilmActivityProfileSerializer(
            queryset,
            many=True,
            context=self.context
        ).data

    def get_watched_activities(self, obj):
        queryset = obj.activities.filter(
            is_watched=True
        ).select_related('film').order_by('-watched_at', '-updated_at')
        return UserFilmActivityProfileSerializer(
            queryset,
            many=True,
            context=self.context
        ).data

    def get_planned_activities(self, obj):
        queryset = obj.activities.filter(
            is_planned=True
        ).select_related('film').order_by('-planned_at', '-updated_at')
        return UserFilmActivityProfileSerializer(
            queryset,
            many=True,
            context=self.context
        ).data

    def get_compilations(self, obj):
        queryset = obj.collections.prefetch_related('films').order_by('-created_at')
        return CompilationProfileSerializer(
            queryset,
            many=True,
            context=self.context
        ).data

    def get_user_photos(self, obj):
        queryset = obj.user_photos.order_by('-uploaded_at')
        return PhotoUserSerializer(
            queryset,
            many=True,
            context=self.context
        ).data

    def get_subscriptions(self, obj):
        queryset = obj.user_subscriptions.select_related('following').order_by('-id')
        return SubscriptionSerializer(
            queryset,
            many=True,
            context=self.context
        ).data

    def get_subscribers(self, obj):
        queryset = obj.user_subscribers.select_related('follower').order_by('-id')
        return SubscriberSerializer(
            queryset,
            many=True,
            context=self.context
        ).data

    def get_activities_count(self, obj):
        return obj.activities.count()

    def get_watched_count(self, obj):
        return obj.activities.filter(is_watched=True).count()

    def get_planned_count(self, obj):
        return obj.activities.filter(is_planned=True).count()

    def get_compilations_count(self, obj):
        return obj.collections.count()

    def get_subscriptions_count(self, obj):
        return obj.user_subscriptions.count()

    def get_subscribers_count(self, obj):
        return obj.user_subscribers.count()

    def get_photos_count(self, obj):
        return obj.user_photos.count()