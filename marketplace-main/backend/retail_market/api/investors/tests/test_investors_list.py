from rest_framework import status
from rest_framework.reverse import reverse

from api.investors.models import CompanyUserInvestor
from api.partners.tests.factories import InvestorFactory, FundFactory, CompanyUserFactory, \
    FundInvestorFactory, UserFactory, AdminUserFactory
from core.base_tests import BaseTestCase


class InvestorUsersListTestCase(BaseTestCase):
    def setUp(self) -> None:
        self.create_user()

    def create_user(self):
        self.create_company()
        self.user = UserFactory()
        self.admin_user = AdminUserFactory(
            company=self.company,
            user=self.user
        )
        self.client.force_authenticate(self.user)

    def test_deleted_users_not_in_response(self):
        fund = FundFactory(company=self.company)
        investor_1 = InvestorFactory()
        investor_2 = InvestorFactory()

        company_user_1 = CompanyUserFactory(company=self.company)
        company_user_2 = CompanyUserFactory(company=self.company)

        CompanyUserInvestor.objects.create(
            company_user=company_user_1,
            investor=investor_1
        )

        CompanyUserInvestor.objects.create(
            company_user=company_user_2,
            investor=investor_2
        )

        FundInvestorFactory(fund=fund, investor=investor_1)
        FundInvestorFactory(fund=fund, investor=investor_2)

        url = reverse('investor-users-list')
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.data
        self.assertEqual(len(data), 2)
        user_ids = [u['user_id'] for u in data]
        self.assertEqual({company_user_1.id, company_user_2.id}, set(user_ids))

        company_user_2.user.deleted = True
        company_user_2.user.save()

        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.data
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]['user_id'], company_user_1.id)

    def test_investors_list_filter(self):
        investor_1 = InvestorFactory()
        investor_2 = InvestorFactory()
        investor_3 = InvestorFactory()

        company_user_1 = CompanyUserFactory(company=self.company)
        company_user_2 = CompanyUserFactory(company=self.company)
        company_user_3 = CompanyUserFactory()

        CompanyUserInvestor.objects.create(
            company_user=company_user_1,
            investor=investor_1
        )

        CompanyUserInvestor.objects.create(
            company_user=company_user_2,
            investor=investor_2
        )

        CompanyUserInvestor.objects.create(
            company_user=company_user_3,
            investor=investor_3
        )

        url = reverse('investor-list')
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.data
        self.assertEqual(len(data), 2)
        investor_ids = [investor['id'] for investor in data]
        self.assertEqual({investor_1.id, investor_2.id}, set(investor_ids))

        company_user_2.user.deleted = True
        company_user_2.user.save()

        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.data
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]['id'], investor_1.id)
