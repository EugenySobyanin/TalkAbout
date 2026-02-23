from django.shortcuts import render
from rest_framework import viewsets

from .models import Compilation
from .serializers import CompilationSerializer


class CompilationViewSet(viewsets.ModelViewSet):

    queryset = Compilation.objects.all()
    serializer_class = CompilationSerializer
