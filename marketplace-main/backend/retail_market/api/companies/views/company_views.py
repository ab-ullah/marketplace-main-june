from rest_framework.generics import RetrieveAPIView, ListAPIView, get_object_or_404

from api.companies.models import Company, CompanyFundVehicle, CompanyTheme
from api.companies.serializers import CompanySerializer, FundVehicleSerializer, CompanyThemeSerializer
from api.funds.models import Fund
from api.mixins.company_user_mixin import CompanyUserViewMixin
from api.permissions.is_sidecar_admin_permission import IsSidecarAdminUser
from api.mixins.admin_view_mixin import AdminViewMixin


class CompanyListAPIView(ListAPIView):
    permission_classes = (IsSidecarAdminUser,)
    serializer_class = CompanySerializer
    queryset = Company.objects.all()


class CompanyRetrieveAPIView(CompanyUserViewMixin, RetrieveAPIView):
    serializer_class = CompanySerializer
    lookup_url_kwarg = 'slug'
    lookup_field = 'slug'

    def get_queryset(self):
        return Company.objects.filter(id__in=self.company_ids)


class CompanyThemeRetrieveAPIView(RetrieveAPIView):
    serializer_class = CompanyThemeSerializer
    permission_classes = ()

    def get_object(self):
        return get_object_or_404(
            CompanyTheme.objects.select_related('company'),
            company__slug=self.kwargs['company_slug']
        )


class CompanyByFundSlugRetrieveAPIView(CompanyUserViewMixin, RetrieveAPIView):
    serializer_class = CompanySerializer
    lookup_url_kwarg = 'fund_external_id'
    lookup_field = 'external_id'

    def get_object(self):
        fund = get_object_or_404(
            Fund,
            company_id__in=self.company_ids,
            external_id=self.kwargs['fund_external_id']
        )
        return fund.company


class CompanyVehicleListView(AdminViewMixin, ListAPIView):
    permission_classes = (IsSidecarAdminUser,)
    serializer_class = FundVehicleSerializer

    def get_queryset(self):
        return CompanyFundVehicle.objects.filter(
            company=self.company
        )
