from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView, ListAPIView

from api.feature_flags.provider import FeatureFlagProvider
from api.investors.constants import INVESTMENT_HISTORIC_DATA
from api.investors.models import FundInvestor
from api.investors.serializers import FundInvestorSerializer
from api.mixins.company_user_mixin import CompanyUserViewMixin


class FundInvestorListCreateAPIView(CompanyUserViewMixin, ListCreateAPIView):
    serializer_class = FundInvestorSerializer
    queryset = FundInvestor.objects.all()


class FundInvestorRetrieveUpdateDeleteAPIView(CompanyUserViewMixin, RetrieveUpdateDestroyAPIView):
    serializer_class = FundInvestorSerializer
    queryset = FundInvestor.objects.all()

    def get_queryset(self):
        company_user = self.get_company_user
        return FundInvestor.objects.filter(investor__company_user=company_user, fund__company=self.company)


class FundInvestorsListAPIView(CompanyUserViewMixin, ListAPIView):
    serializer_class = FundInvestorSerializer

    def get_queryset(self):
        provider = FeatureFlagProvider.from_params(company_ids=self.company_ids)
        feature_flag = provider.is_active(INVESTMENT_HISTORIC_DATA)
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')

        queryset = FundInvestor.objects.filter(
            investor_id__in=self.investor_ids,
            fund__external_id=self.kwargs['fund_external_id']
        ).order_by('-latest_transaction_date')

        if start_date and end_date:
            queryset = queryset.filter(
                latest_transaction_date__range=[start_date, end_date]
            )

        if not self.show_unpublished_funds:
            queryset = queryset.filter(fund__publish_investment_details=True)

        if not feature_flag:
            queryset = queryset[:1]

        return queryset.select_related('fund').prefetch_related('investor_capital_calls').prefetch_related(
            'investor_distributions').prefetch_related('investor_commitments').select_related(
            'fund__fund_currency').select_related('investor')
