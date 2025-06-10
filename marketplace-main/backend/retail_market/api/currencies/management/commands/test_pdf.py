import logging

from django.core.management.base import BaseCommand
from django.utils import timezone

from api.activities.tests.factories import FundActivityFactory, LoanActivityFactory
from api.companies.models import CompanyUser
from api.funds.models import Fund, FundNav
from api.investors.models import Investor, CompanyUserInvestor
from api.partners.tests.factories import FundFactory

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = 'Create Currency conversion'

    def handle(self, *args, **options):
        # company_user = CompanyUser.objects.get(id=4)
        # Investor.objects.create(
        #  company_user=company_user,
        #  name='Adam Investment'
        # )
        # for investor in Investor.objects.all():
        #     CompanyUserInvestor.objects.create(
        #         investor=investor,
        #         company_user=investor.company_user
        #     )

        # investor = Investor.objects.get(id=1)
        # company_user = CompanyUser.objects.get(id=1)

        fund = Fund.objects.latest('created_at')
        FundNav.objects.create(
            company=fund.company,
            fund=fund,
            nav=1000,
            as_of=timezone.now().date()
        )

        # fund = FundFactory(company=company_user.company)
        #
        # fund_activity = FundActivityFactory(
        #     company=company_user.company,
        #     investor_id=investor.partner_id,
        #     investor_code=investor.name,
        #     investor_name=investor.name,
        #     investment_code=fund.symbol,
        #     investment_name=fund.name
        # )
        #
        # loan_activity = LoanActivityFactory(
        #     company=company_user.company,
        #     investor_id=investor.partner_id,
        #     investment_code=fund.symbol,
        #     currency='USD'
        # )
