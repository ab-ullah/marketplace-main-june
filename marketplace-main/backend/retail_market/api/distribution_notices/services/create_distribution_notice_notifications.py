from api.companies.models import CompanyUser
from api.distribution_notices.models import DistributionNotice
from api.documents.models import Document
from api.investors.models import FundInvestor
from api.partners.services.create_notification import \
    DocumentNotificationService


class CreateDistributionNoticeNotification:
    def __init__(self, distribution_notice: DistributionNotice):
        self.distribution_notice = distribution_notice
        self.fund = distribution_notice.fund
        self.company = self.fund.company

    def process(self):
        distribution_notice_details = self.distribution_notice.distribution_notice_details.all()

        for distribution_notice_detail in distribution_notice_details:
            user = distribution_notice_detail.user
            company_user = user.associated_company_users.get(company=self.company)
            document = distribution_notice_detail.document

            self.create_notification(document=document, company_user=company_user)

    def create_notification(self, document: Document, company_user: CompanyUser):
        company_user_investors = company_user.associated_investor_profiles.all()
        for company_user_investor in company_user_investors:
            fund_investor = FundInvestor.objects.filter(fund=self.fund, investor=company_user_investor.investor)
            if fund_investor:
                notification_service = DocumentNotificationService(
                    document=document,
                    payload={
                        'distribution_date': self.distribution_notice.distribution_date
                    },
                    investor=company_user_investor.investor,
                    skip_notification=False,
                    fund=self.fund
                )
                notification_service.process_investor(investor=company_user_investor.investor)
