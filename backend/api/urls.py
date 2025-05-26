from django.urls import include, path
from rest_framework import routers

from .blog.views import PostViewSet


router = routers.DefaultRouter()
router.register('posts', PostViewSet, basename='posts')

urlpatterns = [
    path('blog/', include(router.urls)),
    path('', include('djoser.urls')),
    path('auth/', include('djoser.urls.authtoken')),
]
