from api.companies.models import CompanyUser
from api.funds.models import Fund
from api.investors.models import FundInvestor, CompanyUserInvestor


def get_fund_user_emails(fund: Fund):
    investor_ids = FundInvestor.objects.filter(fund=fund).values_list('investor_id', flat=True)

    company_user_ids = CompanyUserInvestor.objects.filter(
        investor_id__in=list(investor_ids)
    ).values_list('company_user_id', flat=True)

    user_emails = CompanyUser.objects.filter(
        id__in=list(company_user_ids)
    ).values_list('user__email', flat=True)

    # Since investors can have more than one vehicle,
    # make sure we don't send an email to them
    # twice if they invest through multiple vehicles.

    return list(set(user_emails))
