from rest_framework import serializers
from django.contrib.auth import get_user_model

from activities.models import UserFilmActivitie
from gallery.models import Film
from .models import Compilation


class CompilationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Compilation
        fields = ['user', 'title', 'descripiton', 'films']
