from unittest import mock

from django.conf import settings
from rest_framework.test import APITestCase

from api.partners.services.auth0_account_service import SendAuth0AccountCredentialsEmail
from api.partners.tests.factories import CompanyFactory, UserFactory, AdminUserFactory


class AdminUserEmailTest(APITestCase):
    @mock.patch('api.libs.sendgrid.email.SendEmailService.send_html_email')
    def test_investor_email_link(self, mock_email_send):
        company = CompanyFactory()
        user = UserFactory()
        password = 'testtest'
        investor_url = f'{settings.FE_APP_URL}/investor/start'
        admin_url = 'https://www.admin-sidecar.com/'
        with self.settings(FE_APP_URL=investor_url, ADMIN_APP_URL=admin_url):
            SendAuth0AccountCredentialsEmail(
                user=user,
                change_password_url="http://changemypassword.com",
                company=company
            ).send_account_credentials_email()
            self.assertIn(investor_url, mock_email_send.call_args_list[0].kwargs['body'])
            self.assertNotIn(admin_url, mock_email_send.call_args_list[0].kwargs['body'])

    @mock.patch('api.libs.sendgrid.email.SendEmailService.send_html_email')
    def test_admin_email_link(self, mock_email_send):
        company = CompanyFactory()
        user = UserFactory()
        password = 'testtest'
        investor_url = 'https://www.investor-sidecar.com/'
        admin_url = 'https://www.admin-sidecar.com/'
        AdminUserFactory(user=user, company=company)

        with self.settings(FE_APP_URL=investor_url, ADMIN_APP_URL=admin_url):
            SendAuth0AccountCredentialsEmail(
                user=user,
                change_password_url="http://changemypassword.com",
                company=company
            ).send_account_credentials_email()
            self.assertIn(admin_url, mock_email_send.call_args_list[0].kwargs['body'])
            self.assertNotIn(investor_url, mock_email_send.call_args_list[0].kwargs['body'])
