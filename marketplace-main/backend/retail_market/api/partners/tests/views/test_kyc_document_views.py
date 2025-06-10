import io
import uuid

from rest_framework import status
from rest_framework.reverse import reverse

from api.applications.tests.factories import FundFactory
from api.applications.models import Application, ApplicationDocumentsRequests
from api.documents.models import ApplicationRequestDocument
from api.cards.default.individual_cards import ID_DOC_IMAGE_FILE_TYPE
from api.companies.services.company_service import LASALLE_COMPANY_NAME, CompanyService
from api.constants.headers import API_KEY_HEADER
from api.constants.id_documents import IdDocuments
from api.constants.kyc_investor_types import KYCInvestorType
from api.currencies.models import Currency
from api.documents.models import TaxDocument, Document, KYCDocument
from api.documents.tests.factories import DocumentFactory
from api.kyc_records.models import KYCRecord
from api.kyc_records.tests.factories import KYCRecordFactory
from api.partners.constants import KycTaxDocumentTypeEnum, TAX_DOCUMENTS_MAPPING
from api.partners.tests.factories import UserFactory, CompanyUserFactory
from api.tax_records.models import TaxRecord
from api.tax_records.services.load_tax_forms import CreateCompanyTaxFormsService
from api.tax_records.tests.factories import TaxRecordFactory, TaxDocumentFactory
from core.base_tests import BaseTestCase


