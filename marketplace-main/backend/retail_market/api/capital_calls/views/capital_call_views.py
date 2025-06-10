from rest_framework import status
from rest_framework.generics import RetrieveAPIView
from rest_framework.response import Response
from rest_framework.views import APIView

from api.capital_calls.models import CapitalCall
from api.funds.models import Fund
from api.capital_calls.serializers import CapitalCallSerializer
from api.investors.models import FundInvestor
from api.mixins.company_user_mixin import CompanyUserViewMixin


class CapitalCallCreateAPIView(CompanyUserViewMixin, APIView):
    serializer_class = CapitalCallSerializer
    queryset = CapitalCall.objects.all()

    def post(self, request, *args, **kwargs):
        data = request.data
        fund_id = data.get('fund')
        fund_investors = FundInvestor.objects.filter(fund_id=fund_id)
        data['company'] = self.company.id
        fund = Fund.objects.get(id=fund_id)
        data['fund_name'] = fund.name
        company_user = self.get_company_user
        data['company_user'] = company_user.id
        for investor in fund_investors:
            data['fund_investor'] = investor.id
            serializer = CapitalCallSerializer(data=data)
            serializer.is_valid(raise_exception=True)
            serializer.save()
        return Response({'status': 'success'}, status=status.HTTP_201_CREATED)


class CapitalCallRetrieveAPIView(CompanyUserViewMixin, RetrieveAPIView):
    serializer_class = CapitalCallSerializer
    queryset = CapitalCall.objects.all()
    lookup_field = 'uuid'
    lookup_url_kwarg = 'uuid'
