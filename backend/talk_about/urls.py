from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView
from rest_framework import routers


from api.router import router as api_router


router = routers.DefaultRouter()
router.registry.extend(api_router.registry)

urlpatterns = [
    path('admin/', admin.site.urls),

    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),

    path('api/v1/blog/', include('blog.urls')),
    path('api/v1/activities/', include('activities.urls')),
    path('api/v1/compilations/', include('compilations.urls')),
    path('api/v1/', include('djoser.urls')),
    path('api/v1/auth/', include('djoser.urls.authtoken')),
    path('api/v1/', include(router.urls)),
]

if settings.DEBUG:
    urlpatterns += static(
        settings.MEDIA_URL,
        document_root=settings.MEDIA_ROOT
    )
