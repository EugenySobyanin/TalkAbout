from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from rest_framework import viewsets, status
from rest_framework.response import Response

from api.serializers.activities import ActivitySerializer, AddActivitySerializer
from api.filters import ActivityFilter
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
        film_id = params.get('film_id') 

        # Базовые фильтры
        filters = {}

        # Определяем пользователя
        if user_id is not None:
            user = get_object_or_404(User, pk=user_id)
            filters['user'] = user
        else:
            filters['user'] = self.request.user

        if film_id is not None:
            filters['film_id'] = film_id

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

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

# class ActivityViewSet(viewsets.ModelViewSet):
#     serializer_class = ActivitySerializer
#     filterset_class = ActivityFilter  # Используем django-filter

#     def get_serializer_class(self):
#         if self.action == 'create':
#             return AddActivitySerializer
#         return super().get_serializer_class()

#     def get_queryset(self):
#         queryset = UserFilmActivity.objects.all()

#         # Автоматическая фильтрация по пользователю если не указан user_id
#         if not self.request.GET.get('user_id'):
#             queryset = queryset.filter(user=self.request.user)

#         return queryset

#     def perform_create(self, serializer):
#         serializer.save(user=self.request.user)
