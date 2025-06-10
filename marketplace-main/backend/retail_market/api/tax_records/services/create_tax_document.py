import uuid

from django.utils import timezone

from api.companies.models import CompanyUser
from api.documents.models import Document, TaxDocument
from api.documents.services.upload_document import UploadDocumentService
from api.libs.docusign.services import DocumentSigningService
from api.tax_records.models import TaxRecord, TaxForm


class CreateTaxDocumentService:
    def __init__(self, tax_record: TaxRecord, company_user: CompanyUser):
        self.tax_record = tax_record
        self.company_user = company_user
        self.user = company_user.user
        self.company = tax_record.company

    def create(self, form_id):
        user = self.user
        form = TaxForm.objects.get(form_id=form_id, company_id=self.company)
        envelope_args = {
            "signer_email": user.email,
            "signer_name": user.full_name or user.email,
            "signer_client_id": user.id,
            "file_name": form.file_name,
            "document_name": form.form_id,
            "email_subject": "Please sign your {} document".format(form.form_id)
        }

        docusign_service = DocumentSigningService()
        results = docusign_service.create_envelope(envelope_args)
        envelope_args['envelope_id'] = results.envelope_id

        document = Document.objects.create(
            partner_id=uuid.uuid4().hex,
            document_type=Document.DocumentType.TAX_DOCUMENT,
            document_id=uuid.uuid4().hex,
            company=self.company,
            uploaded_by=self.company_user,
            uploaded_by_user=self.company_user,
            title=form.file_name
        )
        TaxDocument.objects.create(
            document=document,
            form=form,
            tax_record=self.tax_record,
            envelope_id=envelope_args['envelope_id'],
            owner=self.user,
            partner_id=uuid.uuid4().hex
        )
        created_payload = {
            'envelope_id': envelope_args['envelope_id'],
            'completed': False,
            'document_id': document.document_id,
            'tax_record_id': self.tax_record.id,
            'form_id': form_id
        }
        return created_payload

    def create_signed_document(
            self,
            form_id,
            file_data,
            content_type,
            partner_id,
            identify_by_form=False
    ):
        form = TaxForm.objects.get(form_id=form_id, company_id=self.company)

        uploaded_document_info = UploadDocumentService.upload(
            document_data=file_data,
            content_type=content_type
        )
        document, _ = Document.objects.update_or_create(
            partner_id=partner_id,
            company=self.company,
            defaults={
                'content_type': uploaded_document_info.content_type,
                'title': form.file_name,
                'extension': uploaded_document_info.extension,
                'document_id': uploaded_document_info.document_id,
                'document_path': uploaded_document_info.document_path,
                'document_type': Document.DocumentType.TAX_DOCUMENT,
                'access_scope': Document.AccessScopeOptions.USER_ONLY,
                'file_date': timezone.now().date(),
                'uploaded_by_user': self.company_user
            }
        )
        if identify_by_form:
            TaxDocument.objects.update_or_create(
                tax_record=self.tax_record,
                form=form,
                defaults={
                    'document': document,
                    'envelope_id': None,
                    'partner_id': partner_id,
                    'owner': self.user,
                    'completed': True,
                    'deleted': False
                }
            )
        else:
            TaxDocument.objects.update_or_create(
                partner_id=partner_id,
                defaults={
                    'tax_record': self.tax_record,
                    'form': form,
                    'document': document,
                    'envelope_id': None,
                    'owner': self.user,
                    'completed': True
                }
            )

        created_payload = {
            'envelope_id': None,
            'completed': False,
            'document_id': document.document_id,
            'tax_record_id': self.tax_record.id,
            'form_id': form_id
        }
        return created_payload
