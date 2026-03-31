from rest_framework import filters, viewsets, permissions

from api.serializers.films import FilmSerializer, SeaarchListFilmSerilizer
from api.permissions import FilmsPermissions
from gallery.models import Film


class FilmViewSet(viewsets.ModelViewSet):
    """Вьюсет для фильмов."""

    queryset = Film.objects.all()
    serializer_class = FilmSerializer
    permission_classes = [permissions.AllowAny]
    # permission_classes = [FilmsPermissions]
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'alternative_name', 'en_name']

    def get_serializer_class(self):
        if self.action == 'list':
            return SeaarchListFilmSerilizer
        return super().get_serializer_class()
