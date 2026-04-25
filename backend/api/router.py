from django.urls import include, path
from rest_framework import routers

from api.views.activities import ActivityViewSet
from api.views.compilations import CompilationViewSet
from api.views.films import FilmViewSet, TypeList, GenreList, CountryList, MyTopFilmsView, UserTopFilmsView
from api.views.profile import UserProfileView, MeProfileView


router = routers.DefaultRouter()

router.register(r'activities', ActivityViewSet, basename='activity')
router.register(r'compilations', CompilationViewSet, basename='compilation')
router.register(r'films', FilmViewSet, basename='film')


urlpatterns = [
    path('types/', TypeList.as_view(), name='type-list'),
    path('genres/', GenreList.as_view(), name='genre-list'),
    path('countries/', CountryList.as_view(), name='country-list'),

    path('users/<int:user_id>/profile/', UserProfileView.as_view(), name='user-profile'),
    path('users/me/profile/', MeProfileView.as_view(), name='me-profile'),

    path('users/me/top-films/', MyTopFilmsView.as_view(), name='me-top-films'),
    path('users/<int:user_id>/top-films/', UserTopFilmsView.as_view(), name='user-top-films'),

    path('', include(router.urls)),
]