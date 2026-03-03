from rest_framework import routers

from .views.activities import ActivityViewSet


router = routers.DefaultRouter()

router.register(r'activities', ActivityViewSet, basename='activity')
