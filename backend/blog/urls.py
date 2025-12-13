from django.urls import include, path
from rest_framework import routers

from .views import PostViewSet, CommentPostViewSet


router = routers.DefaultRouter()

router.register('posts', PostViewSet, basename='posts')
router.register(
    r'posts/(?P<post_id>\d+)/comments',
    CommentPostViewSet,
    basename='comments'
)

urlpatterns = [
    path('', include(router.urls)),
]
