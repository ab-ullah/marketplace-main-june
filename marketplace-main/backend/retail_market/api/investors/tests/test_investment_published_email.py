from rest_framework.test import APITestCase
from unittest import mock
from rest_framework.reverse import reverse
from rest_framework import status

from api.companies.models import CompanyUser
from api.notifications.models import UserNotification
from api.partners.tests.factories import InvestorFactory, FundFactory, CompanyUserInvestorFactory, CompanyUserFactory, \
    FundInvestorFactory, UserFactory, CompanyProfileFactory, CompanyFactory
from api.admin_users.services.admin_user_service import CreateAdminUserService


class InvestmentPublishedEmailTest(APITestCase):

    def setUp(self):
        self.user = UserFactory()
        self.company = CompanyFactory()
        CreateAdminUserService(email=self.user.email, company_name=self.company.name).create()
        CompanyUserFactory(user=self.user)
        self.company_profile = CompanyProfileFactory(company=self.company)
        self.client.force_authenticate(self.user)
        self.investor = InvestorFactory()
        self.company_user = CompanyUserFactory(company=self.company)  # type: CompanyUser
        CompanyUserInvestorFactory(investor=self.investor, company_user=self.company_user)

    def setup_fund_investor(self, is_published, publish_investment_details=False):
        fund = FundFactory(
            company=self.company,
            is_published=is_published,
            publish_investment_details=publish_investment_details
        )
        FundInvestorFactory(fund=fund, investor=self.investor)
        return fund

    @mock.patch('api.libs.sendgrid.email.SendEmailService.send_html_email')
    def test_investment_published_email_and_notification(self, mock_email_send):
        fund = self.setup_fund_investor(is_published=False)
        url = reverse('funds-update', kwargs={'pk': fund.id})
        payload = {
            'publish_investment_details': True
        }

        response = self.client.patch(url, data=payload)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(mock_email_send.call_count, 1)
        self.assertEqual(UserNotification.objects.count(), 0)
        self.assertEqual(UserNotification.objects.filter(
            user=self.company_user,
            investor=self.investor,
            notification_type=UserNotification.NotificationTypeChoice.NEW_INVESTMENT
        ).count(), 0)

    @mock.patch('api.libs.sendgrid.email.SendEmailService.send_html_email')
    def test_email_does_not_fire_when_investment_details_unpublished(self, mock_email_send):
        fund = self.setup_fund_investor(is_published=True)
        url = reverse('funds-update', kwargs={'pk': fund.id})
        payload = {
            'name': 'updated fund name'
        }

        response = self.client.patch(url, data=payload)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(mock_email_send.call_count, 0)
        self.assertEqual(UserNotification.objects.count(), 0)

    @mock.patch('api.libs.sendgrid.email.SendEmailService.send_html_email')
    def test_email_does_not_fire_when_investment_details_already_published(self, mock_email_send):
        fund = self.setup_fund_investor(is_published=True, publish_investment_details=True)
        url = reverse('funds-update', kwargs={'pk': fund.id})
        payload = {
            'name': 'Updated fund',
            'publish_investment_details': True
        }
        self.client.patch(url, data=payload)
        self.assertEqual(mock_email_send.call_count, 0)
        self.assertEqual(UserNotification.objects.count(), 0)

    @mock.patch('api.libs.sendgrid.email.SendEmailService.send_html_email')
    def test_multiple_investors_with_multiple_users(self, mock_email_send):
        fund = self.setup_fund_investor(is_published=True, publish_investment_details=False)
        company_user_2 = CompanyUserFactory(company=self.company)
        investor_2 = InvestorFactory()

        CompanyUserInvestorFactory(investor=self.investor, company_user=company_user_2)
        CompanyUserInvestorFactory(investor=investor_2, company_user=self.company_user)
        CompanyUserInvestorFactory(investor=investor_2, company_user=company_user_2)

        FundInvestorFactory(fund=fund, investor=investor_2)

        url = reverse('funds-update', kwargs={'pk': fund.id})
        payload = {
            'name': 'Updated fund',
            'publish_investment_details': True
        }
        self.client.patch(url, data=payload)
        self.assertEqual(mock_email_send.call_count, 2)
        self.assertEqual(UserNotification.objects.count(), 0)

    @mock.patch('api.libs.sendgrid.email.SendEmailService.send_html_email')
    def test_multiple_investors_with_multiple_users_is_published_false(self, mock_email_send):
        fund = self.setup_fund_investor(is_published=False, publish_investment_details=False)
        company_user_2 = CompanyUserFactory(company=self.company)
        investor_2 = InvestorFactory()

        CompanyUserInvestorFactory(investor=self.investor, company_user=company_user_2)
        CompanyUserInvestorFactory(investor=investor_2, company_user=self.company_user)
        CompanyUserInvestorFactory(investor=investor_2, company_user=company_user_2)

        FundInvestorFactory(fund=fund, investor=investor_2)

        url = reverse('funds-update', kwargs={'pk': fund.id})
        payload = {
            'name': 'Updated fund',
            'publish_investment_details': True
        }
        self.client.patch(url, data=payload)
        self.assertEqual(mock_email_send.call_count, 2)
        self.assertEqual(UserNotification.objects.count(), 0)

    @mock.patch('api.libs.sendgrid.email.SendEmailService.send_html_email')
    def test_no_notification_created_when_published_investment_marked_false(self, mock_email_send):
        fund = self.setup_fund_investor(is_published=False, publish_investment_details=True)
        url = reverse('funds-update', kwargs={'pk': fund.id})
        payload = {
            'publish_investment_details': False
        }
        response = self.client.patch(url, data=payload)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(mock_email_send.call_count, 0)
        self.assertEqual(UserNotification.objects.count(), 0)

        fund = self.setup_fund_investor(is_published=True, publish_investment_details=False)
        url = reverse('funds-update', kwargs={'pk': fund.id})
        response = self.client.patch(url, data=payload)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(mock_email_send.call_count, 0)
        self.assertEqual(UserNotification.objects.count(), 0)
