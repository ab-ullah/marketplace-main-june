import factory
from django.utils import timezone
from faker import Faker

from api.activities.models import FundActivity, LoanActivity
from api.partners.tests.factories import CompanyFactory

fake = Faker()


class FundActivityFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = FundActivity

    company = factory.SubFactory(CompanyFactory)
    transaction_date = timezone.now()
    equity_commitment = 7000
    equity_called_to_date = 3000
    commitment_amount = 9000
    outstanding_commitment = 4000
    income_distributions = 500
    leveraged_irr = 40
    unleveraged_irr = 60
    current_leverage_rate = 25
    initial_leverage_rate = 20
    current_interest_rate = 12
    fund_ownership = 1550
    capital_called_since_last_nav = 2000
    distributions_since_last_nav = 2000
    distributions_since_inception = 0
    distributions_used_for_loan = 0
    distributions_used_for_interest = 0
    distributions_recallable = 0
    distributions_to_employee = 0
    return_of_capital = 5000
    profit_distributions = 4000
    unrealized_gain_loss = 1000
    called_to_date = 2000
    gain_loss = 4000


class LoanActivityFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = LoanActivity

    company = factory.SubFactory(CompanyFactory)
    transaction_date = timezone.now()
    loan_commitment = 1000
    loan_balance = 400
    interest_paid_to_date = 300
    interest_balance = 400
    interest_repay_income = 500
    interest_repay_capital = 200
