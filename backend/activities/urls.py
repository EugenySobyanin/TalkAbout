from django.urls import include, path
from rest_framework import routers

from activities.views import UserActivitieViewSet, add_user_activitie

film_router = routers.DefaultRouter()

film_router.register('films', UserActivitieViewSet, basename='films')

urlpatterns = [
    # path('', include(film_router.urls)),
    path('user_activities/<int:film_id>/', add_user_activitie),
]
