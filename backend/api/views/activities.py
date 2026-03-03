from rest_framework import viewsets

from api.serializers.activities import ActivitySerializer
from activities.models import UserFilmActivitie


class ActivityViewSet(viewsets.ModelViewSet):
    queryset = UserFilmActivitie.objects.all()
    serializer_class = ActivitySerializer
