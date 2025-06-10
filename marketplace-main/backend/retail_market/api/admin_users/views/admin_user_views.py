from rest_framework.generics import ListAPIView, RetrieveUpdateAPIView, RetrieveAPIView
from django.shortcuts import get_object_or_404

from api.admin_users.models import AdminUser
from api.admin_users.serializers import AdminUserSerializer
from api.companies.serializers import CompanyInfoSerializer
from api.mixins.admin_view_mixin import AdminViewMixin
from api.permissions.is_full_access_admin import IsFullAccessAdmin
from api.permissions.is_sidecar_admin_permission import IsSidecarAdminUser


class AdminUserListAPIView(AdminViewMixin, ListAPIView):
    permission_classes = (IsSidecarAdminUser, IsFullAccessAdmin)
    serializer_class = AdminUserSerializer

    def get_queryset(self):
        return AdminUser.objects.filter(company=self.company)


class AdminUserRetrieveUpdateAPIView(AdminViewMixin, RetrieveUpdateAPIView):
    permission_classes = (IsSidecarAdminUser, IsFullAccessAdmin)
    serializer_class = AdminUserSerializer

    def get_queryset(self):
        return AdminUser.objects.filter(company=self.company)


class CompanyAdminUserListAPIView(AdminViewMixin, ListAPIView):
    permission_classes = (IsSidecarAdminUser,)
    serializer_class = AdminUserSerializer

    def get_queryset(self):
        return AdminUser.objects.filter(company=self.company).prefetch_related(
            'groups',
            'groups__permissions'
        ).select_related(
            'user',
        )


class CompanyInfoRetrieveAPIView(AdminViewMixin, RetrieveAPIView):
    permission_classes = (IsSidecarAdminUser,)
    serializer_class = CompanyInfoSerializer

    def get_object(self):
        return self.company


class AdminUserDetailAPIView(AdminViewMixin, RetrieveAPIView):
    serializer_class = AdminUserSerializer

    def get_queryset(self):
        return AdminUser.objects.filter(company=self.company)

    def get_object(self):
        return self.admin_user


class AdminInfoRetrieveAPIView(AdminViewMixin, RetrieveAPIView):
    serializer_class = AdminUserSerializer

    def get_object(self):
        user = get_object_or_404(
            AdminUser,
            company=self.company,
            user=self.request.user
        )
        return user
