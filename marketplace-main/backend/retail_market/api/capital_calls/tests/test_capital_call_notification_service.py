
from unittest import mock

from api.capital_calls.services.create_capital_call_notification import \
    CreateCapitalCallNotificationService
from api.capital_calls.tests.factories import CapitalCallFactory
from api.notifications.models import UserNotification
from api.partners.tests.factories import (CompanyProfileFactory,
                                          CompanyUserFactory,
                                          CompanyUserInvestorFactory,
                                          FundInvestorFactory, UserFactory)
from core.base_tests import BaseTestCase

CAPITAL_CALL_EMAIL_MESSAGE = "email/capital_call_email_message.html"
CAPITAL_CALL_EMAIL_SUBJECT = "[Action Required] Capital Call Notice Published"


class CreateCapitalCallNotificationServiceTest(BaseTestCase):
    def setUp(self):
        self.create_user()
        self.create_fund(self.company)
        self.capital_call = CapitalCallFactory()

        CompanyProfileFactory(company=self.company)

    def test_email_send_to_user_if_user_exists(self):
        notification = UserNotification.objects.create(
            fund=self.fund,
            company=self.company,
            due_date=self.capital_call.due_date,
            user=self.company_user,
            notification_type=UserNotification.NotificationTypeChoice.CAPITAL_CALL.value,
        )

        with mock.patch('api.libs.sendgrid.email.SendEmailService.send_html_email') as mock_send_email:
            service = CreateCapitalCallNotificationService(self.capital_call)
            service.async_capital_call_creation_alert(notification.id)

            mock_send_email.assert_called_once_with(
                to=self.user.email,
                subject=CAPITAL_CALL_EMAIL_SUBJECT,
                body=mock.ANY
            )
            email_body = mock_send_email.call_args[1]['body']
            self.assertIn(self.fund.name, email_body)

    def test_email_send_to_associated_users_if_user_not_exists(self):
        user2 = UserFactory()
        company_user_2 = CompanyUserFactory(user=user2, company=self.company)

        fund_investor = FundInvestorFactory(fund=self.fund)

        CompanyUserInvestorFactory(investor=fund_investor.investor, company_user=self.company_user)
        CompanyUserInvestorFactory(investor=fund_investor.investor, company_user=company_user_2)

        notification = UserNotification.objects.create(
            fund=self.fund,
            company=self.company,
            due_date=self.capital_call.due_date,
            investor=fund_investor.investor,
            notification_type=UserNotification.NotificationTypeChoice.CAPITAL_CALL.value,
        )

        with mock.patch('api.libs.sendgrid.email.SendEmailService.send_html_email') as mock_send_email:
            service = CreateCapitalCallNotificationService(self.capital_call)
            service.async_capital_call_creation_alert(notification.id)

            mock_send_email.assert_any_call(
                to=self.user.email,
                subject=CAPITAL_CALL_EMAIL_SUBJECT,
                body=mock.ANY
            )
            mock_send_email.assert_any_call(
                to=user2.email,
                subject=CAPITAL_CALL_EMAIL_SUBJECT,
                body=mock.ANY
            )

            email_body = mock_send_email.call_args[1]['body']
            self.assertIn(self.fund.name, email_body)
