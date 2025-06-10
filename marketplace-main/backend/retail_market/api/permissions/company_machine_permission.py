from rest_framework.permissions import BasePermission


class IsCompanyMachine(BasePermission):
    def has_permission(self, request, view):
        return hasattr(request, 'company') and request.company
