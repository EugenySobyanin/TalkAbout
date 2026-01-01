from django.urls import include, path
from rest_framework import routers

from activities.views import UserActivitieViewSet, UserFilmActivitieView

film_router = routers.DefaultRouter()

film_router.register('films', UserActivitieViewSet, basename='films')

urlpatterns = [
    # path('', include(film_router.urls)),
    path('user_activities/<int:film_id>/', UserFilmActivitieView.as_view()),
]
