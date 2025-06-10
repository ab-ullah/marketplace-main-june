from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView

from api.investors.models import FundOrder
from api.investors.serializers import FundOrderSerializer
from api.mixins.company_user_mixin import CompanyUserViewMixin


class FundOrderListCreateAPIView(CompanyUserViewMixin, ListCreateAPIView):
    serializer_class = FundOrderSerializer
    queryset = FundOrder.objects.all()

    def get_queryset(self):
        return FundOrder.objects.filter(fund__company=self.company)


class FundOrderRetrieveUpdateDeleteAPIView(CompanyUserViewMixin, RetrieveUpdateDestroyAPIView):
    serializer_class = FundOrderSerializer
    queryset = FundOrder.objects.all()

    def get_queryset(self):
        return FundOrder.objects.filter(fund__company=self.company)
