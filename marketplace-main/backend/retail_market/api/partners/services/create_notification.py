from datetime import timedelta
from typing import Optional

from dateutil import parser
from django_q.tasks import async_task

from api.capital_calls.models import CapitalCall
from api.capital_calls.services.create_capital_call_notification import \
    CreateCapitalCallNotificationService
from api.companies.models import CompanyUser
from api.documents.models import Document
from api.funds.models import Fund
from api.investors.models import FundInvestor, Investor
from api.notifications.models import NotificationDocument, UserNotification
from api.partners.services.send_document_upload_email import SendDocumentEmail

DOCUMENT_TYPE_MAPPING = {
    Document.DocumentType.CAPITAL_CALL.value: UserNotification.NotificationTypeChoice.CAPITAL_CALL.value,
    Document.DocumentType.PROSPECTUS.value: UserNotification.NotificationTypeChoice.PROSPECTUS.value,
    Document.DocumentType.AGREEMENT.value: UserNotification.NotificationTypeChoice.AGREEMENT.value,
    Document.DocumentType.INTEREST_STATEMENT.value: UserNotification.NotificationTypeChoice.INTEREST_STATEMENT.value,
    Document.DocumentType.NAV_STATEMENT.value: UserNotification.NotificationTypeChoice.NAV_STATEMENT.value,
    Document.DocumentType.PITCH_BOOK.value: UserNotification.NotificationTypeChoice.PITCH_BOOK.value,
    Document.DocumentType.TAX.value: UserNotification.NotificationTypeChoice.TAX.value,
    Document.DocumentType.OTHER.value: UserNotification.NotificationTypeChoice.OTHER.value,
    Document.DocumentType.DISTRIBUTIONS: UserNotification.NotificationTypeChoice.DISTRIBUTIONS.value,
    Document.DocumentType.INVESTOR_REPORTS: UserNotification.NotificationTypeChoice.INVESTOR_REPORTS.value,
    Document.DocumentType.FINANCIAL_STATEMENTS: UserNotification.NotificationTypeChoice.FINANCIAL_STATEMENTS.value,
    Document.DocumentType.PURCHASE_AGREEMENTS: UserNotification.NotificationTypeChoice.PURCHASED_AGREEMENTS.value,
    Document.DocumentType.SUBSCRIPTION_DOCUMENTS: UserNotification.NotificationTypeChoice.SUBSCRIPTION_DOCUMENTS.value,
    Document.DocumentType.FINANCIAL_INFORMATION: UserNotification.NotificationTypeChoice.FINANCIAL_INFORMATION.value,
    Document.DocumentType.PROPERTY_PORTFOLIO: UserNotification.NotificationTypeChoice.PROPERTY_PORTFOLIO.value,
    Document.DocumentType.QUARTERLY_REPORT: UserNotification.NotificationTypeChoice.QUARTERLY_REPORT.value,
    Document.DocumentType.ETHICS: UserNotification.NotificationTypeChoice.ETHICS.value,
    Document.DocumentType.INVESTOR_MEETING_MATERIALS: UserNotification.NotificationTypeChoice.INVESTOR_MEETING_MATERIALS.value,
    Document.DocumentType.STRATEGIC_MATERIALS: UserNotification.NotificationTypeChoice.STRATEGIC_MATERIALS.value,
    Document.DocumentType.SUSTAINABILITY: UserNotification.NotificationTypeChoice.SUSTAINABILITY.value,
    Document.DocumentType.ANNUAL_REPORT: UserNotification.NotificationTypeChoice.ANNUAL_REPORT.value,
    Document.DocumentType.MONTHLY_REPORT: UserNotification.NotificationTypeChoice.MONTHLY_REPORT.value,
    Document.DocumentType.COMPANY_DOCUMENT: UserNotification.NotificationTypeChoice.COMPANY_DOCUMENT.value,
}


