from api.activities.models import FundActivity


def fund_investor_has_loan(fund_activity: FundActivity):
    return bool(fund_activity.initial_leverage_rate)
