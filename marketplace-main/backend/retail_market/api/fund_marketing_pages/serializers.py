import uuid

from django.apps import apps
from django.utils import timezone
from rest_framework import serializers

from api.admin_users.models import AdminUser
from api.documents.models import Document
from api.documents.services.upload_document import UploadDocumentService, UploadedDocumentInfo
from api.fund_marketing_pages.models import FundMarketingPage, FundFact, RequestAllocationCriteria, FooterBlock, \
    FundPageDocument, RequestAllocationDocument, PromoFile, IconOption, \
    FundMarketingPageContact, FundMarketingPageReviewer
from api.funds.serializers import MarketingPageFundSerializer
from api.libs.sidecar_blocks.document_store.document_api import DocumentData
from api.libs.utils.user_name import get_display_name


class FundMarketingPageSerializer(serializers.ModelSerializer):
    created_by_name = serializers.SerializerMethodField()

    class Meta:
        model = FundMarketingPage
        exclude = ('background_image', 'logo', 'sub_header', 'description',)

    def create(self, validated_data):
        validated_data['created_by'] = self.context['admin_user']
        marketing_page = super().create(validated_data=validated_data)
        RequestAllocationCriteria.objects.create(
            fund_marketing_page=marketing_page
        )
        FundMarketingPageContact.objects.create(
            fund_marketing_page=marketing_page
        )
        return marketing_page

    @staticmethod
    def get_created_by_name(obj: FundMarketingPage):
        if obj.created_by:
            return get_display_name(user=obj.created_by.user)
        return ''


class FundFactSerializer(serializers.ModelSerializer):
    class Meta:
        model = FundFact
        fields = '__all__'


class RequestAllocationDocumentCreateSerializer(serializers.Serializer):
    file_data = serializers.FileField(write_only=True)
    allocation_criteria_id = serializers.IntegerField()

    def create(self, validated_data):
        uploaded_document_info = UploadDocumentService.upload(
            document_data=validated_data['file_data']
        )  # type: UploadedDocumentInfo

        document = Document.objects.create(
            partner_id=uuid.uuid4().hex,
            company=self.context['company'],
            content_type=uploaded_document_info.content_type,
            title=validated_data['file_data'].name,
            extension=uploaded_document_info.extension,
            document_id=uploaded_document_info.document_id,
            document_path=uploaded_document_info.document_path,
            document_type=Document.DocumentType.FUND_MARKETING_PAGE_DOCUMENT,
            file_date=timezone.now().date(),
            access_scope=Document.AccessScopeOptions.COMPANY.value,
            uploaded_by_admin=self.context['admin_user']
        )
        RequestAllocationDocument.objects.create(
            document=document,
            allocation_criteria_id=validated_data['allocation_criteria_id']
        )
        return validated_data


class RequestAllocationDocumentSerializer(serializers.ModelSerializer):
    document_name = serializers.CharField(source='document.title', default=None)
    document_id = serializers.CharField(source='document.document_id', default=None)
    doc_id = serializers.IntegerField(source='document_id', default=None)

    class Meta:
        model = RequestAllocationDocument
        fields = ('document_name', 'document_id', 'doc_id')


class RequestAllocationCriteriaSerializer(serializers.ModelSerializer):
    allocation_documents = RequestAllocationDocumentSerializer(many=True)

    class Meta:
        model = RequestAllocationCriteria
        fields = '__all__'


class ContactSerializer(serializers.ModelSerializer):
    class Meta:
        model = FundMarketingPageContact
        fields = '__all__'


class IconOptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = IconOption
        fields = '__all__'


class FooterBlockSerializer(serializers.ModelSerializer):
    icon_url = IconOptionSerializer(source='icon', read_only=True)

    class Meta:
        model = FooterBlock
        fields = '__all__'


class FundMarketingPageDocumentSerializer(serializers.Serializer):
    file_data = serializers.FileField(write_only=True)
    marketing_page_id = serializers.IntegerField()

    def create(self, validated_data):
        uploaded_document_info = UploadDocumentService.upload(
            document_data=validated_data['file_data']
        )  # type: UploadedDocumentInfo

        document = Document.objects.create(
            partner_id=uuid.uuid4().hex,
            company=self.context['company'],
            content_type=uploaded_document_info.content_type,
            title=validated_data['file_data'].name,
            extension=uploaded_document_info.extension,
            document_id=uploaded_document_info.document_id,
            document_path=uploaded_document_info.document_path,
            document_type=Document.DocumentType.FUND_MARKETING_PAGE_DOCUMENT,
            file_date=timezone.now().date(),
            access_scope=Document.AccessScopeOptions.COMPANY,
            uploaded_by_admin=self.context['admin_user']
        )
        FundPageDocument.objects.create(
            document=document,
            fund_marketing_page_id=validated_data['marketing_page_id']
        )

        return validated_data


class MarketingPageDocumentSerializer(serializers.ModelSerializer):
    document_name = serializers.CharField(source='document.title', default=None)
    document_id = serializers.CharField(source='document.document_id', default=None)
    doc_id = serializers.IntegerField(source='document_id', default=None)
    extension = serializers.CharField(source='document.extension', default=None)

    class Meta:
        model = FundPageDocument
        fields = ('document_name', 'document_id', 'doc_id', 'extension')


class PromoFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = PromoFile
        fields = '__all__'


class FundMarketingPageDetailSerializer(serializers.ModelSerializer):
    fund_facts = FundFactSerializer(many=True)
    request_allocation_criteria = RequestAllocationCriteriaSerializer(many=True)
    footer_blocks = FooterBlockSerializer(many=True)
    fund_page_documents = MarketingPageDocumentSerializer(many=True)
    fund_page_promo_files = PromoFileSerializer(many=True)
    fund = MarketingPageFundSerializer()
    fund_contact = ContactSerializer()

    class Meta:
        model = FundMarketingPage
        fields = '__all__'


class FundMarketingPageReviewerSerializer(serializers.ModelSerializer):
    reviewer_name = serializers.SerializerMethodField()

    class Meta:
        model = FundMarketingPageReviewer
        fields = '__all__'

    @staticmethod
    def get_reviewer_name(obj: FundMarketingPageReviewer):
        return get_display_name(obj.reviewer.user)


class AvailableReviewerSerializer(serializers.ModelSerializer):
    label = serializers.SerializerMethodField()
    value = serializers.IntegerField(source='id')

    class Meta:
        model = AdminUser
        fields = ('label', 'value',)

    @staticmethod
    def get_label(obj):
        return get_display_name(obj.user)
