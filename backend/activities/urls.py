from django.urls import include, path
from rest_framework import routers

from activities.views import UserActivitiesView, UserFilmActivityView

film_router = routers.DefaultRouter()


urlpatterns = [
    path('user_activities/', UserActivitiesView.as_view()),
    path('user_activities/<int:film_id>/', UserFilmActivityView.as_view()),
]
