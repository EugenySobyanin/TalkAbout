from rest_framework.permissions import BasePermission, SAFE_METHODS


class FilmsPermissions(BasePermission):
    """
    Права доступа для фильмов.

    - GET, HEAD, OPTIONS: доступны всем (включая неавторизованных)
    - POST, PUT, PATCH, DELETE: только админам и модераторам
    """

    message = 'Только администраторы и модераторы могут изменять контент.'

    def has_permission(self, request, view):
        # Безопасные методы доступны всем
        if request.method in SAFE_METHODS:
            return True

        # Для остальных методов проверяем права
        return (
            request.user.is_authenticated and
            (request.user.is_admin or request.user.is_moderator)
        )

    def has_object_permission(self, request, view, obj):
        # Аналогичная логика для конкретного объекта
        if request.method in SAFE_METHODS:
            return True

        return (
            request.user.is_authenticated and
            (request.user.is_admin or request.user.is_moderator)
        )