class DocumentNotificationService:
    def __init__(self,
                 document: Document,
                 payload: dict,
                 investor: Optional[Investor] = None,
                 fund: Optional[Fund] = None,
                 skip_notification: Optional[bool] = False,
                 is_admin_upload: Optional[bool] = False
                 ):
        self.document = document
        self.company = document.company
        self.investor = investor
        self.fund = fund
        self.payload = payload
        self.skip_notification = skip_notification
        self.is_admin_upload = is_admin_upload
        self.notification_type = self.get_notification_type()
        self.is_capital_call = self.notification_type == UserNotification.NotificationTypeChoice.CAPITAL_CALL.value
        self.seen_company_user_ids = set()

    def get_notification_type(self):
        return DOCUMENT_TYPE_MAPPING.get(self.document.document_type)

    def calculate_due_date(self):
        due_date = self.payload.get('due_date')
        # when a document is uploaded via the partner API we may not have a due date, we need to calculate the due_date
        if self.is_capital_call and due_date is None:
            # get the date of the file add 30 days
            date_str = self.document.file_date
            file_date = parser.parse(date_str)
            # TODO - make the due date a parameter of the company.
            due_date = file_date + timedelta(days=30)

        return due_date

    def create_capital_call(self, company_user: CompanyUser, investor: Investor):
        fund_investor, _ = FundInvestor.objects.get_or_create(fund=self.fund, investor=investor)
        return CapitalCall.objects.create(
            company_user=company_user,
            company=self.document.company,
            fund_investor=fund_investor,
            fund=self.fund,
            due_date=self.calculate_due_date()
        )

    def create_notification(self, company_user: CompanyUser, investor: Investor):
        capital_call = None
        if self.is_capital_call:
            capital_call = self.create_capital_call(
                company_user=company_user,
                investor=investor
            )

        notification = UserNotification.objects.create(
            user=company_user,
            fund=self.fund,
            investor=investor,
            company=self.company,
            document_date=self.document.file_date,
            due_date=self.calculate_due_date(),
            notification_type=self.get_notification_type(),
            capital_call=capital_call,
            is_admin_upload=self.is_admin_upload
        )
        NotificationDocument.objects.create(
            document=self.document,
            notification=notification
        )
        if self.skip_notification:
            return
        elif self.is_capital_call:
            async_task(CreateCapitalCallNotificationService.async_capital_call_creation_alert, notification.id)
        elif not self.is_capital_call:
            email_service = SendDocumentEmail(self.document.title, self.document.get_display_name_for_email(), notification.id)
            email_service.send_document_email()

    def create_capital_call_notification(self, company_user: CompanyUser, investor: Investor):
        print("I am in here")
        capital_call = self.document.capital_call_detail.capital_call

        notification = UserNotification.objects.create(
            user=company_user,
            fund=self.fund,
            investor=investor,
            company=self.company,
            document_date=self.document.file_date,
            due_date=self.calculate_due_date(),
            notification_type=self.get_notification_type(),
            fund_capital_call=capital_call,
            is_admin_upload=self.is_admin_upload
        )
        NotificationDocument.objects.create(
            document=self.document,
            notification=notification
        )
        if self.skip_notification:
            return
        async_task(CreateCapitalCallNotificationService.async_capital_call_creation_alert, notification.id)

    def process_investor(self, investor: Investor):
        for investor_user in investor.associated_users.exclude(company_user__user__deleted=True):
            company_user = investor_user.company_user
            if company_user.id in self.seen_company_user_ids:
                continue
            self.seen_company_user_ids.add(company_user.id)

            if self.is_capital_call and hasattr(self.document, 'capital_call_detail'):
                self.create_capital_call_notification(
                    company_user=company_user,
                    investor=investor
                )
            else:
                self.create_notification(
                    company_user=company_user,
                    investor=investor
                )

    def process_fund(self):
        for fund_investor in self.fund.fund_investors.all():
            self.process_investor(investor=fund_investor.investor)
