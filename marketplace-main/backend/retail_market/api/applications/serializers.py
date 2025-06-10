from rest_framework.fields import SerializerMethodField
from rest_framework.serializers import ModelSerializer, CharField
from rest_framework import exceptions
from rest_framework import serializers
from django.utils import timezone
import uuid

from api.applications.services.mark_required_once_documents_as_deleted import MarkRequiredOnceDocumentAsDeleted
from api.eligibility_criteria.models import CriteriaBlockResponse
from api.geographics.models import Country
from api.geographics.serializers import CountrySerializer
from api.libs.utils.user_name import get_display_name
from api.users.serializers import RetailUserSerializer
from api.applications.services.application_investment_details import ApplicationInvestmentDetails
from api.applications.services.fund_documents_for_application import ApplicationFundDocumentsService
from api.applications.utils import update_or_create_user_application_state
from api.comments.models import ApplicationComment, ModuleChoices
from api.comments.services.update_comment_status import UpdateCommentService
from api.companies.admin_views.serializers import CompanyDocumentSerializer
from api.constants.kyc_investor_types import KYCInvestorType, KYC_VALUE_MAPPING
from api.funds.models import Fund
from api.applications.models import Application, ApplicationDocumentsRequests, UserApplicationState, \
    ApplicationCompanyDocument
from api.kyc_records.models import KYCRecord
from api.kyc_records.serializers import DocumentSerializer
from api.payments.serializers import PaymentDetailSerializer
from api.tax_records.models import TaxRecord
from api.documents.services.upload_document import UploadDocumentService, UploadedDocumentInfo
from api.documents.models import Document, ApplicationRequestDocument, ApplicationSupportingDocument


class KYCRecordSerializer(ModelSerializer):
    status_display = CharField(source='get_status_display', read_only=True)
    uuid = CharField()

    class Meta:
        model = KYCRecord
        fields = ('uuid', 'status', 'status_display', 'id')


class TaxRecordSerializer(ModelSerializer):
    status_display = CharField(source='get_status_display', read_only=True)
    uuid = CharField()

    class Meta:
        model = TaxRecord
        fields = ('uuid', 'status', 'status_display')


class FundSerializer(ModelSerializer):
    class Meta:
        model = Fund
        fields = ('slug', 'name')


class ApplicationSerializer(ModelSerializer):
    tax_record = TaxRecordSerializer(required=False)
    kyc_record = KYCRecordSerializer(required=False)
    fund = FundSerializer(read_only=True)
    fund_slug = CharField(write_only=True)
    status_display = CharField(source='get_status_display', read_only=True)
    fund_documents = SerializerMethodField()
    investment_country = SerializerMethodField()
    payment_detail = PaymentDetailSerializer(read_only=True)
    investor_account_code = CharField(source='investor.investor_account_code', default=None)

    def update(self, instance, validated_data):
        tr_query = TaxRecord.objects.filter(
            user=self.context['user'],
            company_id__in=self.context['company_ids']
        )
        kr_query = KYCRecord.objects.filter(
            user=self.context['user'],
            company_id__in=self.context['company_ids']
        )
        if validated_data.get('tax_record'):
            instance.tax_record = tr_query.get(uuid=validated_data['tax_record']['uuid'])
            instance.save()
        if validated_data.get('kyc_record'):
            instance.kyc_record = kr_query.get(uuid=validated_data['kyc_record']['uuid'])
            instance.save()
        return instance

    def create(self, validated_data):
        fund_qs = Fund.objects.filter(company_id__in=self.context['view'].company_ids)
        fund_slug = validated_data['fund_slug']
        try:
            fund = fund_qs.get(slug=fund_slug)
        except Fund.DoesNotExist:
            raise exceptions.NotFound(detail="Couldn't get fund %s in the user company" % fund_slug)
        validated_data['fund'] = fund
        validated_data['user'] = self.context['user']
        validated_data['company'] = fund.company
        instance = Application.objects.create(
            user=validated_data['user'],
            fund=validated_data['fund'],
            company=validated_data['company'],
        )

        return instance

    @staticmethod
    def get_fund_documents(obj: Application):
        return ApplicationFundDocumentsService(application=obj).process()

    @staticmethod
    def get_investment_country(obj: Application):
        if not obj.eligibility_response:
            return None

        try:
            country_selector_response = obj.eligibility_response.user_block_responses.get(
                block__is_country_selector=True
            )
        except CriteriaBlockResponse.DoesNotExist:
            return None

        response = country_selector_response.response_json
        if not response:
            return None

        country_code = response.get('country', {}).get('value')
        if not country_code:
            return None

        try:
            country = Country.objects.get(iso_code__iexact=country_code)
        except Country.DoesNotExist:
            return None

        return CountrySerializer(country).data

    class Meta:
        model = Application
        fields = '__all__'
        read_only_fields = ('uuid', 'fund')


