import uuid
from rest_framework import serializers

from api.companies.models import Company, CompanyProfile, CompanyDocument, CompanyReportDocument
from api.companies.serializers import FundVehicleSerializer
from api.documents.models import Document
from api.documents.serializers import DocumentSerializer
from api.documents.services.upload_document import UploadDocumentService, UploadedDocumentInfo


class CompanyProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = CompanyProfile
        fields = '__all__'


class CompanyDocumentSerializer(serializers.ModelSerializer):
    document_file = serializers.FileField(write_only=True)
    document = DocumentSerializer(read_only=True)

    class Meta:
        model = CompanyDocument
        fields = '__all__'
        read_only_fields = ('company', 'document')

    def create(self, validated_data):
        company = self.context['company']
        document_file = validated_data.pop('document_file')
        uploaded_document_info = UploadDocumentService.upload(
            document_data=document_file
        )  # type: UploadedDocumentInfo

        document = Document.objects.create(
            title=validated_data['name'],
            content_type=uploaded_document_info.content_type,
            uploaded_by_admin=self.context['admin_user'],
            document_id=uploaded_document_info.document_id,
            document_path=uploaded_document_info.document_path,
            extension=uploaded_document_info.extension,
            partner_id=uuid.uuid4().hex,
            company=company,
            access_scope=Document.AccessScopeOptions.COMPANY.value
        )
        validated_data['company'] = company
        validated_data['document'] = document
        CompanyDocument.objects.create(**validated_data)
        return validated_data


class CompanySerializer(serializers.ModelSerializer):
    company_profile = CompanyProfileSerializer(read_only=True)
    company_required_documents = CompanyDocumentSerializer(read_only=True, many=True)

    class Meta:
        model = Company
        fields = '__all__'


class CompanyReportSerializer(serializers.ModelSerializer):
    year = serializers.IntegerField(source='report_date.year')
    vehicles = FundVehicleSerializer(many=True)
    document = DocumentSerializer()

    class Meta:
        model = CompanyReportDocument
        fields = '__all__'



class CompanyDocumentOptionSerializer(serializers.ModelSerializer):
    label = serializers.CharField(source='name')
    value = serializers.CharField(source='id')

    class Meta:
        model = CompanyDocument
        fields = ('label', 'value')