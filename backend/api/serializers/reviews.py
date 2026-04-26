from django.contrib.auth import get_user_model
from rest_framework import serializers

from activities.models import Review, CommentReview
from gallery.models import Film


User = get_user_model()


class ReviewAuthorSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    avatar_url = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id',
            'username',
            'first_name',
            'last_name',
            'full_name',
            'avatar_url',
        ]

    def get_full_name(self, obj):
        return f'{obj.first_name} {obj.last_name}'.strip()

    def get_avatar_url(self, obj):
        if not getattr(obj, 'avatar', None):
            return None

        request = self.context.get('request')
        if request:
            return request.build_absolute_uri(obj.avatar.url)

        return obj.avatar.url


class ReviewFilmSerializer(serializers.ModelSerializer):
    class Meta:
        model = Film
        fields = [
            'id',
            'name',
            'alternative_name',
            'en_name',
            'year',
            'poster_url',
            'poster_preview_url',
        ]


class ReviewCommentSerializer(serializers.ModelSerializer):
    author = ReviewAuthorSerializer(read_only=True)
    can_edit = serializers.SerializerMethodField()

    class Meta:
        model = CommentReview
        fields = [
            'id',
            'author',
            'text',
            'created_at',
            'updated_at',
            'can_edit',
        ]
        read_only_fields = [
            'id',
            'author',
            'created_at',
            'updated_at',
            'can_edit',
        ]

    def get_can_edit(self, obj):
        request = self.context.get('request')
        return bool(
            request
            and request.user.is_authenticated
            and obj.author_id == request.user.id
        )


class ReviewListSerializer(serializers.ModelSerializer):
    author = ReviewAuthorSerializer(read_only=True)
    film = ReviewFilmSerializer(read_only=True)
    comments_count = serializers.IntegerField(read_only=True)
    can_edit = serializers.SerializerMethodField()

    class Meta:
        model = Review
        fields = [
            'id',
            'author',
            'film',
            'title',
            'text',
            'review_type',
            'is_spoiler',
            'comments_count',
            'created_at',
            'updated_at',
            'can_edit',
        ]

    def get_can_edit(self, obj):
        request = self.context.get('request')
        return bool(
            request
            and request.user.is_authenticated
            and obj.author_id == request.user.id
        )


class ReviewDetailSerializer(ReviewListSerializer):
    latest_comments = serializers.SerializerMethodField()

    class Meta(ReviewListSerializer.Meta):
        fields = ReviewListSerializer.Meta.fields + [
            'latest_comments',
        ]

    def get_latest_comments(self, obj):
        comments = obj.comments.select_related('author').all()[:5]
        return ReviewCommentSerializer(
            comments,
            many=True,
            context=self.context,
        ).data


class ReviewCreateUpdateSerializer(serializers.ModelSerializer):
    film = serializers.PrimaryKeyRelatedField(
        queryset=Film.objects.all(),
        required=True,
    )

    class Meta:
        model = Review
        fields = [
            'id',
            'film',
            'title',
            'text',
            'review_type',
            'is_spoiler',
        ]

    def validate(self, attrs):
        request = self.context.get('request')

        if not request or not request.user.is_authenticated:
            return attrs

        film = attrs.get('film') or getattr(self.instance, 'film', None)

        if self.instance is None and film:
            exists = Review.objects.filter(
                author=request.user,
                film=film,
            ).exists()

            if exists:
                raise serializers.ValidationError(
                    'Вы уже оставили рецензию на этот фильм.'
                )

        return attrs