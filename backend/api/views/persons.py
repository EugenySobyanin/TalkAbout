from django.db.models import Q
from rest_framework import permissions, viewsets

from gallery.models import Person
from api.serializers.persons import PersonSerializer


class PersonViewSet(viewsets.ReadOnlyModelViewSet):
    """Персоны для фильтрации фильмов."""

    serializer_class = PersonSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        search = self.request.query_params.get('search', '').strip()

        if len(search) < 2:
            return Person.objects.none()

        queryset = Person.objects.filter(
            Q(name__icontains=search) |
            Q(en_name__icontains=search)
        ).order_by('name', 'en_name', 'id')

        return queryset[:30]