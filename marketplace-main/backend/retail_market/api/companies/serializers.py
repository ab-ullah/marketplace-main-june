from django.utils import timezone
from rest_framework import serializers

from api.companies.models import CompanyProfile, CompanyFAQ, CompanyFundVehicle, CompanyTheme
from api.companies.models import CompanyUser, CompanyToken, Company
from api.documents.models import Document
from api.documents.serializers import DocumentSerializer
from api.documents.services.upload_document import UploadDocumentService, UploadedDocumentInfo
from api.libs.utils.identifiers import get_uuid
from api.libs.utils.user_name import get_full_name
from api.users.serializers import RetailUserSerializer


class CompanyUserSerializer(serializers.ModelSerializer):
    user = RetailUserSerializer()

    class Meta:
        model = CompanyUser
        exclude = ('created_at', 'modified_at')


class CompanyUserSelectorSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source='user.email', default=None)
    user_id = serializers.IntegerField(source='id', default=None)
    display_name = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = CompanyUser
        fields = ('email', 'display_name', 'user_id')

    @staticmethod
    def get_display_name(obj: CompanyUser) -> str:
        user = obj.user
        full_name = get_full_name(user)
        if full_name:
            return f'{full_name} - {user.email}'
        return user.email


class CompanyProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = CompanyProfile
        exclude = ('created_at', 'modified_at')


class CompanyFaqSerializer(serializers.ModelSerializer):
    class Meta:
        model = CompanyFAQ
        exclude = ('created_at', 'modified_at')


class CompanySerializer(serializers.ModelSerializer):
    company_faqs = CompanyFaqSerializer(many=True)
    company_profile = CompanyProfileSerializer()
    power_of_attorney_document = DocumentSerializer(read_only=True)

    class Meta:
        model = Company
        exclude = ('created_at', 'modified_at')


class CompanyThemeSerializer(serializers.ModelSerializer):
    logo = serializers.SerializerMethodField()
    tech_partner_logo = serializers.SerializerMethodField()

    class Meta:
        model = CompanyTheme
        fields = '__all__'

    @staticmethod
    def get_logo(obj: CompanyTheme):
        if obj.company.logo:
            return obj.company.logo.url

    @staticmethod
    def get_tech_partner_logo(obj: CompanyTheme):
        if obj.company.tech_partner_logo:
            return obj.company.tech_partner_logo.url


class CompanyInfoSerializer(serializers.ModelSerializer):
    company_logo = serializers.SerializerMethodField()

    class Meta:
        model = Company
        exclude = ('created_at', 'modified_at')

    @staticmethod
    def get_company_logo(obj: Company):
        if obj.logo:
            return obj.logo.url
        return None


class CompanyTokenSerializer(serializers.ModelSerializer):
    company_name = serializers.CharField(source='company.name', read_only=True)
    company_selector = serializers.SerializerMethodField()

    class Meta:
        model = CompanyToken
        exclude = ('created_at', 'modified_at')

    @staticmethod
    def get_company_selector(obj: CompanyToken) -> dict:
        return {
            'label': obj.company.name,
            'value': obj.company_id
        }


class FundVehicleSerializer(serializers.ModelSerializer):
    class Meta:
        model = CompanyFundVehicle
        fields = '__all__'


class CompanyUserPowerOfAttorneySerializer(serializers.ModelSerializer):
    file_data = serializers.FileField(write_only=True)
    file_content_type = serializers.CharField(write_only=True)
    power_of_attorney_document = DocumentSerializer(read_only=True)

    class Meta:
        model = CompanyUser
        fields = '__all__'

    def update(self, instance: CompanyUser, validated_data):
        company = instance.company
        if not company.power_of_attorney_document:
            return instance

        content_type = validated_data['file_content_type']
        uploaded_document_info = UploadDocumentService.upload(
            document_data=validated_data['file_data'],
            content_type=content_type
        )  # type: UploadedDocumentInfo

        document, _ = Document.objects.update_or_create(
            partner_id=get_uuid(),
            company=company,
            defaults={
                'content_type': content_type,
                'title': company.power_of_attorney_document.title,
                'extension': uploaded_document_info.extension,
                'document_id': uploaded_document_info.document_id,
                'document_path': uploaded_document_info.document_path,
                'document_type': Document.DocumentType.POWER_OF_ATTORNEY_DOCUMENT.value,
                'access_scope': Document.AccessScopeOptions.COMPANY,
                'file_date': timezone.now(),
            }
        )
        instance.power_of_attorney_document = document
        instance.save()
        return instance
