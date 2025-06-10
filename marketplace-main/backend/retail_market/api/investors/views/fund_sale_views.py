from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView

from api.investors.models import FundOrder, FundSale
from api.investors.serializers import FundOrderSerializer, FundSaleSerializer
from api.mixins.company_user_mixin import CompanyUserViewMixin


class FundSaleListCreateAPIView(CompanyUserViewMixin, ListCreateAPIView):
    serializer_class = FundSaleSerializer
    queryset = FundSale.objects.all()

    def get_queryset(self):
        company_user = self.get_company_user
        return FundSale.objects.filter(sold_by=company_user.investor_profile, fund__company=self.company)


class FundSaleRetrieveUpdateDeleteAPIView(CompanyUserViewMixin, RetrieveUpdateDestroyAPIView):
    serializer_class = FundSaleSerializer
    queryset = FundSale.objects.all()

    def get_queryset(self):
        company_user = self.get_company_user
        return FundSale.objects.filter(sold_by=company_user.investor_profile, fund__company=self.company)
