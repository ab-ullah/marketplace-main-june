import logging

from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone

from api.capital_calls.models import CapitalCall, CommitmentChoices, Distribution, Commitment
from api.companies.models import Company
from api.currencies.models import CurrencyRate, Currency
from api.funds.models import Fund, FundNav
from api.investors.models import FundInvestor, Investor
from api.notifications.models import UserNotification
from api.users.models import RetailUser

logger = logging.getLogger(__name__)

TEST_DATA = [
    {
        'investment': {

            'commitments': [
                {
                    'total_commitment': 300000,
                    'cash_commitment': 150000,
                    'offset_commitment': 0,
                    'loan_commitment': 150000,
                }
            ],

            'capital_calls': [
                {
                    'due_date': '2021-04-22',
                    'number': 1,
                    'capital_call_type': 'Organizational Expenses',
                    'deal_name': '',
                    'cash_called': 1278,
                    'loan_called': 1278,
                    'total_called': 2556,
                    'management_fee_amount': 0,
                },
                {
                    'due_date': '2021-04-22',
                    'number': 12,
                    'capital_call_type': 'Investment',
                    'deal_name': 'Alpha H',
                    'cash_called': 9094,
                    'total_called': 18188,
                    'loan_called': 9094,
                    'management_fee_amount': 0,
                },
                {
                    'due_date': '2021-04-22',
                    'number': 3,
                    'capital_call_type': 'Q2 2019 Management Fees',
                    'deal_name': '',
                    'cash_called': 394.55,
                    'total_called': 394.55,
                    'management_fee_amount': 0,
                    'loan_called': 0,
                },

            ],

            'distributions': [
                {
                    'due_date': '2021-06-30',
                    'number': 1,
                    'cash_returned': 1214,
                    'loan_returned': 1214,
                    'total_proceeds': 2428,
                    'recallable': 2500,
                    'deal_name': 'ILS',
                    'cash_loan_offset_gain': 0,
                    'due_for_gp_loan': 0
                },
                {
                    'due_date': '2021-06-30',
                    'number': 2,
                    'cash_returned': 15920,
                    'loan_returned': 15920,
                    'total_proceeds': 120632,
                    'cash_loan_offset_gain': 88792,
                    'due_for_gp_loan': 38118,
                    'recallable': 4800,
                    'deal_name': 'Simulation Software Holding Co Pty Ltd (Energy Exemplar)'
                },

            ],

        }
    }
]


class Command(BaseCommand):
    help = 'Create Dummy Investment Data for Alt Capital'

    def add_arguments(self, parser):
        parser.add_argument('email', type=str, action='store')
        parser.add_argument('fund_external_id', type=str, action='store')
        parser.add_argument('investor_account_code', type=str, action='store')
        parser.add_argument('company_name', type=str, action='store')

    def handle(self, *args, **options):
        company = Company.objects.get(name__iexact=options.get('company_name'))
        user_email = options.get('email')
        fund_external_id = options.get('fund_external_id')
        investor_account_code = options.get('investor_account_code')

        for data in TEST_DATA:
            with transaction.atomic():
                user = RetailUser.objects.get(email=user_email)
                company_user = user.associated_company_users.filter(company=company).first()
                fund = Fund.objects.get(external_id=fund_external_id)

                print(fund.name)
                investor = Investor.objects.get(investor_account_code=investor_account_code)

                FundInvestor.objects.filter(fund=fund, investor=investor).update(deleted=True)

                investment_data = data['investment']
                capital_calls = investment_data.pop('capital_calls')
                commitments = investment_data.pop('commitments', [])
                distributions = investment_data.pop('distributions')

                fund_investor, _ = FundInvestor.objects.update_or_create(
                    investor=investor,
                    fund=fund,
                    defaults={
                        'latest_transaction_date': timezone.now(),
                    }
                )
                fund_investor.called_to_date = 0
                fund_investor.loan_balance = 0
                fund_investor.total_distributions = 0
                fund_investor.management_fee = 0
                fund_investor.unfunded_capital_commitment = 0

                FundNav.objects.update_or_create(
                    company=fund.company,
                    fund=fund,
                    defaults={
                        'nav': 1000,
                        'as_of': timezone.now().date()
                    }
                )

                for capital_call_data in capital_calls:
                    capital_call, _ = CapitalCall.objects.get_or_create(
                        fund=fund,
                        company_user=company_user,
                        fund_investor=fund_investor,
                        company=company,
                        **capital_call_data
                    )
                    fund_investor.called_to_date += capital_call.total_called
                    fund_investor.loan_balance += capital_call.loan_called
                    fund_investor.cash_called += capital_call.cash_called
                    fund_investor.loan_called += capital_call.loan_called
                    fund_investor.management_fee += capital_call.management_fee_amount
                    fund_investor.unfunded_capital_commitment -= capital_call.total_called
                    fund_investor.unfunded_capital_commitment -= capital_call.management_fee_amount

                for distribution in distributions:
                    distribution, _ = Distribution.objects.get_or_create(
                        fund=fund,
                        company_user=company_user,
                        fund_investor=fund_investor,
                        company=company,
                        **distribution
                    )
                    fund_investor.loan_balance -= distribution.due_for_gp_loan
                    fund_investor.total_distributions += distribution.total_proceeds
                    recallable_amount = (
                            distribution.total_proceeds * distribution.recallable / 100
                    )
                    fund_investor.distributions_recallable += recallable_amount
                    fund_investor.unfunded_capital_commitment += recallable_amount

                for commitment in commitments:
                    commitment, _ = Commitment.objects.get_or_create(
                        company_user=company_user,
                        fund_investor=fund_investor,
                        company=company,
                        **commitment
                    )
                    fund_investor.unfunded_capital_commitment += commitment.total_commitment

                fund_investor.loan_balance = 2900
                fund_investor.save()

                logger.info(f"Successfully updated investment for {user_email}")
