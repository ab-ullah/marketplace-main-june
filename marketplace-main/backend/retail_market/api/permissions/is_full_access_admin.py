from rest_framework.permissions import BasePermission


class IsFullAccessAdmin(BasePermission):
    def has_permission(self, request, view):
        user = request.user
        return user.has_full_access()
