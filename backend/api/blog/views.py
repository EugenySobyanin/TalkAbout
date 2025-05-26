from django.contrib.auth import get_user_model
from rest_framework import viewsets

from .serializers import PostSerializer
from blog.models import Post


User = get_user_model()


class PostViewSet(viewsets.ModelViewSet):
    queryset = Post.objects.all()
    serializer_class = PostSerializer

    def perform_create(self, serializer):
        serializer.save(author=User.objects.get(pk=1))
