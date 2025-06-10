from rest_framework.generics import ListAPIView
from rest_framework.response import Response
from rest_framework.views import APIView

from api.carry_pools.services.investor_carry_documents import InvestorCarryDocumentService
from api.investors.models import Investor, FundInvestor, InvestorAdvisor
from api.investors.serializers import InvestorProfileBaseSerializer, InvestorAdvisorListSerializer
from api.investors.services.calculate_invested_funds import InvestedFundsService
from api.mixins.company_user_mixin import CompanyUserViewMixin


class InvestorDetailAPIView(CompanyUserViewMixin, APIView):
    def get(self, request, *args, **kwargs):
        response_data = {
            **InvestedFundsService(
                company_user_ids=self.company_user_ids,
                show_unpublished_funds=self.show_unpublished_funds,
                start_date=request.query_params.get('start_date'),
                end_date=request.query_params.get('end_date')
            ).compile()
        }
        return Response(response_data)


class InvestorProfilesListAPIView(CompanyUserViewMixin, ListAPIView):
    serializer_class = InvestorProfileBaseSerializer

    def get_queryset(self):
        return Investor.objects.filter(id__in=self.investor_ids)


class InvestedFundCount(CompanyUserViewMixin, APIView):
    def get(self, request):
        invested_count = FundInvestor.objects.filter(
            fund__publish_investment_details=True,
            investor__associated_users__company_user_id__in=self.company_user_ids
        ).count()
        return Response({'invested_count': invested_count})


class InvestorCarryDocumentsAPIView(CompanyUserViewMixin, APIView):
    def get(self, request, *args, **kwargs):
        response_data = InvestorCarryDocumentService(
                companies=self.companies,
                company_users=self.company_users,
                released_filter=True
            ).compile()

        return Response(response_data)


class InvestorAdvisorsListAPIView(CompanyUserViewMixin, ListAPIView):
    serializer_class = InvestorAdvisorListSerializer

    def get_queryset(self):
        return InvestorAdvisor.objects.filter(
            advisor__in=list(self.request.user.associated_company_users.all())
        ).select_related('investor__user')


class InvestorAvailableCurrenciesView(CompanyUserViewMixin, APIView):
    def get(self, request, *args, **kwargs):
        user = self.data_user
        company_users = self.company_users
        company_user = company_users[0]
        company = company_user.company
        currencies = {}

        if company.base_currency:
            currencies['company_currency'] = {
                'code': company.base_currency.code,
                'symbol': company.base_currency.symbol
            }

        employment_record = user.employment_record()
        if employment_record and employment_record.currency:
            currencies['investor_local_currency'] = {
                'code': employment_record.currency.code,
                'symbol': employment_record.currency.symbol
            }

        return Response(currencies)

