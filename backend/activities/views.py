from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from rest_framework import viewsets

from activities.models import UserFilmActivitie, HistoryWatching
from activities.serializers import AddUserActivitySerializer
from gallery.models import Film


User = get_user_model()


class UserActivitiesView(APIView):
    """Получение списков планируемых и просмотренных фильмов."""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        user_id = request.query_params.get('user_id')
        is_planned = request.query_params.get('is_planned')
        is_watched = request.query_params.get('is_watched')

        # Определяем, чьи активности запрашиваем
        if user_id:
            target_user = get_object_or_404(User, pk=user_id)
            # Можно добавить проверку приватности профиля
        else:
            target_user = request.user

        # Базовый queryset
        queryset = UserFilmActivitie.objects.filter(user=target_user)

        # Фильтрация
        if is_planned is not None:
            queryset = queryset.filter(is_planned=is_planned.lower() == 'true')
        if is_watched is not None:
            queryset = queryset.filter(is_watched=is_watched.lower() == 'true')

        # Сортировка по дате добавления
        queryset = queryset.order_by('-created_at')

        serializer = AddUserActivitySerializer(queryset, many=True)
        return Response(serializer.data)


class UserFilmActivityView(APIView):
    """Отдельные записи user_activity."""

    permission_classes = [IsAuthenticated]

    def post(self, request, film_id):
        """Добавить/обновить активность для фильма.
        
        Используется для управления основными статусами:
        - Добавить в планируемые (is_planned=True)
        - Добавить в просмотренные (is_watched=True)
        - Сменить статус (например, из планируемых в просмотренные)
        """
        film = get_object_or_404(Film, pk=film_id)

        # Подготавливаем данные
        data = request.data.copy()
        data['user'] = request.user.pk
        data['film'] = film.pk

        # Проверка на одновременное добавление в оба списка
        if data.get('is_planned') and data.get('is_watched'):
            return Response(
                {'error': 'Выберите только один статус: планируемый или просмотренный'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Пытаемся найти существующую запись
        try:
            activity = UserFilmActivitie.objects.get(user=request.user, film=film)
            
            # Если пользователь пытается установить тот же статус, что уже есть
            if 'is_planned' in data and activity.is_planned == data['is_planned'] and \
               'is_watched' in data and activity.is_watched == data['is_watched']:
                # Просто обновляем другие поля (если есть)
                if len(data) > 2:  # Если есть поля кроме user и film
                    serializer = AddUserActivitySerializer(
                        activity, 
                        data=data, 
                        partial=True
                    )
                    if serializer.is_valid():
                        serializer.save()
                        return Response(serializer.data, status=status.HTTP_200_OK)
                else:
                    # Ничего не меняется, возвращаем текущее состояние
                    serializer = AddUserActivitySerializer(activity)
                    return Response(serializer.data, status=status.HTTP_200_OK)
            
            # Обновляем существующую запись
            serializer = AddUserActivitySerializer(activity, data=data, partial=True)
            status_code = status.HTTP_200_OK
            
        except UserFilmActivitie.DoesNotExist:
            # Создаем новую запись
            serializer = AddUserActivitySerializer(data=data)
            status_code = status.HTTP_201_CREATED

        # Валидируем и сохраняем
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status_code)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request, film_id):
        """Частичное обновление дополнительных полей активности.

        Можно обновлять:
        - rating (оценка)
        - is_private (флаг приватности)
        - review (отзыв)
        - watched_date (дата просмотра)
        - И другие дополнительные поля, кроме is_planned и is_watched
        """
        film = get_object_or_404(Film, pk=film_id)
        activity = get_object_or_404(
            UserFilmActivitie,
            user=request.user,
            film=film
        )

        data = request.data.copy()

        # Запрещаем изменение основных статусов через PATCH
        if 'is_planned' in data or 'is_watched' in data:
            return Response(
                {'error': 'Используйте POST запрос для изменения статусов is_planned и is_watched'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Проверяем, что есть хотя бы одно поле для обновления
        if not data:
            return Response(
                {'error': 'Нет полей для обновления'},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = AddUserActivitySerializer(activity, data=data, partial=True)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, film_id):
        """Удалить активность (убрать из списков)"""
        film = get_object_or_404(Film, pk=film_id)
        activity = get_object_or_404(
            UserFilmActivitie,
            user=request.user,
            film=film
        )
        activity.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
