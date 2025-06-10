from django.db import migrations


def fund_investor_has_loan(fund_activity):
    return bool(fund_activity.initial_leverage_rate)


def new_formula(apps, schema_editor):
    FundInvestor = apps.get_model("investors", "FundInvestor")

    for fund_investor in FundInvestor.objects.all():
        loan_sum = fund_investor.loan_balance + fund_investor.unpaid_interest
        if fund_investor.gross_share_of_investment_product > 0 or fund_investor.gross_share_of_investment_product < 0:
            fund_investor.current_net_equity = fund_investor.gross_share_of_investment_product \
                                               - loan_sum \
                                               + fund_investor.capital_calls_since_last_nav\
                                               - fund_investor.distributions_calls_since_last_nav \
                                               + fund_investor.distributions_recallable
        else:
            fund_investor.current_net_equity = 0
        fund_investor.save()


def restore_old_formula(apps, schema_editor):
    FundInvestor = apps.get_model("investors", "FundInvestor")

    for fund_investor in FundInvestor.objects.all():
        loan_sum = fund_investor.loan_balance + fund_investor.unpaid_interest
        if fund_investor.gross_share_of_investment_product > 0 or fund_investor.gross_share_of_investment_product < 0:
            fund_investor.current_net_equity = fund_investor.gross_share_of_investment_product \
                                               - loan_sum \
                                               + fund_investor.capital_calls_since_last_nav\
                                               - fund_investor.distributions_calls_since_last_nav
        else:
            fund_investor.current_net_equity = 0
        fund_investor.save()


class Migration(migrations.Migration):
    dependencies = [
        ('activities', '0032_auto_20230731_2135'),
        ('companies', '0042_auto_20230706_2028'),
        ('funds', '0064_historicalfund'),
    ]

    operations = [
        migrations.RunPython(new_formula, reverse_code=restore_old_formula)
    ]
