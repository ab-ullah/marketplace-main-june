from django.template.loader import render_to_string
from django_q.tasks import async_task

from api.capital_calls.models import CapitalCall
from api.libs.sendgrid.email import SendEmailService
from api.libs.utils.urls import (get_capital_call_url, get_dashboard_url,
                                 get_logo_url)
from api.notifications.models import UserNotification

CAPITAL_CALL_EMAIL_MESSAGE = "email/capital_call_email_message.html"
CAPITAL_CALL_EMAIL_SUBJECT = "[Action Required] Capital Call Notice Published"


class CreateCapitalCallNotificationService:
    def __init__(self, capital_call: CapitalCall):
        self.capital_call = capital_call

    def create_notification(self):
        return UserNotification.objects.create(
            fund=self.capital_call.fund,
            investor=self.capital_call.fund_investor.investor,
            company=self.capital_call.company,
            due_date=self.capital_call.due_date,
            notification_type=UserNotification.NotificationTypeChoice.CAPITAL_CALL.value,
            capital_call=self.capital_call
        )

    @staticmethod
    def async_capital_call_creation_alert(notification_id: int):
        notification = UserNotification.objects.get(id=notification_id)
        email_service = SendEmailService()
        context = {
            'fund_name': notification.fund.name,
            'program_name': notification.company.company_profile.program_name,
            "dashboard_url": get_dashboard_url(),
            'support_email': notification.company.company_profile.contact_email,
            'due_date': notification.due_date.strftime("%b %d, %Y"),
            'logo_url': get_logo_url(company=notification.company)
        }
        body = render_to_string(CAPITAL_CALL_EMAIL_MESSAGE, context).strip()
        if notification.user:
            email_service.send_html_email(
                to=notification.user.user.email,
                subject=CAPITAL_CALL_EMAIL_SUBJECT,
                body=body
            )
        else:
            for user_investor in notification.investor.associated_users.exclude(company_user__user__deleted=True):
                email_service.send_html_email(
                    to=user_investor.company_user.user.email,
                    subject=CAPITAL_CALL_EMAIL_SUBJECT,
                    body=body
                )

    def create(self):
        notification = self.create_notification()
        async_task(self.async_capital_call_creation_alert, notification.id)
