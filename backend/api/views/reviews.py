from django.db.models import Count, Q
from django.shortcuts import get_object_or_404
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from activities.models import Review, CommentReview
from api.serializers.reviews import (
    ReviewListSerializer,
    ReviewDetailSerializer,
    ReviewCreateUpdateSerializer,
    ReviewCommentSerializer,
)
from api.pagination import ReviewPagination, ReviewCommentPagination


class IsAuthorOrReadOnly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True

        return obj.author_id == request.user.id


def build_review_stats(queryset):
    total = queryset.count()

    counts = queryset.aggregate(
        positive=Count(
            'id',
            filter=Q(review_type=Review.ReviewType.POSITIVE),
        ),
        neutral=Count(
            'id',
            filter=Q(review_type=Review.ReviewType.NEUTRAL),
        ),
        negative=Count(
            'id',
            filter=Q(review_type=Review.ReviewType.NEGATIVE),
        ),
    )

    def item(value):
        percent = round(value * 100 / total, 1) if total else 0

        return {
            'count': value,
            'percent': percent,
        }

    return {
        'total': total,
        'positive': item(counts['positive']),
        'neutral': item(counts['neutral']),
        'negative': item(counts['negative']),
    }


class ReviewViewSet(viewsets.ModelViewSet):
    permission_classes = [
        permissions.IsAuthenticatedOrReadOnly,
        IsAuthorOrReadOnly,
    ]
    pagination_class = ReviewPagination

    def get_queryset(self):
        queryset = (
            Review.objects
            .select_related('author', 'film')
            .annotate(comments_count=Count('comments'))
            .order_by('-created_at')
        )

        film_id = self.request.query_params.get('film_id')

        if film_id:
            queryset = queryset.filter(film_id=film_id)

        review_type = self.request.query_params.get('review_type')

        if review_type:
            queryset = queryset.filter(review_type=review_type)

        return queryset

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return ReviewCreateUpdateSerializer

        if self.action == 'retrieve':
            return ReviewDetailSerializer

        return ReviewListSerializer

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        film_id = request.query_params.get('film_id')

        page = self.paginate_queryset(queryset)

        if page is not None:
            serializer = self.get_serializer(
                page,
                many=True,
                context={'request': request},
            )
            response = self.get_paginated_response(serializer.data)

            if film_id:
                stats_queryset = Review.objects.filter(film_id=film_id)
                response.data['stats'] = build_review_stats(stats_queryset)

            return response

        serializer = self.get_serializer(
            queryset,
            many=True,
            context={'request': request},
        )

        data = {
            'results': serializer.data,
        }

        if film_id:
            stats_queryset = Review.objects.filter(film_id=film_id)
            data['stats'] = build_review_stats(stats_queryset)

        return Response(data)

    @action(
        detail=True,
        methods=['get', 'post'],
        url_path='comments',
        pagination_class=ReviewCommentPagination,
    )
    def comments(self, request, pk=None):
        review = get_object_or_404(
            Review.objects.select_related('author', 'film'),
            pk=pk,
        )

        if request.method == 'GET':
            comments = review.comments.select_related('author').all()

            paginator = ReviewCommentPagination()
            page = paginator.paginate_queryset(comments, request)

            serializer = ReviewCommentSerializer(
                page,
                many=True,
                context={'request': request},
            )

            return paginator.get_paginated_response(serializer.data)

        if not request.user.is_authenticated:
            return Response(
                {'detail': 'Необходима авторизация.'},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        serializer = ReviewCommentSerializer(
            data=request.data,
            context={'request': request},
        )
        serializer.is_valid(raise_exception=True)
        serializer.save(
            author=request.user,
            review=review,
        )

        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED,
        )


class ReviewCommentViewSet(viewsets.ModelViewSet):
    serializer_class = ReviewCommentSerializer
    permission_classes = [
        permissions.IsAuthenticatedOrReadOnly,
        IsAuthorOrReadOnly,
    ]
    http_method_names = [
        'get',
        'patch',
        'delete',
        'head',
        'options',
    ]

    def get_queryset(self):
        return (
            CommentReview.objects
            .select_related('author', 'review')
            .order_by('created_at')
        )