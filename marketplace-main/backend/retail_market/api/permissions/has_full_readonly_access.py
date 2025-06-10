from rest_framework.permissions import BasePermission

from api.users.constants import READONLY_GROUP_NAME


class HasFullReadonlyAccess(BasePermission):
    def has_permission(self, request, view):
        user = request.user
        return user.groups.filter(
            name=READONLY_GROUP_NAME
        ).exists()
