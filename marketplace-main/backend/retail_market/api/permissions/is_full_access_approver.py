from rest_framework.permissions import BasePermission

from api.users.constants import APPROVER_GROUP_NAME


class IsFullAccessApprover(BasePermission):
    def has_permission(self, request, view):
        user = request.user
        return user.groups.filter(
            name=APPROVER_GROUP_NAME
        ).exists()