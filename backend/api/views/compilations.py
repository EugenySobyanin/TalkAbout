from rest_framework import viewsets

from api.serializers.compilations import CompilationSerializer
from compilations.models import Compilation


class CompilationViewSet(viewsets.ModelViewSet):
    """Вью сет для подборок."""

    queryset = Compilation.objects.all()
    serializer_class = CompilationSerializer

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