class ApplicationDefaultsSerializer(ModelSerializer):
    application_data = serializers.SerializerMethodField()
    investment_details = serializers.SerializerMethodField()
    is_allocation_locked = serializers.SerializerMethodField()

    class Meta:
        model = Application
        fields = (
            'defaults_from_fund_file',
            'application_data',
            'is_allocation_approved',
            'investment_details',
            'has_custom_equity',
            'has_custom_leverage',
            'has_custom_total_investment',
            'is_allocation_locked'
        )

    @staticmethod
    def get_is_allocation_locked(obj: Application):
        return obj.has_custom_equity or obj.has_custom_leverage or obj.has_custom_total_investment

    @staticmethod
    def get_application_data(obj: Application):
        if not obj.kyc_record or not obj.kyc_record.investor_location:
            return None

        kyc_record = obj.kyc_record
        return {
            'entity_type': KYC_VALUE_MAPPING.get(kyc_record.kyc_investor_type),
            'office_location': kyc_record.investor_location.id,
            'first_name': kyc_record.first_name,
            'last_name': kyc_record.last_name,
            'department': kyc_record.department,
            'job_band': kyc_record.job_band,
            'job_title': kyc_record.job_title,
        }

    @staticmethod
    def get_investment_details(obj: Application):
        return ApplicationInvestmentDetails(application=obj).get()


class ApplicationRequestDocumentSerializer(ModelSerializer):
    file_data = serializers.FileField(write_only=True)
    uuid = serializers.CharField(write_only=True)
    document = DocumentSerializer(read_only=True)

    def create(self, validated_data):
        uploaded_document_info = UploadDocumentService.upload(
            document_data=validated_data['file_data']
        )

        application_document_request = ApplicationDocumentsRequests.objects.get(uuid=validated_data['uuid'])
        company_user = application_document_request.application.get_company_user()

        document = Document.objects.create(
            partner_id=uuid.uuid4().hex,
            content_type=uploaded_document_info.content_type,
            title=validated_data['file_data'].name,
            extension=uploaded_document_info.extension,
            document_id=uploaded_document_info.document_id,
            document_path=uploaded_document_info.document_path,
            document_type=Document.DocumentType.KYC_DOCUMENT,
            file_date=timezone.now().date(),
            company=company_user.company,
            access_scope=Document.AccessScopeOptions.USER_ONLY.value,
            uploaded_by_user=company_user
        )

        instance = ApplicationRequestDocument.objects.create(application_document_request=application_document_request,
                                                             document=document)

        UpdateCommentService(
            module=ModuleChoices.REQUESTED_DOCUMENT.value,
            instance=application_document_request,
            update_values={}
        ).update_question_comments(question_identifier=application_document_request.id)

        return instance

    class Meta:
        model = ApplicationRequestDocument
        fields = '__all__'


class ApplicationUpdateSerializer(ModelSerializer):
    class Meta:
        model = Application
        fields = '__all__'
        read_only_fields = ('uuid', 'fund')

    def update(self, instance: Application, validated_data):
        if validated_data.get('status'):
            validated_data['status_updated_by'] = self.context['requested_user']
        return super().update(instance, validated_data)


class UserApplicationStateSerializer(ModelSerializer):
    class Meta:
        model = UserApplicationState
        fields = '__all__'
        read_only_fields = ('user', 'fund')

    def create(self, validated_data):
        fund = self.context['fund']
        user = self.context['user']

        user_application_state, _ = update_or_create_user_application_state(
            fund=fund,
            user=user,
            values=validated_data
        )
        return user_application_state


