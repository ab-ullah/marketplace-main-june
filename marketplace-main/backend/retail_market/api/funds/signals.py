from django.db.models.signals import post_save
from django.dispatch import receiver

from api.activities.models import FundActivity, LoanActivity
from api.activities.services.update_fund_investor import FundInvestorActivityService

from api.funds.models import Fund, FundShareClass
from api.funds.models import FundNav
from api.investors.models import FundInvestor
from api.companies.models import CompanyFundVehicle

@receiver(post_save, sender=Fund)
def add_initial_share_classes(sender, instance: Fund, created, **kwargs):
    share_classes = [
        {"n": "A", "l": 0},
        {"n": "B", "l": 3},
        {"n": "C", "l": 4},
        {"n": "D", "l": 2},
    ]
    if created is False:
        # skip updated funds
        return

    company = instance.company
    fund_vehicles = CompanyFundVehicle.objects.filter(company=company).all()
    for v in fund_vehicles:
        for share in share_classes:
            fsc = FundShareClass()
            fsc.company = company
            fsc.company_fund_vehicle = v
            fsc.fund = instance
            fsc.legal_name = "{}".format(share["n"])
            fsc.display_name = "{}".format(share["n"])
            fsc.leverage = share['l']
            fsc.save()


@receiver(post_save, sender=FundNav)
def update_investment_from_fund_nav(sender, instance: FundNav, created, **kwargs):
    if FundNav.objects.filter(as_of__gt=instance.as_of).exists():
        return

    fund = instance.fund
    for fund_investor in FundInvestor.objects.filter(fund_id=fund.id):
        try:
            fund_activity = FundActivity.objects.filter(
                company=fund.company,
                investment_product_code=fund.investment_product_code,
                investor_account_code=fund_investor.investor.investor_account_code
            ).latest('transaction_date')
        except FundActivity.DoesNotExist:
            continue

        try:
            loan_activity = LoanActivity.objects.filter(
                company=fund.company,
                investment_product_code=fund.investment_product_code,
                investor_account_code=fund_investor.investor.investor_account_code
            ).latest('transaction_date')
        except LoanActivity.DoesNotExist:
            continue

        try:
            investment_service = FundInvestorActivityService(fund_activity=fund_activity, loan_activity=loan_activity)
            investment_service.update_values()
        except Exception as e:
            #  TODO: Configure Logger
            print(e)
