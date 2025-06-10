import uuid

from rest_framework import serializers

from api.applications.models import Application
from api.documents.models import Document, TaxDocument
from api.tax_records.models import TaxForm
from api.tax_records.models import TaxRecord
from api.tax_records.services.create_tax_document import CreateTaxDocumentService
from api.users.serializers import RetailUserInfoSerializer


class TaxFormSerializer(serializers.ModelSerializer):
    type = serializers.CharField(source='get_type_display')

    class Meta:
        model = TaxForm
        fields = ('form_id', 'version', 'type', 'description', 'details')


class DocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Document
        fields = ('document_id', 'title')


class BaseTaxDocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = TaxDocument
        fields = ('deleted',)

    def update(self, instance, validated_data):
        instance = super().update(instance, validated_data)
        application = self.context['application']
        application.start_tax_review()
        return instance


class TaxDocumentSerializer(serializers.Serializer):
    form_id = serializers.CharField(write_only=True)
    envelope_id = serializers.CharField(read_only=True)
    completed = serializers.CharField(read_only=True)
    form = TaxFormSerializer(read_only=True)
    document = DocumentSerializer(read_only=True)
    record_id = serializers.IntegerField(source='tax_record_id', read_only=True)
    field_id = serializers.CharField(source='form.form_id', read_only=True)
    id = serializers.IntegerField(read_only=True)
    deleted = serializers.BooleanField(read_only=True)
    is_completed = serializers.BooleanField(read_only=True, source='completed')


class TaxRecordSerializer(serializers.ModelSerializer):
    user = RetailUserInfoSerializer(read_only=True)
    tax_documents = TaxDocumentSerializer(read_only=True, many=True)

    class Meta:
        model = TaxRecord
        fields = '__all__'


class AdminTaxDocumentCreationSerializer(serializers.Serializer):
    form_id = serializers.CharField()
    file_data = serializers.FileField(write_only=True, required=True, allow_empty_file=False)
    application_id = serializers.IntegerField()

    def create(self, validated_data):
        company = self.context['company']
        application = Application.objects.get(
            company=self.context['company'],
            id=validated_data['application_id']
        )
        company_user = application.get_company_user()
        user = application.user
        if not application.tax_record:
            if application.kyc_record and application.kyc_record.tax_record:
                application.tax_record = application.kyc_record.tax_record
                application.save(update_fields=['tax_record'])
            else:
                tax_record = TaxRecord.objects.create(user=user, company=company)
                application.tax_record = tax_record
                application.save(update_fields=['tax_record'])

        CreateTaxDocumentService(
            tax_record=application.tax_record,
            company_user=company_user
        ).create_signed_document(
            form_id=validated_data['form_id'],
            file_data=validated_data['file_data'],
            partner_id=uuid.uuid4().hex,
            content_type=None,
            identify_by_form=True
        )

        application.start_tax_review()
        return validated_data
