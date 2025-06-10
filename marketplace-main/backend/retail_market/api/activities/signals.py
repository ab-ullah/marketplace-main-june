from django.db.models.signals import post_save
from django.dispatch import receiver

from api.activities.models import FundActivity, LoanActivity
from api.activities.services.update_fund_investor import FundInvestorActivityService, \
    FundInvestorActivityServiceHistoricData
from api.activities.utils.has_loan import fund_investor_has_loan
from api.investors.constants import INVESTMENT_HISTORIC_DATA


@receiver(post_save, sender=FundActivity)
def update_investment_from_fund_activity(sender, instance: FundActivity, created, **kwargs):
    feature_flag = instance.company.is_feature_flag_active(INVESTMENT_HISTORIC_DATA)

    if not feature_flag:
        execute_existing_flow_fund_activity(instance)
    else:
        execute_historic_flow_fund_activity(instance)


@receiver(post_save, sender=LoanActivity)
def update_investment_from_loan_activity(sender, instance: LoanActivity, created, **kwargs):
    feature_flag = instance.company.is_feature_flag_active(INVESTMENT_HISTORIC_DATA)

    if not feature_flag:
        execute_existing_flow_loan_activity(instance)
    else:
        execute_historic_flow_loan_activity(instance)


def execute_existing_flow_fund_activity(instance: FundActivity):
    if FundActivity.objects.filter(
            investor_account_code=instance.investor_account_code,
            investment_product_code=instance.investment_product_code,
            share_class=instance.share_class,
            investment_id=instance.investment_id,
            transaction_date__gt=instance.transaction_date).exists():
        return
    try:
        loan_activity = LoanActivity.objects.filter(
            company=instance.company,
            investor_account_code=instance.investor_account_code,
            share_class=instance.share_class,
            investment_id=instance.investment_id,
            investment_product_code=instance.investment_product_code
        ).latest('transaction_date')
    except LoanActivity.DoesNotExist:
        if fund_investor_has_loan(fund_activity=instance):
            return
        loan_activity = None

    try:
        investment_service = FundInvestorActivityService(fund_activity=instance, loan_activity=loan_activity)
        investment_service.update_values()
    except Exception as e:
        print(e)


def execute_existing_flow_loan_activity(instance: LoanActivity):
    if LoanActivity.objects.filter(
            investor_account_code=instance.investor_account_code,
            investment_product_code=instance.investment_product_code,
            investment_id=instance.investment_id,
            transaction_date__gt=instance.transaction_date).exists():
        return
    try:
        fund_activity = FundActivity.objects.filter(
            company=instance.company,
            investment_product_code=instance.investment_product_code,
            investment_id=instance.investment_id,
            investor_account_code=instance.investor_account_code
        ).latest('transaction_date')
    except FundActivity.DoesNotExist:
        return

    try:
        investment_service = FundInvestorActivityService(fund_activity=fund_activity, loan_activity=instance)
        investment_service.update_values()
    except Exception as e:
        print(e)


def execute_historic_flow_fund_activity(instance: FundActivity):
    old_transaction_date = None
    if FundActivity.objects.filter(
            investor_account_code=instance.investor_account_code,
            investment_product_code=instance.investment_product_code,
            share_class=instance.share_class,
            investment_id=instance.investment_id,
            transaction_date__gt=instance.transaction_date).exists():
        old_transaction_date = instance.transaction_date
    try:
        loan_activity = LoanActivity.objects.filter(
            company=instance.company,
            investor_account_code=instance.investor_account_code,
            share_class=instance.share_class,
            investment_id=instance.investment_id,
            investment_product_code=instance.investment_product_code
        )
        if old_transaction_date:
            loan_activity = loan_activity.filter(transaction_date__lte=old_transaction_date)

        loan_activity = loan_activity.latest('transaction_date')

    except LoanActivity.DoesNotExist:
        if fund_investor_has_loan(fund_activity=instance):
            return
        loan_activity = None

    try:
        investment_service = FundInvestorActivityServiceHistoricData(
            fund_activity=instance,
            loan_activity=loan_activity,
            old_transaction_date=old_transaction_date
        )
        investment_service.update_values()
    except Exception as e:
        # TODO: Configure Logger
        print(e)


def execute_historic_flow_loan_activity(instance: LoanActivity):
    old_transaction_date = None
    if LoanActivity.objects.filter(
            investor_account_code=instance.investor_account_code,
            investment_product_code=instance.investment_product_code,
            investment_id=instance.investment_id,
            transaction_date__gt=instance.transaction_date).exists():
        old_transaction_date = instance.transaction_date
    try:
        fund_activity = FundActivity.objects.filter(
            company=instance.company,
            investment_product_code=instance.investment_product_code,
            investment_id=instance.investment_id,
            investor_account_code=instance.investor_account_code
        )
        if old_transaction_date:
            fund_activity = fund_activity.filter(transaction_date__lte=old_transaction_date)

        fund_activity = fund_activity.latest('transaction_date')

    except FundActivity.DoesNotExist:
        return

    try:
        investment_service = FundInvestorActivityServiceHistoricData(
            fund_activity=fund_activity,
            loan_activity=instance,
            old_transaction_date=old_transaction_date
        )
        investment_service.update_values()
    except Exception as e:
        #  TODO: Configure Logger
        print(e)
