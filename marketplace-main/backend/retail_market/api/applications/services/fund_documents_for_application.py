from django.db.models import Q

from api.applications.models import Application
from api.companies.models import CompanyUser
from api.documents.models import FundDocument
from api.funds.models import FundDocumentResponse
from api.funds.serializers import FundDocumentSerializer


class ApplicationFundDocumentsService:
    def __init__(self, application: Application):
        self.application = application
        self.company_user = self.get_company_user()

    def get_company_user(self):
        return CompanyUser.objects.get(company=self.application.company, user=self.application.user)

    def get_fund_documents(self):
        application = self.application
        fund = application.fund
        base_qs = FundDocument.objects.filter(
            fund=fund,
            document__company_id=application.company_id,
        )
        if not application.share_class:
            return base_qs.filter(Q(document_for=None) | Q(document_for__isnull=True))

        return base_qs.filter(
            Q(document_for=None) | Q(document_for__isnull=True) | Q(document_for__id=application.share_class_id)
        ).order_by('id').distinct('id')

    def get_response(self):
        try:
            return FundDocumentResponse.objects.get(fund=self.application.fund, user=self.company_user).response_json
        except FundDocumentResponse.DoesNotExist:
            return {}

    def process(self):
        fund_documents = FundDocumentSerializer(self.get_fund_documents(), many=True).data
        response = self.get_response()
        for fund_document in fund_documents:
            fund_document['response'] = response.get(fund_document['id'])
        return fund_documents
