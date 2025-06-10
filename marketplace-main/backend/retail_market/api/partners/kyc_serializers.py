import uuid

from django.http import Http404
from django.utils import timezone
from rest_enumfield import EnumField
from rest_framework import serializers
from rest_framework.exceptions import ValidationError
from slugify import slugify

from api.applications.models import Application, ApplicationDocumentsRequests
from api.cards.models import Workflow as KYCWorkflow
from api.cards.utils import get_fund_kyc_workflow_name
from api.companies.models import CompanyUser
from api.constants.kyc_investor_types import KYCInvestorType
from api.documents.models import Document, KYCDocument, TaxDocument, ApplicationRequestDocument
from api.documents.services.upload_document import UploadDocumentService
from api.kyc_records.models import KYCRecord
from api.partners.constants import InvestorTypeEnum, KycTaxDocumentTypeEnum, ContentTypeEnum, TAX_DOCUMENTS_MAPPING, \
    get_kyc_document_type, INVESTOR_TYPE_MAPPING
from api.partners.serializers import CHAR_FIELD_MIN_LENGTH
from api.tax_records.models import TaxRecord
from api.tax_records.services.create_tax_document import CreateTaxDocumentService
from api.users.models import RetailUser


class KYCPartnerSerializer(serializers.Serializer):
    first_name = serializers.CharField(required=True)
    last_name = serializers.CharField(required=True)
    email = serializers.EmailField(required=True)
    investor_account_code = serializers.CharField(required=True)
    investing_as = EnumField(choices=InvestorTypeEnum)
    sidecar_id = serializers.CharField(read_only=True)

    def create(self, validated_data):
        company = self.context['company']
        investing_as = INVESTOR_TYPE_MAPPING[validated_data['investing_as'].value]
        user, _ = RetailUser.objects.update_or_create(
            email__iexact=validated_data['email'],
            defaults={
                'email': validated_data['email'],
                'username': validated_data['email'],
                'first_name': validated_data.get('first_name'),
                'last_name': validated_data.get('last_name'),
            }
        )
        company_user, _ = CompanyUser.objects.get_or_create(
            user=user,
            company=company,
            defaults={
                'partner_id': uuid.uuid4().hex,
            }
        )

        name = get_fund_kyc_workflow_name(company=company, vehicle_type=KYCInvestorType(investing_as).name)
        workflow = KYCWorkflow.objects.get(
            company=company,
            slug=slugify(name),
            type=KYCWorkflow.FLOW_TYPES.KYC.value
        )

        kyc_record, _ = KYCRecord.objects.update_or_create(
            user=user,
            company=company,
            kyc_investor_type=investing_as,
            workflow=workflow,
            defaults={
                'first_name': validated_data['first_name'],
                'last_name': validated_data['last_name'],
            }
        )
        validated_data['sidecar_id'] = kyc_record.uuid
        return validated_data

class KycApplicationDocumentSerializer(serializers.Serializer):
    partner_id = serializers.CharField(required=True, min_length=CHAR_FIELD_MIN_LENGTH)
    uuid = serializers.UUIDField(required=True)
    application_id = serializers.CharField(required=True)
    document_name = serializers.CharField(required=True)
    document_description = serializers.CharField(required=True)
    file_content_type = EnumField(choices=ContentTypeEnum)
    file_data = serializers.FileField(write_only=True, required=True, allow_empty_file=False)

    def validate(self, attrs):
        application_id = attrs['application_id']
        company = self.context['company']

        try:
            application = Application.objects.get(pk=application_id, company=company)
        except Application.DoesNotExist:
            raise ValidationError('No Application found with id: {}'.format(application_id))

        attrs['application'] = application

        return attrs

    def create(self, validated_data):
        company = self.context['company']
        application = validated_data['application']
        document_name = validated_data['document_name']
        document_description = validated_data['document_description']
        content_type = validated_data['file_content_type'].value
        partner_id = validated_data['partner_id']
        uuid = validated_data['uuid']

        # Company user must be created before the document is uploaded
        try:
            company_user = CompanyUser.objects.get(company=company, user=application.user)
        except CompanyUser.DoesNotExist:
            raise Http404("no matching user found for this document")

        uploaded_document_info = UploadDocumentService.upload(
            document_data=validated_data['file_data'],
            content_type=content_type
        )

        document, _ = Document.objects.update_or_create(
            partner_id=partner_id,
            company=company,
            defaults={
                'content_type': content_type,
                'title': document_name,
                'extension': uploaded_document_info.extension,
                'document_id': uploaded_document_info.document_id,
                'document_path': uploaded_document_info.document_path,
                'document_type': Document.DocumentType.KYC_DOCUMENT,
                'access_scope': Document.AccessScopeOptions.USER_ONLY,
                'file_date': timezone.now().date(),
                'uploaded_by_user': company_user
            }
        )
        doc_request, _ = ApplicationDocumentsRequests.objects.update_or_create(
            uuid=uuid,
            application=application,
            defaults={
                'status': ApplicationDocumentsRequests.Status.APPROVED,
                'document_name': document_name,
                'document_description': document_description,
            }
        )
        ApplicationRequestDocument.objects.update_or_create(
            application_document_request=doc_request,
            defaults={
                'document':document
            }
        )

        return validated_data


