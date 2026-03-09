from django.contrib import admin
from django.urls import include, path
from rest_framework import routers

from api.router import router as api_router


router = routers.DefaultRouter()
router.registry.extend(api_router.registry)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/blog/', include('blog.urls')),
    path('api/v1/activities/', include('activities.urls')),
    path('api/v1/compilations/', include('compilations.urls')),
    path('api/v1/', include('djoser.urls')),
    path('api/v1/auth/', include('djoser.urls.authtoken')),
    path('api/v1/', include(router.urls)),
]
