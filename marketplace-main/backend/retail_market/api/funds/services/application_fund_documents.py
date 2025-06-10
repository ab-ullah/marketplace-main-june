from django.db.models import Q

from api.documents.models import FundDocument


class ApplicationFundDocuments:
    def __init__(self, application):
        self.application = application

    def get_documents(self, exclude: dict = None, **kwargs):
        application = self.application
        fund = application.fund
        company = application.company
        query = FundDocument.objects.filter(
            fund=fund,
            document__company_id=company.id,
            **kwargs
        )

        if application.gp_signing_completed_at:
            query = FundDocument.non_deleted.filter(
                fund=fund,
                document__company_id=company.id,
                **kwargs
            )

        if exclude:
            query = query.exclude(**exclude)
        if not application.share_class:
            query = query.filter(Q(document_for=None) | Q(document_for__isnull=True))
        else:
            query = query.filter(
                Q(document_for=None) | Q(document_for__isnull=True) | Q(document_for__id=application.share_class_id)
            )

        return query.order_by('id').distinct('id')
