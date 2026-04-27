from django.contrib.auth import get_user_model
from django.db.models import Prefetch
from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

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


class FollowUserView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, user_id):
        following_user = get_object_or_404(User, pk=user_id)

        if following_user.pk == request.user.pk:
            return Response(
                {'detail': 'Нельзя подписаться на самого себя.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        follow, created = Follow.objects.get_or_create(
            follower=request.user,
            following=following_user
        )

        return Response(
            {
                'is_subscribed': True,
                'created': created,
                'subscribers_count': following_user.user_subscribers.count(),
                'subscriptions_count': request.user.user_subscriptions.count(),
            },
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK
        )

    def delete(self, request, user_id):
        following_user = get_object_or_404(User, pk=user_id)

        deleted_count, _ = Follow.objects.filter(
            follower=request.user,
            following=following_user
        ).delete()

        return Response(
            {
                'is_subscribed': False,
                'deleted': deleted_count > 0,
                'subscribers_count': following_user.user_subscribers.count(),
                'subscriptions_count': request.user.user_subscriptions.count(),
            },
            status=status.HTTP_200_OK
        )
