from typing import List

from api.admin_users.models import AdminUser
from api.companies.models import Company
from api.permissions.is_sidecar_admin_permission import IsSidecarAdminUser


class AdminViewMixin:
    permission_classes = (IsSidecarAdminUser,)

    @property
    def admin_user(self) -> AdminUser:
        return self.request.user.admin_user

    @property
    def company(self) -> Company:
        return self.admin_user.company

    @property
    def company_ids(self) -> List[int]:
        return [self.company.id]

    def get_queryset(self):
        qs = super().get_queryset()
        qs = qs.filter(company=self.company)
        return qs

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['admin_user'] = self.admin_user
        context['company'] = self.company
        return context
