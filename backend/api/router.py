from rest_framework import routers

from api.views.activities import ActivityViewSet
from api.views.compilations import CompilationViewSet
from api.views.films import FilmViewSet


router = routers.DefaultRouter()

router.register(r'activities', ActivityViewSet, basename='activity')
router.register(r'compilations', CompilationViewSet, basename='compilation')
router.register(r'films', FilmViewSet, basename='film')
