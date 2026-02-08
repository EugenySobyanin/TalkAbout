from django.urls import include, path
from rest_framework import routers

from activities.views import UserActivitiesView, UserFilmActivityView

film_router = routers.DefaultRouter()

# film_router.register('films', UserActivitieViewSet, basename='films')

urlpatterns = [
    # path('', include(film_router.urls)),
    # path('user_activities/<int:film_id>/', UserFilmActivitieView.as_view()),
    path('user_activities/', UserActivitiesView.as_view()),
    path('user_activities/<int:film_id>/', UserFilmActivityView.as_view()),
    
]
