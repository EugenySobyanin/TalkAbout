from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from rest_framework import viewsets

from api.serializers.compilations import CompilationSerializer
from api.permissions import IsOwnerOrPublicReadOnly
from compilations.models import Compilation


User = get_user_model()


class CompilationViewSet(viewsets.ModelViewSet):
    """Вью сет для подборок."""

    serializer_class = CompilationSerializer
    permission_classes = [IsOwnerOrPublicReadOnly]

    def get_queryset(self):
        params = self.request.GET
        user_id = params.get('user_id')

        # Определяем пользователя
        if user_id is not None:
            user = get_object_or_404(User, pk=user_id)
            return Compilation.objects.filter(user=user, is_public=True)

        return Compilation.objects.filter(user=self.request.user)

    def get_object(self):
        """Переопределяем получение объекта для проверки доступа"""
        obj = get_object_or_404(Compilation, pk=self.kwargs['pk'])
        self.check_object_permissions(self.request, obj)
        return obj

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
