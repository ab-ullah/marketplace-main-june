from django.test import TestCase

from api.activities.models import FundActivity, LoanActivity
from api.activities.tests.factories import FundActivityFactory, LoanActivityFactory
from api.companies.models import CompanyUser
from api.companies.services.reset_company import ResetCompanyService
from api.constants.currencies import CURRENCIES
from api.currencies.models import Currency
from api.funds.models import Fund
from api.investors.models import FundInvestor, Investor
from api.partners.tests.factories import FundFactory, CompanyUserFactory, CurrencyFactory, FundInvestorFactory, \
    CompanyFactory
from core.services.setup_db import SetupDbService


class CompanyResetServiceTestCase(TestCase):
    def setUp(self):
        Investor.objects.all().delete()
        FundInvestor.objects.all().delete()

    def test_company_reset_service(self):
        company_1 = CompanyFactory()
        SetupDbService(
            company_name=company_1.name,
            admin_emails=[],
            financial_reviewer_emails=[],
            knowledgeable_reviewer_emails=[]
        ).process()
        fund_1_company_1 = FundFactory(company=company_1)
        fund_2_company_1 = FundFactory(company=company_1)
        CompanyUserFactory(company=company_1)
        CompanyUserFactory(company=company_1)
        CurrencyFactory(company=company_1)
        FundActivityFactory(company=company_1)
        LoanActivityFactory(company=company_1)
        FundInvestorFactory(fund=fund_1_company_1)
        FundInvestorFactory(fund=fund_2_company_1)

        self.assertEqual(Fund.objects.filter(company=company_1).count(), 2)
        self.assertEqual(CompanyUser.objects.filter(company=company_1).count(), 2)
        self.assertEqual(Currency.objects.filter(company=company_1).count(), len(CURRENCIES))
        self.assertEqual(FundActivity.objects.filter(company=company_1).count(), 1)
        self.assertEqual(LoanActivity.objects.filter(company=company_1).count(), 1)

        company_2 = CompanyFactory()
        SetupDbService(
            company_name=company_2.name,
            admin_emails=[],
            financial_reviewer_emails=[],
            knowledgeable_reviewer_emails=[]
        ).process()
        fund_1_company_2 = FundFactory(company=company_2)
        fund_2_company_2 = FundFactory(company=company_2)
        CompanyUserFactory(company=company_2)
        CompanyUserFactory(company=company_2)
        CurrencyFactory(company=company_2)
        FundActivityFactory(company=company_2)
        LoanActivityFactory(company=company_2)
        FundInvestorFactory(fund=fund_1_company_2)
        FundInvestorFactory(fund=fund_2_company_2)

        self.assertEqual(Fund.objects.filter(company=company_2).count(), 2)
        self.assertEqual(CompanyUser.objects.filter(company=company_2).count(), 2)
        self.assertEqual(Currency.objects.filter(company=company_1).count(), len(CURRENCIES))
        self.assertEqual(FundActivity.objects.filter(company=company_2).count(), 1)
        self.assertEqual(LoanActivity.objects.filter(company=company_2).count(), 1)

        self.assertEqual(FundInvestor.objects.count(), 4)

        reset_service = ResetCompanyService(company_name=company_1.name.upper())
        reset_service.reset()

        self.assertEqual(Fund.objects.filter(company=company_1).count(), 0)
        self.assertEqual(CompanyUser.objects.filter(company=company_1).count(), 2)
        self.assertEqual(Currency.objects.filter(company=company_1).count(), 0)
        self.assertEqual(FundActivity.objects.filter(company=company_1).count(), 0)
        self.assertEqual(LoanActivity.objects.filter(company=company_1).count(), 0)

        self.assertEqual(Fund.objects.filter(company=company_2).count(), 2)
        self.assertEqual(CompanyUser.objects.filter(company=company_2).count(), 2)
        self.assertEqual(Currency.objects.filter(company=company_2).count(), len(CURRENCIES))
        self.assertEqual(FundActivity.objects.filter(company=company_2).count(), 1)
        self.assertEqual(LoanActivity.objects.filter(company=company_2).count(), 1)

        self.assertEqual(FundInvestor.objects.count(), 2)
