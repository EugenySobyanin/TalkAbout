from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from rest_framework import viewsets

from .models import Post, CommentPost
from .pagination import CustomPagination
from .permissions import IsAuthorOrReadOnly
from .serializers import PostSerializer, CommentPostSerializer


User = get_user_model()


class PostViewSet(viewsets.ModelViewSet):
    """Вьюсет для публикаций."""

    queryset = Post.objects.all()
    serializer_class = PostSerializer
    pagination_class = CustomPagination
    permission_classes = (IsAuthorOrReadOnly,)
    http_method_names = ['get', 'post', 'delete', 'head', 'options']

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

    def get_queryset(self):
        # Ограничиваем выборку только если запрос на получение списка постов
        if self.action == 'list':
            # Получаем ID пользователей, на которых подписан текущий пользователь
            following_ids = self.request.user.user_subscriptions.values_list('following_id', flat=True)
            # Добавляем ID текущего пользователя
            all_authors_ids = list(following_ids) + [self.request.user.id]
            return Post.objects.filter(
                author_id__in=all_authors_ids
            )
        return Post.objects.all()


# Не работает нихрена
class CommentPostViewSet(viewsets.ModelViewSet):
    """Вьюсет для комментариев."""

    serializer_class = CommentPostSerializer
    permission_classes = (IsAuthorOrReadOnly,)

    def perform_create(self, serializer):
        post = get_object_or_404(Post, pk=self.kwargs['post_id'])
        serializer.save(author=self.request.user, post=post)

    def get_queryset(self):
        return CommentPost.objects.filter(post_id=self.kwargs['post_id'])