class KycDocumentSerializer(serializers.Serializer):
    id = serializers.CharField(required=True, min_length=CHAR_FIELD_MIN_LENGTH)
    sidecar_id = serializers.CharField(required=True)
    document_type = EnumField(choices=KycTaxDocumentTypeEnum)
    title = serializers.CharField(required=True)
    file_content_type = EnumField(choices=ContentTypeEnum)
    file_data = serializers.FileField(write_only=True, required=True, allow_empty_file=False)

    def validate(self, attrs):
        sidecar_id = attrs['sidecar_id']
        company = self.context['company']
        try:
            kyc_record = KYCRecord.objects.get(uuid=sidecar_id, company=company)
        except KYCRecord.DoesNotExist:
            raise ValidationError('No KYC Record found with id: {}'.format(sidecar_id))

        attrs['kyc_record'] = kyc_record

        document_type = attrs['document_type'].value
        tax_form_id = TAX_DOCUMENTS_MAPPING.get(document_type)
        if tax_form_id:
            if TaxDocument.objects.filter(
                    document__partner_id=attrs['id']
            ).exclude(tax_record__user_id=kyc_record.user_id).exists():
                raise ValidationError('This document belongs to another user tax document')
        else:
            if KYCDocument.objects.filter(
                    document__partner_id=attrs['id']
            ).exclude(kyc_record_id=kyc_record.id).exists():
                raise ValidationError('This document belongs to another kyc record')

        return attrs

    def create_kyc_document(self, validated_data):
        company = self.context['company']
        partner_id = validated_data['id']
        kyc_record = validated_data['kyc_record']
        title = validated_data['title']
        content_type = validated_data['file_content_type'].value
        document_type = validated_data['document_type'].value

        # Company user is created before the document is uploaded
        try:
            company_user = CompanyUser.objects.get(company=company, user=kyc_record.user)
        except CompanyUser.DoesNotExist:
            raise Http404("no matching user found for this document")

        uploaded_document_info = UploadDocumentService.upload(
            document_data=validated_data['file_data'],
            content_type=content_type
        )

        document, _ = Document.objects.update_or_create(
            partner_id=partner_id,
            company=company,
            defaults={
                'content_type': content_type,
                'title': title,
                'extension': uploaded_document_info.extension,
                'document_id': uploaded_document_info.document_id,
                'document_path': uploaded_document_info.document_path,
                'document_type': Document.DocumentType.KYC_DOCUMENT,
                'access_scope': Document.AccessScopeOptions.USER_ONLY,
                'file_date': timezone.now().date(),
                'uploaded_by_user': company_user
            }
        )

        mapped_document_type = get_kyc_document_type(kyc_record=kyc_record, document_type=document_type)
        KYCDocument.objects.update_or_create(
            partner_id=partner_id,
            defaults={
                'document': document,
                'deleted': False,
                'kyc_record_file_id': mapped_document_type,
                'kyc_record': kyc_record
            }
        )

    @staticmethod
    def create_tax_document(validated_data, tax_form_id):
        kyc_record = validated_data['kyc_record']  # type: KYCRecord
        company = kyc_record.company
        user = kyc_record.user

        if not kyc_record.tax_record:
            tax_record = TaxRecord.objects.create(user=user, company=company)
            kyc_record.tax_record = tax_record
            kyc_record.save()
        else:
            tax_record = kyc_record.tax_record

        company_uer, _ = CompanyUser.objects.get_or_create(company=company, user=user)
        CreateTaxDocumentService(
            tax_record=tax_record,
            company_user=company_uer
        ).create_signed_document(
            form_id=tax_form_id,
            file_data=validated_data['file_data'],
            content_type=validated_data['file_content_type'].value,
            partner_id=validated_data['id']
        )

        Application.objects.filter(
            kyc_record_id=kyc_record.id,
            tax_record__isnull=True
        ).update(
            tax_record=tax_record
        )

    def create(self, validated_data):
        document_type = validated_data['document_type'].value
        tax_form_id = TAX_DOCUMENTS_MAPPING.get(document_type)
        if tax_form_id:
            self.create_tax_document(validated_data=validated_data, tax_form_id=tax_form_id)
        else:
            self.create_kyc_document(validated_data=validated_data)

        return validated_data
