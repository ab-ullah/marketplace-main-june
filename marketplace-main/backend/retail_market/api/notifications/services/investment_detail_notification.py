from api.funds.models import Fund
from api.notifications.models import UserNotification


class InvestmentDetailNotificationService:
    def __init__(self, fund: Fund):
        self.fund = fund
        self.company = fund.company

    def create_notification(self, company_user, investor):
        UserNotification.objects.create(
            notification_type=UserNotification.NotificationTypeChoice.NEW_INVESTMENT.value,
            fund=self.fund,
            user=company_user,
            company=self.company,
            investor=investor
        )

    def process_fund(self):
        seen_company_user_ids = set()
        for fund_investor in self.fund.fund_investors.all():
            investor = fund_investor.investor
            for investor_user in investor.associated_users.all():
                company_user = investor_user.company_user
                if company_user.id in seen_company_user_ids:
                    continue
                seen_company_user_ids.add(company_user.id)
                self.create_notification(
                    company_user=company_user,
                    investor=investor
                )
