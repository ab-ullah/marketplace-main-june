from unittest import mock

from django.utils import timezone

from api.investors.models import CompanyUserInvestor
from api.notifications.models import UserNotification
from api.partners.services.send_document_upload_email import SendDocumentEmail, DOCUMENT_CREATED_EMAIL_SUBJECT
from api.partners.tests.factories import CompanyProfileFactory, FundInvestorFactory, CompanyUserFactory
from core.base_tests import BaseTestCase


class SendDocumentEmailNotificationServiceTest(BaseTestCase):
    def setUp(self):
        self.create_user()
        self.create_fund(self.company)
        CompanyProfileFactory(company=self.company)

    def test_email_send_to_user_if_user_exists(self):
        company_user_1 = CompanyUserFactory(company=self.company)
        company_user_2 = CompanyUserFactory(company=self.company)

        fund_investor = FundInvestorFactory(fund=self.fund)
        CompanyUserInvestor.objects.create(
            investor=fund_investor.investor,
            company_user=company_user_2
        )

        CompanyUserInvestor.objects.create(
            investor=fund_investor.investor,
            company_user=company_user_1
        )

        notification = UserNotification.objects.create(
            fund=self.fund,
            company=self.company,
            due_date=timezone.now().date(),
            user=company_user_1,
            investor=fund_investor.investor,
            notification_type=UserNotification.NotificationTypeChoice.AGREEMENT.value,
        )

        with mock.patch('api.libs.sendgrid.email.SendEmailService.send_html_email') as mock_send_email:
            SendDocumentEmail(
                document_title='dummy document',
                document_type='agreement',
                notification_id=notification.id
            ).send_document_email()

            mock_send_email.assert_called_once_with(
                to=company_user_1.user.email,
                subject=DOCUMENT_CREATED_EMAIL_SUBJECT,
                body=mock.ANY
            )
            email_body = mock_send_email.call_args[1]['body']
            self.assertIn(self.fund.name, email_body)
