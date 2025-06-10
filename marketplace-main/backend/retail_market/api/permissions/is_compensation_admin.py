from rest_framework.permissions import BasePermission


class IsCompensationAccessAdmin(BasePermission):
    def has_permission(self, request, view):
        user = request.user
        return user.has_compensation_access()
