from api.capital_calls.models import FundCapitalCall
from api.companies.models import CompanyUser
from api.documents.models import Document
from api.investors.models import FundInvestor
from api.partners.services.create_notification import \
    DocumentNotificationService


class CreateCapitalCallNotification:
    def __init__(self, capital_call: FundCapitalCall):
        self.capital_call = capital_call
        self.fund = capital_call.fund
        self.company = self.fund.company

    def process(self):
        capital_call_details = self.capital_call.capital_call_details.all()

        for capital_call_detail in capital_call_details:
            user = capital_call_detail.user
            company_user = user.associated_company_users.get(company=self.company)
            document = capital_call_detail.notice

            self.create_notification(document=document, company_user=company_user)

    def create_notification(self, document: Document, company_user: CompanyUser):
        company_user_investors = company_user.associated_investor_profiles.all()
        for company_user_investor in company_user_investors:
            fund_investor = FundInvestor.objects.filter(fund=self.fund, investor=company_user_investor.investor)
            if fund_investor:
                notification_service = DocumentNotificationService(
                    document=document,
                    payload={
                        'due_date': self.capital_call.due_date
                    },
                    investor=company_user_investor.investor,
                    skip_notification=False,
                    fund=self.fund
                )
                notification_service.process_investor(investor=company_user_investor.investor)
