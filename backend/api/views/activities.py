from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from rest_framework import viewsets, status
from rest_framework.response import Response

from api.serializers.activities import ActivitySerializer, AddActivitySerializer
from activities.models import UserFilmActivity


User = get_user_model()


class ActivityViewSet(viewsets.ModelViewSet):
    serializer_class = ActivitySerializer

    def get_serializer_class(self):
        if self.action == 'create':
            return AddActivitySerializer
        return super().get_serializer_class()

    def get_queryset(self):
        params = self.request.GET
        user_id = params.get('user_id')

        # Базовые фильтры
        filters = {}

        # Определяем пользователя
        if user_id is not None:
            user = get_object_or_404(User, pk=user_id)
            filters['user'] = user
        else:
            filters['user'] = self.request.user

        # Добавляем фильтры по типу активности
        if params.get('is_planned') is not None:
            filters['is_planned'] = True
            if user_id is not None:
                filters['is_public_for_planned'] = True
        elif params.get('is_watched') is not None:
            filters['is_watched'] = True
            if user_id is not None:
                filters['is_public_for_watched'] = True

        return UserFilmActivity.objects.filter(**filters)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
