from api.applications.models import ApplicationCompanyDocument


class MarkRequiredOnceDocumentAsDeleted:
    @staticmethod
    def process(application_company_document: ApplicationCompanyDocument):
        if not application_company_document.completed:
            return

        company_document = application_company_document.company_document
        if not company_document.required_once:
            return

        ApplicationCompanyDocument.objects.filter(
            company_document=company_document,
            completed=False,
            application__user=application_company_document.application.user
        ).exclude(application=application_company_document.application).update(
            deleted=True
        )
