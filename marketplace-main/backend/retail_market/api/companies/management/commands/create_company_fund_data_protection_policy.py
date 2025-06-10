from django.db import transaction
import logging
import uuid

from django.core.management.base import BaseCommand
from django.utils import timezone

from api.companies.models import Company
from api.documents.models import Document
from api.documents.services.upload_document import UploadDocumentService
from api.funds.models import Fund
from api.documents.models import CompanyDataProtectionPolicyDocument
from api.companies.constants import CONTENT_TYPE_MS_DOC

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = 'Create Interest Statement for Investor'

    def handle(self, *args, **options):
        for company in Company.objects.all():
            with open('api/companies/data/data_protection_notice.docx', 'rb') as file:

                uploaded_document_info = UploadDocumentService.upload(
                    document_data=file,
                    content_type=CONTENT_TYPE_MS_DOC
                )
                with transaction.atomic():
                    document = Document.objects.create(
                        partner_id=uuid.uuid4().hex,
                        company=company,
                        content_type=uploaded_document_info.content_type,
                        title='Sample Data Protection Policy',
                        extension=uploaded_document_info.extension,
                        document_id=uploaded_document_info.document_id,
                        document_path=uploaded_document_info.document_path,
                        document_type=Document.DocumentType.FUND_DATA_PROTECTION_POLICY,
                        file_date=timezone.now().date(),
                        access_scope=Document.AccessScopeOptions.COMPANY.value,
                    )
                    CompanyDataProtectionPolicyDocument.objects.create(
                        company=company,
                        document=document
                    )


