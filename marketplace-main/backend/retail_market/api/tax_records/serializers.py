import os
import uuid

from django.apps import apps
from django.utils import timezone
from django_pglocks import advisory_lock
from rest_framework import exceptions
from rest_framework import serializers

from api.comments.models import ModuleChoices
from api.comments.services.update_comment_status import UpdateCommentService
from api.companies.models import CompanyUser
from api.documents.models import Document, TaxDocument
from api.libs.docusign.services import DocumentSigningService
from api.libs.sidecar_blocks.document_store.document_api import DocumentData
from api.tax_records.models import TaxForm
from api.tax_records.models import TaxRecord
from api.tax_records.services.create_tax_document import CreateTaxDocumentService
from api.tax_records.services.tax_review import TaxReviewService
from api.users.serializers import RetailUserInfoSerializer


class TaxRecordSerializer(serializers.ModelSerializer):
    user = RetailUserInfoSerializer(read_only=True)
    status_display = serializers.CharField(read_only=True, source='get_status_display')

    def create(self, validated_data):
        application = self.context.get('application')
        validated_data['user'] = application.user
        validated_data['company'] = application.company

        if application.tax_record:
            return application.tax_record

        if application.kyc_record.tax_record:
            tax_record = application.kyc_record.tax_record
            application.tax_record = tax_record
            application.save(update_fields=['tax_record'])
            return tax_record

        company_user = application.get_company_user()

        tax_record = TaxRecord.objects.create(**validated_data)
        application.tax_record = tax_record
        application.save(update_fields=['tax_record'])

        application.kyc_record.tax_record = tax_record
        application.kyc_record.save(update_fields=['tax_record'])

        # fund = application.fund
        # on_boarding_workflow_service = UserOnBoardingWorkFlowService(
        #     fund=fund,
        #     company_user=company_user,
        #     transferred_application_id=application.id if application.is_transferred else None
        # )
        # on_boarding_workflow_service.get_or_create_tax_workflow()
        return tax_record

    def update(self, instance, validated_data):
        update_comment_status_service = UpdateCommentService(
            module=ModuleChoices.TAX_RECORD.value,
            instance=instance,
            update_values=validated_data
        )
        update_comment_status_service.update_comments_status()
        updated_instance = super().update(instance=instance, validated_data=validated_data)
        return updated_instance

    class Meta:
        model = TaxRecord
        fields = '__all__'
        read_only_fields = ('company', 'uuid', 'user')


class TaxFormSerializer(serializers.ModelSerializer):
    type = serializers.CharField(source='get_type_display')

    class Meta:
        model = TaxForm
        fields = ('form_id', 'version', 'type', 'description', 'details', 'help_link')


class DocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Document
        fields = ('document_id', 'title')


class TaxDocumentSerializer(serializers.Serializer):
    form_id = serializers.CharField(write_only=True)
    envelope_id = serializers.CharField(read_only=True)
    completed = serializers.CharField(read_only=True)
    document_id = serializers.CharField(read_only=True)
    form = TaxFormSerializer(read_only=True)
    document = DocumentSerializer(read_only=True)
    record_id = serializers.IntegerField(source='tax_record_id', read_only=True)
    field_id = serializers.CharField(source='form.form_id', read_only=True)

    def create(self, attrs):
        tax_record_id = self.context['tax_record_id']
        user = self.context['requested_user']
        tax_record = TaxRecord.objects.get(uuid=tax_record_id, user=user)
        company_user = CompanyUser.objects.get(company=tax_record.company, user=user)
        return CreateTaxDocumentService(
            company_user=company_user,
            tax_record=tax_record,
        ).create(form_id=attrs['form_id'])


class SigningURLSerializer(serializers.Serializer):
    envelope_id = serializers.CharField(write_only=True)
    signing_url = serializers.CharField(read_only=True)


class SaveFormSerializer(serializers.ModelSerializer):
    lookup_field = 'envelope_id'
    document = DocumentSerializer(read_only=True)

    def create_task(self, instance, user):
        tax_record = instance.tax_record
        tax_documents_count = TaxDocument.objects.filter(tax_record=tax_record, deleted=False).count()
        completed_documents_count = TaxDocument.objects.filter(
            tax_record=tax_record,
            completed=True,
            deleted=False
        ).count()
        if tax_documents_count == completed_documents_count:
            application = self.context.get('application')
            if application:
                TaxReviewService(tax_record=tax_record, fund=application.fund, user=user).start_review()

    def get_store_tax_signed_documents(self, instance: TaxDocument, company_user: CompanyUser):
        docusign_service = DocumentSigningService()
        envelope_id = instance.envelope_id
        document = instance.document
        envelope_documents = docusign_service.get_envelope_documents(envelope_id=envelope_id)
        file_path = docusign_service.get_document(
            envelope_id,
            envelope_documents=envelope_documents
        )
        if not file_path:
            return None

        document_path = self.save_form(file_path)
        if not document_path:
            return

        document.document_path = document_path
        document.extension = "pdf"
        document.content_type = "application/pdf"
        document.file_date = timezone.now().date()
        document.save()
        document.tax_document.completed = True
        document.tax_document.save()
        # if we get the document we proceed with the certificate
        file_path = docusign_service.get_document(
            envelope_id=envelope_id,
            envelope_documents=envelope_documents,
            certificate=True
        )
        document_path = self.save_form(file_path)
        if not document_path:
            return None

        certificate = Document.objects.create(
            partner_id=uuid.uuid4().hex,
            document_type=Document.DocumentType.TAX_DOCUMENT,
            document_id=uuid.uuid4().hex,
            company=company_user.company,
            uploaded_by=company_user,
            uploaded_by_user=company_user,
            title='certificate_' + instance.form.file_name,
            document_path=document_path,
            extension="pdf",
            content_type="application/pdf",
            file_date=timezone.now().date(),
        )
        instance.certificate = certificate
        instance.save()
        return instance

    def update(self, instance: TaxDocument, validated_data):
        application = self.context['application']
        if instance.owner != application.user:
            raise exceptions.PermissionDenied

        if instance.certificate:
            return instance

        company_user = application.get_company_user()

        updated_instance = None
        with advisory_lock(instance.envelope_id, wait=False) as acquired:
            if acquired:
                updated_instance = self.get_store_tax_signed_documents(
                    instance=instance,
                    company_user=company_user
                )
                if updated_instance:
                    comment_question_identifier = f'{updated_instance.form.form_id}-{updated_instance.form.version}'
                    UpdateCommentService(
                        module=ModuleChoices.TAX_RECORD.value,
                        instance=instance.tax_record,
                        update_values={}
                    ).update_question_comments(question_identifier=comment_question_identifier)

        if not updated_instance:
            raise exceptions.NotFound(
                detail="Couldn't get completed envelope %s in Docusign" % instance.envelope_id)
        self.create_task(updated_instance, company_user.user)
        return updated_instance

    def save_form(self, path):
        if os.path.exists(path):
            config = apps.get_app_config('documents')
            upload_context = config.context
            document_api = config.document_api
            with open(path, 'rb') as fh:
                document_data = DocumentData("application/pdf", fh)
                document_path = document_api.upload(upload_context, document_data)
            os.remove(path)
            return document_path
        return None

    class Meta:
        model = TaxDocument
        fields = ('document',)
        read_only_fields = ('document',)
