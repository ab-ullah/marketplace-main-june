from api.applications.models import Application
from api.documents.models import FundDocument
from api.funds.models import FundDocumentResponse
from api.notifications.models import UserNotification, NotificationDocument


class CreateNotificationFromApplicationDocument:
    def __init__(self, application: Application):
        self.application = application
        self.company_uer = application.get_company_user()

    def create_notification(self, document, notification_type):
        application = self.application
        company_user = application.get_company_user()

        if NotificationDocument.objects.filter(
                document=document,
                notification__user=company_user,
                notification__fund=application.fund
        ).exists():
            return

        notification = UserNotification.objects.create(
            user=company_user,
            fund=application.fund,
            company=application.company,
            document_date=document.file_date,
            notification_type=notification_type,
        )

        NotificationDocument.objects.get_or_create(
            document=document,
            notification=notification
        )

    def process(self):
        application = self.application
        if not application.is_allocation_approved:
            return

        if application.tax_record:
            for tax_document in application.tax_record.tax_documents.all():
                self.create_notification(
                    document=tax_document.document,
                    notification_type=UserNotification.NotificationTypeChoice.TAX.value
                )

        for agreement_document in application.application_agreements.all():
            if not agreement_document.is_fully_completed():
                continue

            self.create_notification(
                document=agreement_document.signed_document,
                notification_type=UserNotification.NotificationTypeChoice.AGREEMENT.value
            )

        for company_document in application.application_company_documents.all():
            if not company_document.is_fully_completed():
                continue

            self.create_notification(
                document=company_document.get_signed_document(),
                notification_type=UserNotification.NotificationTypeChoice.COMPANY_DOCUMENT.value
            )
        try:
            fund_document_response = FundDocumentResponse.objects.get(
                user=self.company_uer,
                fund=application.fund
            )
        except FundDocumentResponse.DoesNotExist:
            fund_document_response = None

        if fund_document_response and fund_document_response.response_json:
            docs_to_fetch = []
            for fund_doc_id, signed in fund_document_response.response_json.items():
                if not signed:
                    continue
                docs_to_fetch.append(int(fund_doc_id))

            if docs_to_fetch:
                fund_documents = FundDocument.objects.filter(id__in=docs_to_fetch)
                for fund_document in fund_documents:
                    self.create_notification(
                        document=fund_document.document,
                        notification_type=UserNotification.NotificationTypeChoice.FUND_DOCUMENT.value
                    )
