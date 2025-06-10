import logging
import uuid

from django.core.management.base import BaseCommand
from django.utils import timezone

from api.agreements.models import FundAgreementDocument
from api.companies.models import Company
from api.documents.models import Document
from api.documents.services.upload_document import UploadDocumentService
from api.funds.models import Fund

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = 'Create Testing Fund Agreement Documents'

    def add_arguments(self, parser):
        parser.add_argument('--fund_slug', type=str, action='store')

    def handle(self, *args, **options):
        fund_slug = options.get('fund_slug')
        for company in Company.objects.all():
            with open('api/agreements/data/sample-form-3.pdf', 'rb') as agreement_file:
                if not Fund.objects.filter(company=company, slug=fund_slug).exists():
                    continue

                uploaded_document_info = UploadDocumentService.upload(
                    document_data=agreement_file,
                    content_type='application/pdf'
                )
                document = Document.objects.create(
                    partner_id=uuid.uuid4().hex,
                    company=company,
                    content_type=uploaded_document_info.content_type,
                    title='Test Agreement',
                    extension=uploaded_document_info.extension,
                    document_id=uploaded_document_info.document_id,
                    document_path=uploaded_document_info.document_path,
                    document_type=Document.DocumentType.FUND_AGREEMENT_DOCUMENT,
                    file_date=timezone.now().date(),
                    access_scope=Document.AccessScopeOptions.COMPANY.value,
                )
                for fund in Fund.objects.filter(company=company, slug=fund_slug):
                    FundAgreementDocument.objects.create(
                        fund=fund,
                        company=company,
                        document=document
                    )
