from django.db.models import Prefetch
from rest_framework.generics import ListAPIView

from api.companies.models import CompanyUser
from api.funds.models import Fund
from api.investors.models import FundInvestor, FundOrder
from api.investors.serializers import OpportunitySerializer
from api.investors.services.user_opportunities import UserOpportunitiesService
from api.kyc_records.models import KYCRecord
from api.mixins.company_user_mixin import CompanyUserViewMixin


class OpportunitiesListAPIView(CompanyUserViewMixin, ListAPIView):
    # TODO: We should be able to remove this View
    queryset = Fund.objects.all()
    serializer_class = OpportunitySerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        company_user = self.get_company_user  # type: CompanyUser
        investor_ids = list(company_user.associated_investor_profiles.values_list('investor_id', flat=True))
        queryset = queryset.prefetch_related(
            Prefetch('fund_investors', queryset=FundInvestor.objects.filter(investor_id__in=investor_ids))
        )
        queryset = queryset.prefetch_related(
            Prefetch(
                'fund_orders',
                queryset=FundOrder.objects.filter(investor_id__in=investor_ids).order_by('-created_at')
            )
        ).select_related('company').select_related('fund_currency')

        opportunities_service = UserOpportunitiesService(investor_ids=investor_ids)
        applications_map = opportunities_service.get_applications_map_for_user(user=self.request.user)
        if funds_to_exclude := opportunities_service.get_funds_to_exclude_by_applications(queryset, applications_map):
            queryset = queryset.exclude(id__in=funds_to_exclude)

        return queryset.order_by('-created_at')

