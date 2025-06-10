from rest_framework.generics import ListAPIView

from api.companies.models import CompanyUser
from api.companies.serializers import CompanyUserSelectorSerializer
from api.investors.models import FundInvestor, CompanyUserInvestor
from api.investors.models import Investor
from api.investors.serializers import InvestorUserSerializer
from api.mixins.admin_view_mixin import AdminViewMixin
from api.notices.models import TransactionalConsideration, ValuationConsideration


class InvestorUsersListAPIView(AdminViewMixin, ListAPIView):
    serializer_class = CompanyUserSelectorSerializer

    def get_queryset(self):
        company_id = self.company.id
        investor_ids = FundInvestor.objects.filter(
            fund__company_id=company_id
        ).values_list('investor_id', flat=True)
        investor_ids = list(investor_ids)
        company_user_ids = CompanyUserInvestor.objects.filter(
            investor_id__in=investor_ids
        ).values_list('company_user_id', flat=True)

        return CompanyUser.objects.filter(
            id__in=list(company_user_ids), company=self.company
        ).select_related('user')


class ConsiderationsInvestorUsersListAPIView(AdminViewMixin, ListAPIView):
    serializer_class = CompanyUserSelectorSerializer

    def get_queryset(self):
        investor_ids = []
        transactional_investors = list(
            TransactionalConsideration.objects.filter(
                company=self.company,
            ).values_list('investor_id', flat=True)
        )
        investor_ids.extend(transactional_investors)

        valuation_investors = list(
            ValuationConsideration.objects.filter(
                company=self.company,
            ).values_list('investor_id', flat=True)
        )
        investor_ids.extend(valuation_investors)
        company_user_ids = CompanyUserInvestor.objects.filter(
            investor_id__in=investor_ids
        ).values_list('company_user_id', flat=True)

        return CompanyUser.objects.filter(
            id__in=list(company_user_ids), company=self.company
        ).select_related('user')


class InvestorsListAPIView(AdminViewMixin, ListAPIView):
    serializer_class = InvestorUserSerializer

    def get_queryset(self):
        company_id = self.company.id
        investor_ids = CompanyUserInvestor.objects.filter(
            company_user__company_id=company_id,
            company_user__user__deleted=False
        ).values_list('investor_id', flat=True)
        investor_ids = set(investor_ids)
        return Investor.objects.filter(
            id__in=list(investor_ids)
        )
