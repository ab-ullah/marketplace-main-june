from django_q.tasks import async_task

from api.companies.models import CompanyUser
from api.funds.models import Fund
from api.libs.sendgrid.email import SendEmailService
from api.notifications.models import UserNotification


class CreateNotificationService:
    def __init__(self, company):
        self.company = company

    def get_users(self):
        return CompanyUser.objects.filter(company=self.company)

    def create_opportunity_notification(self, fund: Fund):
        for company_user in self.get_users():
            UserNotification.objects.create(
                notification_type=UserNotification.NotificationTypeChoice.NEW_INVESTMENT.value,
                fund=fund,
                user=company_user,
                due_date=fund.deadline,
                company=self.company
            )
            if company_user.user.email:
                async_task(self.async_new_investment_alert, company_user.user.email, fund.name)

    @staticmethod
    def async_new_investment_alert(to: str, fund_name: str):
        SendEmailService().send_new_investment_email(to, fund_name)
