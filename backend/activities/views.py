from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from rest_framework import viewsets

from activities.models import UserFilmActivitie, HistoryWatching
from activities.serializers import AddUserActivitieSerializer
from gallery.models import Film

class UserActivitieViewSet(viewsets.ModelViewSet):
    """Вьюсет для 'Просмотренных' и 'Планируемых'."""


# @api_view(['POST', 'GET'])
# def add_user_activitie(request, film_id):
#     if request.method == 'POST':
#         film = get_object_or_404(Film, pk=film_id)
#         data = request.data.copy()
#         data['user'] = request.user.pk
#         data['film'] = film.pk
#         user_activitie = UserFilmActivitie.objects.filter(user=request.user.pk, film=film.pk).first()

#         # Добавить в "Планируемые"
#         if 'is_planned' in data and 'is_watched' not in data:

#             # Если у пользователя нет запписи UserActivitie с этим фильмом
#             if not user_activitie:
#                 serializer = AddUserActivitieSerializer(data=data)

#                 if serializer.is_valid():
#                     serializer.save()
#                     return Response(serializer.data, status=status.HTTP_201_CREATED)
#                 else:
#                     return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

#             # Когда запись UserActivitie уже есть с этим фильмом
#             else:
#                 # Если фильм уже находится в "Планируемых"
#                 if user_activitie.is_planned:
#                     return Response({'error': 'Фильм уже добавлен в "Планируемые".'})
#                 else:
#                     serializer = AddUserActivitieSerializer(user_activitie, data=data, partial=True)
#                     if serializer.is_valid():
#                         serializer.save()
#                         return Response(serializer.data, status=status.HTTP_201_CREATED)
#                     else:
#                         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

#         # Добавить в "Просмотренные"
#         elif 'is_watched' in data and 'is_planned' not in data:
#             print('Попадаем в добавление просмотренного')
#             # Если у пользователя нет записи UserActivitie c этим фильмом
#             if not user_activitie:
#                 serializer = AddUserActivitieSerializer(data=data)

#                 if serializer.is_valid():
#                     serializer.save()
#                     return Response(serializer.data, status=status.HTTP_201_CREATED)
#                 else:
#                     return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
#             # Когда запись UserActivitie уже есть с этим фильмом
#             else:
#                 print('Попадаем в обновление UserActivitie')
#                 # Здесь нужно создавать запись в HistoryWatching
#                 if not user_activitie.is_watched:
#                     print('Ситуация, когда is_watched = false')
#                     print(data)
#                     serializer = AddUserActivitieSerializer(user_activitie, data=data, partial=True)
#                     if serializer.is_valid():
#                         serializer.save()
#                         return Response(serializer.data, status=status.HTTP_201_CREATED)
#                     else:
#                         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
#                 else:
#                     # history_watch = HistoryWatching.
#                     return Response({'упс': 'Обработка добавления повторного просмотра еще не настроена.'}, status=status.HTTP_200_OK)


#         else:
#             return Response({'error': 'Некорректный запрос'}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST', 'GET'])
def add_user_activitie(request, film_id):
    if request.method == 'POST':
        film = get_object_or_404(Film, pk=film_id)
        data = request.data.copy()
        data['user'] = request.user.pk
        data['film'] = film.pk
        user_activitie = UserFilmActivitie.objects.filter(user=request.user.pk, film=film.pk).first()

        # Нельзя добавлять фильм в "Планируемые" и в "Просмотренные" одним запросом.
        if 'is_planned' in data and 'is_watched' in data:
            return Response({'error': 'Нельзя одним запросом добавлять в "Планируемые" и в "Просмотренные".'}, status=status.HTTP_400_BAD_REQUEST)


        # Если у пользователя нет запписи UserActivitie с этим фильмом
        if not user_activitie:
            serializer = AddUserActivitieSerializer(data=data)

            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            else:
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        # Когда запись UserActivitie существует
        else:
            if user_activitie.is_planned and 'is_planned' in data:
                return Response({'error': 'Фильм уже добавлен в "Планируемые".'})
            else:
                serializer = AddUserActivitieSerializer(user_activitie, data=data, partial=True)
                if serializer.is_valid():
                    serializer.save()
                    return Response(serializer.data, status=status.HTTP_201_CREATED)
                else:
                    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
