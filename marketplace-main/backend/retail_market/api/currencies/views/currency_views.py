from rest_framework.generics import ListAPIView, get_object_or_404

from api.currencies.models import Currency
from api.currencies.serializers import CurrencySerializer
from api.funds.models import Fund
from api.mixins.company_user_mixin import CompanyUserViewMixin


class CompanyCurrencyListAPIView(CompanyUserViewMixin, ListAPIView):
    serializer_class = CurrencySerializer
    queryset = Currency.objects.all()


class FundCurrencyListAPIView(CompanyUserViewMixin, ListAPIView):
    serializer_class = CurrencySerializer

    def get_queryset(self):
        fund = get_object_or_404(
            Fund,
            external_id=self.kwargs['fund_external_id'],
            company_id__in=self.company_ids
        )
        return Currency.objects.filter(company=fund.company)
