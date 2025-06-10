from django.db.models import Prefetch
from rest_framework.generics import ListCreateAPIView, UpdateAPIView, ListAPIView

from api.companies.models import CompanyUser
from api.investors.models import CompanyUserInvestor
from api.mixins.admin_view_mixin import AdminViewMixin
from api.permissions.is_full_access_admin import IsFullAccessAdmin
from api.permissions.is_sidecar_admin_permission import IsSidecarAdminUser
from api.users.selectors.users_in_company_selector import get_all_users_in_company, get_users_in_company
from api.users.serializers import UserInviteSerializer, RetailUserSerializer


class UsersInviteListCreateAPIView(AdminViewMixin, ListCreateAPIView):
    permission_classes = (IsSidecarAdminUser, IsFullAccessAdmin)
    serializer_class = UserInviteSerializer

    def get_queryset(self):
        return get_all_users_in_company(company=self.company)


class UsersInviteUpdateAPIView(AdminViewMixin, UpdateAPIView):
    permission_classes = (IsSidecarAdminUser, IsFullAccessAdmin)
    serializer_class = RetailUserSerializer

    def get_queryset(self):
        return get_all_users_in_company(company=self.company)


class ParticipantsListAPIView(AdminViewMixin, ListAPIView):
    permission_classes = (IsSidecarAdminUser, IsFullAccessAdmin)
    serializer_class = UserInviteSerializer

    def get_queryset(self):
        company_user_investors_prefetch = Prefetch("associated_investor_profiles", CompanyUserInvestor.objects.select_related("investor"))
        company_user_prefetch = Prefetch("associated_company_users", CompanyUser.objects.prefetch_related(company_user_investors_prefetch))
        return get_users_in_company(company=self.company).prefetch_related(company_user_prefetch)
