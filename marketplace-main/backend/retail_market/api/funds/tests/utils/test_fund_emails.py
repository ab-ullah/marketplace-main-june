from django.test import TestCase

from api.funds.utils.get_fund_investor_emails import get_fund_user_emails
from api.partners.tests.factories import CompanyFactory, FundFactory, CompanyUserFactory, InvestorFactory, \
    CompanyUserInvestorFactory, FundInvestorFactory


class FundEmailListTestCase(TestCase):
    def test_fund_user_email_list(self):
        company = CompanyFactory()
        fund = FundFactory(company=company)
        fund_2 = FundFactory(company=company)

        company_user_1 = CompanyUserFactory()
        company_user_2 = CompanyUserFactory()
        company_user_3 = CompanyUserFactory()
        company_user_4 = CompanyUserFactory()

        company_user_investor_1 = CompanyUserInvestorFactory(company_user=company_user_1)
        company_user_investor_2 = CompanyUserInvestorFactory(company_user=company_user_2)
        company_user_investor_2_other = CompanyUserInvestorFactory(company_user=company_user_2)

        company_user_investor_3 = CompanyUserInvestorFactory(company_user=company_user_3)
        company_user_investor_4 = CompanyUserInvestorFactory(company_user=company_user_4)

        FundInvestorFactory(
            fund=fund,
            investor=company_user_investor_1.investor
        )

        FundInvestorFactory(
            fund=fund,
            investor=company_user_investor_2.investor
        )

        FundInvestorFactory(
            fund=fund,
            investor=company_user_investor_2_other.investor
        )

        FundInvestorFactory(
            fund=fund_2,
            investor=company_user_investor_3.investor
        )

        user_emails = get_fund_user_emails(fund=fund)
        self.assertEqual(len(user_emails), 2)
        self.assertEqual(
            set(user_emails),
            {company_user_1.user.email, company_user_2.user.email}
        )

        user_emails = get_fund_user_emails(fund=fund_2)
        self.assertEqual(len(user_emails), 1)
        self.assertEqual(
            set(user_emails),
            {company_user_3.user.email}
        )