class ApplicationCompanyDocumentSerializer(serializers.ModelSerializer):
    company_document = CompanyDocumentSerializer()
    signed_document = DocumentSerializer(read_only=True)
    file_data = serializers.FileField(write_only=True, required=False, allow_null=True)

    class Meta:
        model = ApplicationCompanyDocument
        fields = '__all__'

    def update(self, instance: ApplicationCompanyDocument, validated_data):
        file_data = validated_data.pop('file_data', None)
        if not file_data:
            updated_instance = super().update(instance=instance, validated_data=validated_data) # type: ApplicationCompanyDocument
            MarkRequiredOnceDocumentAsDeleted.process(application_company_document=updated_instance)
            return updated_instance

        uploaded_document_info = UploadDocumentService.upload(
            document_data=file_data
        )

        document = Document.objects.create(
            company=instance.application.company,
            title=instance.company_document.name,
            content_type=uploaded_document_info.content_type,
            document_id=uploaded_document_info.document_id,
            document_path=uploaded_document_info.document_path,
            document_type=Document.DocumentType.COMPANY_DOCUMENT,
            access_scope=Document.AccessScopeOptions.USER_ONLY.value,
            uploaded_by_user=instance.application.get_company_user(),
            extension=uploaded_document_info.extension,
            partner_id=uuid.uuid4().hex,
        )

        validated_data['signed_document'] = document
        updated_instance = super().update(instance=instance, validated_data=validated_data)
        MarkRequiredOnceDocumentAsDeleted.process(application_company_document=updated_instance)
        return updated_instance


class SupportingDocumentSerializer(ModelSerializer):
    document = DocumentSerializer(read_only=True)
    document_file = serializers.FileField(write_only=True)
    uploaded_by_admin = serializers.SerializerMethodField(read_only=True)
    uploaded_on = serializers.DateTimeField(source='created_at', read_only=True)

    def validate(self, attrs):
        attrs['last_updated_by'] = self.context['admin_user']
        return attrs

    def create(self, validated_data):
        uploaded_document_info = UploadDocumentService.upload(
            document_data=validated_data['document_file']
        )

        application = Application.objects.get(id=self.context['application_id'])
        admin_user = self.context['admin_user']

        document = Document.objects.create(
            partner_id=uuid.uuid4().hex,
            content_type=uploaded_document_info.content_type,
            title=validated_data['document_file'].name,
            extension=uploaded_document_info.extension,
            document_id=uploaded_document_info.document_id,
            document_path=uploaded_document_info.document_path,
            document_type=Document.DocumentType.SUPPORTING_DOCUMENT,
            file_date=timezone.now().date(),
            company=application.company,
            access_scope=Document.AccessScopeOptions.COMPANY.value,
            uploaded_by_admin=admin_user
        )

        instance = ApplicationSupportingDocument.objects.create(
            document_name=validated_data['document_name'],
            document_description=validated_data['document_description'],
            application=application,
            document=document,
            last_updated_by=self.context['admin_user'],
        )

        return instance

    @staticmethod
    def get_uploaded_by_admin(obj: ApplicationSupportingDocument):
        if obj.document and obj.document.uploaded_by_admin:
            return get_display_name(obj.document.uploaded_by_admin.user)
        return ''

    class Meta:
        model = ApplicationSupportingDocument
        fields = (
            'id',
            'document',
            'document_file',
            'document_name',
            'document_description',
            'uploaded_by_admin',
            'uploaded_on'
        )
        read_only_fields = ('id',)



class KYCDocumentVersionSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    history_id = serializers.IntegerField()


class KYCParticipantVersionSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    history_id = serializers.IntegerField()
    documents = KYCDocumentVersionSerializer(many=True)

class KYCVersionSerializer(serializers.Serializer):
    history_id = serializers.IntegerField()
    documents = KYCDocumentVersionSerializer(many=True)
    participants = KYCParticipantVersionSerializer(many=True, required=False)