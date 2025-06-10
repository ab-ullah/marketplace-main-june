from rest_framework import status
from rest_framework.reverse import reverse
from rest_framework.test import APITestCase

from api.applications.tests.factories import ApplicationFactory
from api.partners.tests.factories import FundFactory, CompanyUserFactory, \
    UserFactory, CompanyFactory, FundInvestorFactory, CompanyUserInvestorFactory


class NonInvestedOpportunitiesTest(APITestCase):

    def setUp(self):
        self.user = UserFactory()
        self.user_2 = UserFactory()
        self.company = CompanyFactory()
        self.company_user = CompanyUserFactory(user=self.user, company=self.company)
        CompanyUserFactory(user=self.user_2, company=self.company)
        self.client.force_authenticate(user=self.user)

    def test_non_invested_view(self):
        fund = FundFactory(
            company=self.company,
            is_published=True
        )
        url = reverse('investor-opportunities')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]['id'], fund.id)

        fund.is_finalized = True
        fund.save()

        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertEqual(len(data), 0)

        application = ApplicationFactory(
            fund=fund,
            user=self.user
        )

        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertEqual(len(data), 0)

        application.is_transferred = True
        application.save()

        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]['id'], fund.id)

        self.client.force_authenticate(user=self.user_2)
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertEqual(len(data), 0)

        fund.is_finalized = False
        fund.save()

        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertEqual(len(data), 1)


    def test_fund_with_investment(self):
        fund = FundFactory(company=self.company, is_invite_only=True)

        url = reverse('investor-opportunities')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertEqual(len(data), 0)

        fund.is_published = True
        fund.accept_applications = True
        fund.save()

        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertEqual(len(data), 0)

        application = ApplicationFactory(
            fund=fund,
            user=self.user
        )

        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]['id'], fund.id)

        fund_investor = FundInvestorFactory(fund=fund)
        CompanyUserInvestorFactory(investor=fund_investor.investor, company_user=self.company_user)

        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertEqual(len(data), 0)

        application.is_transferred = True
        application.save()

        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]['id'], fund.id)

    def test_closed_status_impact(self):
        fund = FundFactory(company=self.company)
        url = reverse('investor-opportunities')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertEqual(len(data), 0)

        fund.is_published = True
        fund.save()
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]['id'], fund.id)

        fund.accept_applications = True
        fund.save()
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]['id'], fund.id)

        fund.close_applications = True
        fund.save()

        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertEqual(len(data), 0)

        application = ApplicationFactory(
            fund=fund,
            user=self.user
        )

        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertEqual(len(data), 0)

        application.is_transferred = True
        application.save()

        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]['id'], fund.id)

        self.client.force_authenticate(user=self.user_2)
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertEqual(len(data), 0)

        fund.close_applications = False
        fund.save()

        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertEqual(len(data), 1)
