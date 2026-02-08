from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from rest_framework import viewsets

from activities.models import UserFilmActivitie, HistoryWatching
from activities.serializers import AddUserActivitieSerializer
from gallery.models import Film


User = get_user_model()


# class UserActivitieViewSet(viewsets.ModelViewSet):
#     """Вьюсет для 'Просмотренных' и 'Планируемых'."""


# @api_view(['POST', 'GET'])
# def add_user_activitie(request, film_id):
#     if request.method == 'POST':
#         film = get_object_or_404(Film, pk=film_id)
#         data = request.data.copy()
#         data['user'] = request.user.pk
#         data['film'] = film.pk

#         user_activitie = UserFilmActivitie.objects.filter(
#             user=request.user, film=film
#         ).first()

#         # Нельзя добавлять фильм в "Планируемые" и в "Просмотренные" одним запросом. ___________ Нужно ли вообще это ограничение?
#         if 'is_planned' in data and 'is_watched' in data:
#             return Response(
#                 {'error': 'Нельзя одним запросом добавлять '
#                  'в "Планируемые" и в "Просмотренные".'},
#                 status=status.HTTP_400_BAD_REQUEST
#             )

#         # Если у пользователя нет записи UserActivitie с этим фильмом
#         if not user_activitie:
#             serializer = AddUserActivitieSerializer(data=data)

#             if serializer.is_valid():
#                 serializer.save()
#                 return Response(serializer.data,
#                                 status=status.HTTP_201_CREATED)
#             else:
#                 return Response(serializer.errors,
#                                 status=status.HTTP_400_BAD_REQUEST)

#         # Когда запись UserActivitie существует
#         else:
#             if user_activitie.is_planned and 'is_planned' in data:
#                 return Response({'error': 'Фильм уже добавлен в "Планируемые".'})  # ___________________________Нужно ли вообще это ограничение? Ну если отпавляется запрос еще раз, ну и пусть отправляется
#             else:
#                 serializer = AddUserActivitieSerializer(user_activitie, data=data, partial=True)
#                 if serializer.is_valid():
#                     serializer.save()
#                     return Response(serializer.data, status=status.HTTP_201_CREATED)
#                 else:
#                     return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
                
#     # # Когда GET запрос_________Зачем нам здесь вообще GET запрос???????
#     # else:
#     #     if not user_id:  # Если user_id пуст, значит надо вернуть список фильмов текущего пользователя
#     #         user_activities = UserFilmActivitie.objects.filter(user=request.user)
#     #         serializer = AddUserActivitieSerializer(user_activities, many=True)
#     #         if serializer.is_valid():
#     #             serializer.save()
#     #             return Response(serializer.data, status=status.HTTP_200_OK)
#     #         else:
#     #             return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# @api_view(['GET'])
# def get_user_activities(request, user_id=None, ):
#     pass


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

        serializer = AddUserActivitieSerializer(queryset, many=True)
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
                    serializer = AddUserActivitieSerializer(
                        activity, 
                        data=data, 
                        partial=True
                    )
                    if serializer.is_valid():
                        serializer.save()
                        return Response(serializer.data, status=status.HTTP_200_OK)
                else:
                    # Ничего не меняется, возвращаем текущее состояние
                    serializer = AddUserActivitieSerializer(activity)
                    return Response(serializer.data, status=status.HTTP_200_OK)
            
            # Обновляем существующую запись
            serializer = AddUserActivitieSerializer(activity, data=data, partial=True)
            status_code = status.HTTP_200_OK
            
        except UserFilmActivitie.DoesNotExist:
            # Создаем новую запись
            serializer = AddUserActivitieSerializer(data=data)
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

        serializer = AddUserActivitieSerializer(activity, data=data, partial=True)

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
