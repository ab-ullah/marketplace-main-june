from dateutil import parser
from datetime import timedelta

from django.utils import timezone

from rest_framework.test import APITestCase
from rest_framework.reverse import reverse
from rest_framework import status

from api.feature_flags.tests.factories import FeatureFactory, ActiveCompanyFeatureFactory
from api.investors.constants import INVESTMENT_HISTORIC_DATA
from api.investors.models import FundInvestor
from api.partners.tests.factories import InvestorFactory, FundFactory, CompanyUserInvestorFactory, CompanyUserFactory, \
    FundInvestorFactory, UserFactory, CompanyFactory
from api.admin_users.services.admin_user_service import CreateAdminUserService


class InvestorViewsTest(APITestCase):

    def setUp(self):
        self.user = UserFactory()
        self.company = CompanyFactory()
        CreateAdminUserService(email=self.user.email, company_name=self.company.name).create()
        CompanyUserFactory(user=self.user)

    def setup_fund_investor(self, publish_investment_details=False):
        fund = FundFactory(company=self.company,
                           publish_investment_details=publish_investment_details)
        investor = InvestorFactory()
        company_user = CompanyUserFactory(company=self.company)  # type: CompanyUser
        company_investor = CompanyUserInvestorFactory(investor=investor, company_user=company_user)
        FundInvestorFactory(fund=fund, investor=investor)
        return fund, company_investor

    def test_investment_details_published_funds(self):
        fund, investor_user = self.setup_fund_investor(publish_investment_details=True)
        self.client.force_authenticate(investor_user.company_user.user)
        url = reverse('investor-detail')

        response = self.client.get(url)
        invested_funds = response.data['invested_funds']
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(invested_funds), 1)
        self.assertEqual(invested_funds[0]['fund']['id'], fund.id)

    def test_investment_details_unpublished_funds(self):
        fund_published, investor_user_published = self.setup_fund_investor(publish_investment_details=True)
        fund_unpublished, investor_user_unpublished = self.setup_fund_investor(publish_investment_details=False)
        self.client.force_authenticate(investor_user_published.company_user.user)
        url = reverse('investor-detail')

        response = self.client.get(url)
        invested_funds = response.data['invested_funds']
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(invested_funds), 1)
        self.assertEqual(invested_funds[0]['fund']['id'], fund_published.id)

    def test_fund_investor_details_list(self):
        transaction_date_1 = timezone.now() + timedelta(days=1)
        transaction_date_2 = timezone.now() + timedelta(days=2)
        transaction_date_3 = timezone.now() + timedelta(days=20)

        fund = FundFactory(
            company=self.company,
            publish_investment_details=True
        )
        investor = InvestorFactory()
        company_user = CompanyUserFactory(company=self.company)
        CompanyUserInvestorFactory(investor=investor, company_user=company_user)
        FundInvestorFactory(
            fund=fund,
            investor=investor,
            latest_transaction_date=transaction_date_1
        )
        FundInvestorFactory(
            fund=fund,
            investor=investor,
            latest_transaction_date=transaction_date_2
        )

        self.client.force_authenticate(company_user.user)
        url = reverse('funds-investors-list', kwargs={'fund_external_id': fund.external_id})

        # By default, show only latest FundInvestor record
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.data
        self.assertEqual(len(data), 1)
        self.assertEqual(parser.parse(data[0]['latest_transaction_date']), transaction_date_2)

        # Create and Activate Feature Flag
        investment_historic_feature = FeatureFactory.create(name=INVESTMENT_HISTORIC_DATA)
        company_feature_flag = ActiveCompanyFeatureFactory.create(
            feature=investment_historic_feature,
            company=self.company
        )

        # Show all records now since feature flag is active
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.data
        self.assertEqual(len(data), 2)
        self.assertEqual(parser.parse(data[0]['latest_transaction_date']), transaction_date_2)
        self.assertEqual(parser.parse(data[1]['latest_transaction_date']), transaction_date_1)

        # verify date filtering
        query_params = "?start_date={}&end_date={}".format(
            transaction_date_2.strftime('%Y-%m-%d'),
            transaction_date_3.strftime('%Y-%m-%d')
        )
        response = self.client.get(url+query_params)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.data
        self.assertEqual(len(data), 1)
        self.assertEqual(parser.parse(data[0]['latest_transaction_date']), transaction_date_2)

        # Deactivate feature flag
        company_feature_flag.active = False
        company_feature_flag.save()

        # Show only latest FundInvestor record again since feature flag is not active
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.data
        self.assertEqual(len(data), 1)
        self.assertEqual(parser.parse(data[0]['latest_transaction_date']), transaction_date_2)

    def test_investment_details_latest_investments_only(self):
        transaction_date_1 = timezone.now() + timedelta(days=10)
        transaction_date_2 = timezone.now() + timedelta(days=22)

        fund = FundFactory(
            company=self.company,
            publish_investment_details=True
        )
        investor = InvestorFactory()
        company_user = CompanyUserFactory(company=self.company)
        CompanyUserInvestorFactory(investor=investor, company_user=company_user)
        FundInvestorFactory(
            fund=fund,
            investor=investor,
            latest_transaction_date=transaction_date_1
        )
        FundInvestorFactory(
            fund=fund,
            investor=investor,
            latest_transaction_date=transaction_date_2
        )

        self.client.force_authenticate(company_user.user)
        url = reverse('investor-detail')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # there should be only one record with latest transaction date
        invested_funds = response.data['invested_funds']
        self.assertEqual(len(invested_funds), 1)
        self.assertEqual(parser.parse(invested_funds[0]['latest_transaction_date']), transaction_date_2)

        # verify date filtering
        query_params = "?start_date={}&end_date={}".format(
            '2020-12-30',
            (timezone.now() + timedelta(days=12)).strftime('%Y-%m-%d')
        )
        response = self.client.get(url + query_params)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        invested_funds = response.data['invested_funds']
        self.assertEqual(len(invested_funds), 1)
        self.assertEqual(parser.parse(invested_funds[0]['latest_transaction_date']), transaction_date_1)

    def test_soft_deleted_investment_not_shown(self):
        url = reverse('investor-detail')
        transaction_date_1 = timezone.now() + timedelta(days=10)
        fund = FundFactory(
            company=self.company,
            publish_investment_details=True
        )
        investor = InvestorFactory()
        company_user = CompanyUserFactory(company=self.company)
        self.client.force_authenticate(company_user.user)

        CompanyUserInvestorFactory(investor=investor, company_user=company_user)
        fund_investor = FundInvestorFactory(
            fund=fund,
            investor=investor,
            latest_transaction_date=transaction_date_1
        )
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        invested_funds = response.data['invested_funds']
        self.assertEqual(len(invested_funds), 1)

        fund_investor.deleted = True
        fund_investor.save()

        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        invested_funds = response.data['invested_funds']
        self.assertEqual(len(invested_funds), 0)

