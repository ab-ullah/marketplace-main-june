from rest_framework import status
from rest_framework.reverse import reverse
from rest_framework.test import APITestCase

from api.admin_users.services.admin_user_service import CreateAdminUserService
from api.applications.models import Application
from api.applications.tests.factories import ApplicationFactory
from api.partners.tests.factories import UserFactory, CompanyFactory, FundFactory


class TestFundListAPIView(APITestCase):

    def setUp(self):
        self.user = UserFactory()
        self.company = CompanyFactory()
        CreateAdminUserService(email=self.user.email, company_name=self.company.name).create()

    def test_fund_list_can_finalize(self):
        fund_1 = FundFactory(company=self.company)
        fund_2 = FundFactory(company=self.company)
        fund_3 = FundFactory(company=self.company)

        ApplicationFactory(fund=fund_1, company=self.company, user=UserFactory())
        ApplicationFactory(
            fund=fund_2,
            company=self.company,
            status=Application.Status.APPROVED.value,
            user=UserFactory()
        )
        ApplicationFactory(fund=fund_2, company=self.company, user=UserFactory())
        self.client.force_authenticate(self.user)

        url = reverse('funds-list-create')

        response = self.client.get(url)
        funds = response.data

        for fund in funds:
            if fund['id'] == fund_2.id:
                self.assertTrue(fund['can_finalize'])
            else:
                self.assertFalse(fund['can_finalize'])

    def test_fund_list_partner_api_not_in_list(self):
        fund_1 = FundFactory(company=self.company)
        fund_2 = FundFactory(company=self.company, created_via_partner_api=True)
        fund_3 = FundFactory(company=self.company)

        url = reverse('funds-list-create')
        self.client.force_authenticate(self.user)
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        funds = response.data
        received_ids = [fund['id'] for fund in funds]
        self.assertEqual(len(funds), 3)
        self.assertEqual(set(received_ids), {fund_1.id, fund_2.id, fund_3.id})
