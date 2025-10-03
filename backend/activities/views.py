from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from rest_framework import viewsets

from activities.models import UserFilmActivitie
from activities.serializers import UserActivitieSerializer
from gallery.models import Film

class UserActivitieViewSet(viewsets.ModelViewSet):
    """Вьюсет для 'Просмотренных' и 'Планируемых'."""


@api_view(['POST', 'GET'])
def add_user_activitie(request, film_id):
    if request.method == 'POST':
        film = get_object_or_404(Film, pk=film_id)
        data = request.data.copy()
        print(data)
        data['user'] = request.user.pk
        data['film'] = film.pk

        serializer = UserActivitieSerializer(data=data)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)