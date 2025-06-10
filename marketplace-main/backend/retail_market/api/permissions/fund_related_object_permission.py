from rest_framework import permissions


class IsSameCompanyUserAsFund(permissions.BasePermission):

    def has_object_permission(self, request, view, obj):
        if not hasattr(request.user, 'admin_user'):
            return False

        return obj.fund.company_id == request.user.admin_user.company_id
