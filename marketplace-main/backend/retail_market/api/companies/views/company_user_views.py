from rest_framework.generics import ListAPIView, get_object_or_404, RetrieveUpdateAPIView

from api.companies.models import CompanyUser
from api.companies.serializers import CompanyUserSelectorSerializer, CompanyUserPowerOfAttorneySerializer
from api.funds.models import Fund
from api.mixins.admin_view_mixin import AdminViewMixin
from api.mixins.company_user_mixin import CompanyUserViewMixin
from api.permissions.is_sidecar_admin_permission import IsSidecarAdminUser


class CompanyUsersListView(AdminViewMixin, ListAPIView):
    permission_classes = (IsSidecarAdminUser,)
    serializer_class = CompanyUserSelectorSerializer
    queryset = CompanyUser.objects.all()


class CompanyUserPowerOfAttorneyCreateView(CompanyUserViewMixin, RetrieveUpdateAPIView):
    serializer_class = CompanyUserPowerOfAttorneySerializer

    def get_object(self):
        fund = get_object_or_404(
            Fund,
            external_id=self.kwargs['fund_external_id'],
            company_id__in=self.company_ids,
        )
        company = fund.company
        company_user = get_object_or_404(
            CompanyUser,
            company=company,
            user=self.request.user,
        )
        return company_user
