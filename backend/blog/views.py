from django.contrib.auth import get_user_model
from rest_framework import viewsets

from .serializers import PostSerializer, CommentPostSerializer
from blog.models import Post, CommentPost


User = get_user_model()


class PostViewSet(viewsets.ModelViewSet):
    """Вьюсет для публикаций."""

    queryset = Post.objects.all()
    serializer_class = PostSerializer

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

    def get_queryset(self):
        # Получаем ID пользователей, на которых подписан текущий пользователь
        following_ids = self.request.user.user_subscriptions.values_list('following_id', flat=True)
        # Добавляем ID текущего пользователя
        all_authors_ids = list(following_ids) + [self.request.user.id]
        return Post.objects.filter(
            author_id__in=all_authors_ids
        )


class CommentPostViewSet(viewsets.ModelViewSet):
    """Вьюсет для комментариев."""

    serializer_class = CommentPostSerializer
