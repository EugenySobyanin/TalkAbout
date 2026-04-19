from django.contrib.auth import get_user_model
from django.db.models import Prefetch
from rest_framework import generics, permissions

from activities.models import UserFilmActivity
from compilations.models import Compilation
from blog.models import PhotoUser, Follow
from api.serializers.profile import UserProfileSerializer

User = get_user_model()


class UserProfileView(generics.RetrieveAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.AllowAny]
    lookup_url_kwarg = 'user_id'

    def get_queryset(self):
        return User.objects.prefetch_related(
            Prefetch(
                'activities',
                queryset=UserFilmActivity.objects.select_related('film').order_by('-updated_at')
            ),
            Prefetch(
                'collections',
                queryset=Compilation.objects.prefetch_related('films').order_by('-created_at')
            ),
            Prefetch(
                'user_photos',
                queryset=PhotoUser.objects.order_by('-uploaded_at')
            ),
            Prefetch(
                'user_subscriptions',
                queryset=Follow.objects.select_related('following')
            ),
            Prefetch(
                'user_subscribers',
                queryset=Follow.objects.select_related('follower')
            ),
        )


class MeProfileView(generics.RetrieveAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return User.objects.prefetch_related(
            Prefetch(
                'activities',
                queryset=UserFilmActivity.objects.select_related('film').order_by('-updated_at')
            ),
            Prefetch(
                'collections',
                queryset=Compilation.objects.prefetch_related('films').order_by('-created_at')
            ),
            Prefetch(
                'user_photos',
                queryset=PhotoUser.objects.order_by('-uploaded_at')
            ),
            Prefetch(
                'user_subscriptions',
                queryset=Follow.objects.select_related('following')
            ),
            Prefetch(
                'user_subscribers',
                queryset=Follow.objects.select_related('follower')
            ),
        ).get(pk=self.request.user.pk)