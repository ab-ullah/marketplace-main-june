from rest_framework.permissions import BasePermission


class IsSidecarAdminUser(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and hasattr(request.user, 'admin_user')