class PartnerKYCDocumentViewsAPITestCase(BaseTestCase):

    def setUp(self):
        Document.objects.all().delete()
        company_info = CompanyService.create_company(company_name=LASALLE_COMPANY_NAME)
        self.request_count = 0
        self.company = company_info['company']
        self.api_token = company_info['token']
        self.base_currency = Currency.objects.get(
            code='USD',
            company=self.company
        )
        CreateCompanyTaxFormsService(company=self.company).create()
        self.create_countries()
        self.create_card_workflow(company=self.company)

    def get_headers(self):
        self.request_count = self.request_count + 1

        return {
            API_KEY_HEADER: self.api_token,
            "Sidecar-Version": "2021-09-01",
            "Sidecar-Idempotency-Key": format("requests-{}", str(self.request_count))
        }

    def test_create_kyc_record_document_view_errors(self):
        url = reverse('kyc-document-create-api-view')
        content_type = "application/pdf"
        contents = b"The greatest document in human history"
        origin_file_obj = io.BytesIO(contents)
        payload = {
            "sidecar_id": uuid.uuid4().hex,
            "document_type": KycTaxDocumentTypeEnum.LIST_OF_AUTHORIZED_SIGNATORIES.value,
            "title": KycTaxDocumentTypeEnum.LIST_OF_AUTHORIZED_SIGNATORIES.value,
            "file_content_type": content_type,
            "file_data": origin_file_obj,
            "id": 'partnerId',
        }

        response = self.client.post(url, data=payload)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

        origin_file_obj = io.BytesIO(contents)
        payload['file_data'] = origin_file_obj
        response = self.client.post(url, data=payload, **self.get_headers())
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['non_field_errors'][0], f'No KYC Record found with id: {payload["sidecar_id"]}')

    def test_create_kyc_record_document_view(self):
        url = reverse('kyc-document-create-api-view')
        kyc_record = KYCRecordFactory(company=self.company)
        KYCRecordFactory(company=self.company)
        content_type = "application/pdf"
        for i in range(2):
            contents = b"The greatest document in human history"
            origin_file_obj = io.BytesIO(contents)
            payload = {
                "sidecar_id": kyc_record.uuid,
                "document_type": KycTaxDocumentTypeEnum.LIST_OF_AUTHORIZED_SIGNATORIES.value,
                "file_content_type": content_type,
                "file_data": origin_file_obj,
                "title": 'auth-signatures.pdf',
                "id": 'partnerId',
            }

            origin_file_obj = io.BytesIO(contents)
            payload['file_data'] = origin_file_obj
            response = self.client.post(url, data=payload, **self.get_headers())
            self.assertEqual(response.status_code, status.HTTP_201_CREATED)

            kyc_record.refresh_from_db()
            self.assertEqual(Document.objects.count(), 1)
            self.assertEqual(kyc_record.kyc_documents.count(), 1)
            self.assertEqual(kyc_record.kyc_documents.filter(
                kyc_record_file_id=KycTaxDocumentTypeEnum.LIST_OF_AUTHORIZED_SIGNATORIES.value
            ).count(), 1)

    def test_create_application_request_document_view(self):
        user = UserFactory()
        CompanyUserFactory(user=user, company=self.company)
        url = reverse('kyc-application-document-api-view')
        fund = FundFactory(company=self.company)
        application = Application.objects.create(
            fund=fund,
            company=self.company,
            user=user
        )
        partner_id = "import-sow-1"
        guid = uuid.uuid4()
        content_type = "application/pdf"

        for i in range(2):
            contents = b"The greatest document in human history"
            origin_file_obj = io.BytesIO(contents)
            payload = {
                "partner_id": partner_id,
                "uuid": guid,
                "application_id": application.id,
                "document_name": "Source of Wealth",
                "document_description": "Imported Documentation for source of wealth",
                "file_content_type": content_type,
                "file_data": origin_file_obj,
            }

            origin_file_obj = io.BytesIO(contents)
            payload['file_data'] = origin_file_obj
            response = self.client.post(url, data=payload, **self.get_headers())
            self.assertEqual(response.status_code, status.HTTP_201_CREATED)

            self.assertEqual(ApplicationDocumentsRequests.objects.count(), 1)
            app_doc_request = ApplicationDocumentsRequests.objects.first()
            app_request_doc = ApplicationRequestDocument.objects.first()

            self.assertEqual(app_doc_request.status, 4)
            self.assertEqual(app_doc_request.uuid, guid)
            self.assertEqual(app_doc_request.document_name, "Source of Wealth")
            self.assertEqual(app_doc_request.document_description, "Imported Documentation for source of wealth")
            self.assertEqual(app_request_doc.application_document_request.id, app_doc_request.id)

            uploaded_doc = app_request_doc.document
            self.assertEqual(uploaded_doc.partner_id, partner_id)

    def test_document_with_another_kyc_validation(self):
        url = reverse('kyc-document-create-api-view')
        kyc_record = KYCRecordFactory(company=self.company)
        kyc_record_2 = KYCRecordFactory(company=self.company)
        document = DocumentFactory(partner_id='partnerId', company=self.company)
        KYCDocument.objects.create(
            kyc_record=kyc_record_2,
            document=document,
            kyc_record_file_id=KycTaxDocumentTypeEnum.LIST_OF_AUTHORIZED_SIGNATORIES.value
        )

        content_type = "application/pdf"
        contents = b"The greatest document in human history"
        origin_file_obj = io.BytesIO(contents)
        payload = {
            "sidecar_id": kyc_record.uuid,
            "document_type": KycTaxDocumentTypeEnum.LIST_OF_AUTHORIZED_SIGNATORIES.value,
            "title": "auth-signatures.pdf",
            "file_content_type": content_type,
            "file_data": origin_file_obj,
            "id": 'partnerId',
        }

        origin_file_obj = io.BytesIO(contents)
        payload['file_data'] = origin_file_obj
        response = self.client.post(url, data=payload, **self.get_headers())
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['non_field_errors'][0], 'This document belongs to another kyc record')

    def test_create_kyc_record_trust_document_view(self):
        url = reverse('kyc-document-create-api-view')
        kyc_record = KYCRecordFactory(
            company=self.company,
            kyc_investor_type=KYCInvestorType.TRUST.value
        )
        content_type = "application/pdf"
        contents = b"The greatest document in human history"
        origin_file_obj = io.BytesIO(contents)
        payload = {
            "sidecar_id": kyc_record.uuid,
            "document_type": KycTaxDocumentTypeEnum.POWER_OF_ATTORNEY_AUTHORIZATION_LETTER.value,
            "title": KycTaxDocumentTypeEnum.POWER_OF_ATTORNEY_AUTHORIZATION_LETTER.value,
            "file_content_type": content_type,
            "file_data": origin_file_obj,
            "id": 'partnerId',
        }

        origin_file_obj = io.BytesIO(contents)
        payload['file_data'] = origin_file_obj
        response = self.client.post(url, data=payload, **self.get_headers())
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        kyc_record.refresh_from_db()
        self.assertEqual(kyc_record.kyc_documents.count(), 1)
        self.assertEqual(kyc_record.kyc_documents.filter(
            kyc_record_file_id='trust_applicable_resolutions_powers_of_attorney_or_authorization letters'
        ).count(), 1)

    def test_create_kyc_record_private_company_document_view(self):
        url = reverse('kyc-document-create-api-view')
        kyc_record = KYCRecordFactory(
            company=self.company,
            kyc_investor_type=KYCInvestorType.PRIVATE_COMPANY.value
        )
        content_type = "application/pdf"
        contents = b"The greatest document in human history"
        origin_file_obj = io.BytesIO(contents)
        payload = {
            "sidecar_id": kyc_record.uuid,
            "document_type": KycTaxDocumentTypeEnum.POWER_OF_ATTORNEY_AUTHORIZATION_LETTER.value,
            "title": KycTaxDocumentTypeEnum.POWER_OF_ATTORNEY_AUTHORIZATION_LETTER.value,
            "file_content_type": content_type,
            "file_data": origin_file_obj,
            "id": 'partnerId',
        }

        origin_file_obj = io.BytesIO(contents)
        payload['file_data'] = origin_file_obj
        response = self.client.post(url, data=payload, **self.get_headers())
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        kyc_record.refresh_from_db()
        self.assertEqual(kyc_record.kyc_documents.count(), 1)
        self.assertEqual(kyc_record.kyc_documents.filter(
            kyc_record_file_id='applicable_resolutions_powers_of_attorney_or_authorization letters'
        ).count(), 1)

    def test_create_id_doc_image_document_view(self):
        url = reverse('kyc-document-create-api-view')
        kyc_record = KYCRecordFactory(company=self.company)  # type: KYCRecord
        content_type = "application/pdf"
        documents_mapping = (
            (KycTaxDocumentTypeEnum.NATIONAL_ID_CARD.value, IdDocuments.NATIONAL_ID_CARD.value),
            (KycTaxDocumentTypeEnum.PASSPORT.value, IdDocuments.PASSPORT.value),
            (KycTaxDocumentTypeEnum.DRIVER_LICENSE.value, IdDocuments.DRIVERS_LICENSE.value),
        )

        for document_type, id_document_type in documents_mapping:
            contents = b"The greatest document in human history"
            origin_file_obj = io.BytesIO(contents)
            payload = {
                "sidecar_id": kyc_record.uuid,
                "document_type": document_type,
                "title": document_type,
                "file_content_type": content_type,
                "file_data": origin_file_obj,
                "id": 'partnerId',
            }

            origin_file_obj = io.BytesIO(contents)
            payload['file_data'] = origin_file_obj
            response = self.client.post(url, data=payload, **self.get_headers())
            self.assertEqual(response.status_code, status.HTTP_201_CREATED)

            kyc_record.refresh_from_db()
            self.assertEqual(kyc_record.kyc_documents.count(), 1)
            self.assertEqual(kyc_record.kyc_documents.filter(
                kyc_record_file_id=ID_DOC_IMAGE_FILE_TYPE
            ).count(), 1)
            self.assertEqual(kyc_record.id_document_type, id_document_type)

    def test_tax_document(self):
        url = reverse('kyc-document-create-api-view')
        kyc_record = KYCRecordFactory(company=self.company)  # type: KYCRecord
        content_type = "application/pdf"
        for document_type, tax_form_id in TAX_DOCUMENTS_MAPPING.items():
            contents = b"The greatest document in human history"
            origin_file_obj = io.BytesIO(contents)
            payload = {
                "sidecar_id": kyc_record.uuid,
                "document_type": document_type,
                "title": document_type,
                "file_content_type": content_type,
                "file_data": origin_file_obj,
                "id": f'partnerId{tax_form_id}',
            }

            origin_file_obj = io.BytesIO(contents)
            payload['file_data'] = origin_file_obj
            response = self.client.post(url, data=payload, **self.get_headers())
            self.assertEqual(response.status_code, status.HTTP_201_CREATED)

            kyc_record.refresh_from_db()

            self.assertEqual(TaxRecord.objects.count(), 1)
            tax_record = TaxRecord.objects.first()
            tax_document = TaxDocument.objects.filter(
                tax_record=tax_record,
                form__form_id=tax_form_id,
                completed=True
            )
            self.assertEqual(tax_document.count(), 1)

    def test_tax_document_with_same_partner_id(self):
        url = reverse('kyc-document-create-api-view')
        kyc_record = KYCRecordFactory(company=self.company)  # type: KYCRecord
        content_type = "application/pdf"
        for i in range(2):
            contents = b"The greatest document in human history"
            origin_file_obj = io.BytesIO(contents)
            payload = {
                "sidecar_id": kyc_record.uuid,
                "document_type": KycTaxDocumentTypeEnum.TAX_W9.value,
                "title": "w9.pdf",
                "file_content_type": content_type,
                "file_data": origin_file_obj,
                "id": f'partnerId',
            }

            origin_file_obj = io.BytesIO(contents)
            payload['file_data'] = origin_file_obj
            response = self.client.post(url, data=payload, **self.get_headers())
            self.assertEqual(response.status_code, status.HTTP_201_CREATED)

            kyc_record.refresh_from_db()

            self.assertEqual(TaxRecord.objects.count(), 1)
            self.assertEqual(Document.objects.count(), 1)
            tax_record = TaxRecord.objects.first()
            tax_document = TaxDocument.objects.filter(
                tax_record=tax_record,
                form__form_id='W-9',
                completed=True
            )
            self.assertEqual(tax_document.count(), 1)

    def test_document_with_another_tax_record(self):
        url = reverse('kyc-document-create-api-view')
        tax_record = TaxRecordFactory(company=self.company)
        tax_document = TaxDocumentFactory(tax_record=tax_record, owner=tax_record.user)
        tax_document.document.partner_id = 'partnerId'
        tax_document.document.save()

        kyc_record = KYCRecordFactory(company=self.company)
        contents = b"The greatest document in human history"
        origin_file_obj = io.BytesIO(contents)
        content_type = "application/pdf"
        payload = {
            "sidecar_id": kyc_record.uuid,
            "document_type": KycTaxDocumentTypeEnum.TAX_W9.value,
            "title": "w9.pdf",
            "file_content_type": content_type,
            "file_data": origin_file_obj,
            "id": f'partnerId',
        }

        origin_file_obj = io.BytesIO(contents)
        payload['file_data'] = origin_file_obj
        response = self.client.post(url, data=payload, **self.get_headers())
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['non_field_errors'][0], 'This document belongs to another user tax document')
