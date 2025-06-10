import uuid
from django.utils import timezone
from rest_framework import serializers
from rest_framework.serializers import ModelSerializer, CharField, IntegerField, SerializerMethodField

from api.applications.models import Application, ApplicationDocumentsRequests, ApplicationCompanyDocument
from api.applications.services.application_investment_details import ApplicationInvestmentDetails
from api.applications.services.fund_documents_for_application import ApplicationFundDocumentsService
from api.applications.services.mark_required_once_documents_as_deleted import MarkRequiredOnceDocumentAsDeleted

from api.companies.models import CompanyUser, CompanyDocument
from api.companies.serializers import FundVehicleSerializer
from api.documents.models import Document
from api.documents.serializers import DocumentSerializer
from api.documents.services.upload_document import UploadDocumentService, UploadedDocumentInfo
from api.eligibility_criteria.models import CriteriaBlockResponse
from api.funds.models import Fund
from api.funds.serializers import FundShareClassSerializer
from api.funds.services.fund_application_statuses import FundApplicationsStatusService
from api.geographics.models import Country
from api.geographics.serializers import CountrySerializer
from api.kyc_records.models import KYCRecord
from api.payments.serializers import PaymentDetailSerializer
from api.tax_records.models import TaxRecord
from api.transfers.serializers import TransferSerializer
from api.users.serializers import RetailUserInfoSerializer, RetailUserBaseSerializer
from api.workflows.serializers import CommentSerializer
from api.workflows.services.format_comments import FormatComments
from api.transfers.models import Transfer


class KYCRecordSerializer(ModelSerializer):
    status_display = CharField(source='get_status_display', read_only=True)
    uuid = CharField()

    class Meta:
        model = KYCRecord
        fields = ('uuid', 'status', 'status_display')


class KYCRecordDetailsSerializer(ModelSerializer):
    status_display = CharField(source='get_status_display', read_only=True)
    id_document_type = CharField(source='get_id_document_type_display', read_only=True)

    class Meta:
        model = KYCRecord
        fields = '__all__'


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


class BaseApplicationSerializer(ModelSerializer):
    payment_detail = PaymentDetailSerializer(read_only=True)
    fund_documents = SerializerMethodField()
    investor_account_code = CharField(source='investor.investor_account_code', default=None)
    share_class = FundShareClassSerializer()
    vehicle = FundVehicleSerializer()

    class Meta:
        model = Application
        fields = '__all__'

    @staticmethod
    def get_fund_documents(obj: Application):
        return ApplicationFundDocumentsService(application=obj).process()


class ApplicationSerializer(ModelSerializer):
    tax_record = TaxRecordSerializer(required=False)
    kyc_record = KYCRecordSerializer(required=False)
    fund = FundSerializer(read_only=True)
    status_display = CharField(source='get_status_display', read_only=True)
    investor_account_code = CharField(source='investor.investor_account_code', default=None)
    share_class = FundShareClassSerializer()
    vehicle = FundVehicleSerializer()

    class Meta:
        model = Application
        fields = (
            'status',
            'status_display',
            'kyc_record',
            'tax_record',
            'uuid',
            'fund',
            'created_at',
            'investor_account_code',
            'share_class',
            'vehicle'
        )
        read_only_fields = ('uuid', 'fund')


class ApplicantManagementSerializer(ModelSerializer):
    first_name = SerializerMethodField()
    last_name = SerializerMethodField()
    job_band = SerializerMethodField()
    kyc_wf_slug = CharField(source='kyc_record.workflow.slug', default=None)
    department = SerializerMethodField()
    office_location = SerializerMethodField()
    fund_external_id = CharField(source='fund.external_id', default=None)
    # application_approval = SerializerMethodField()
    investment_detail = SerializerMethodField()
    payment_detail = PaymentDetailSerializer(read_only=True)
    user = RetailUserInfoSerializer(read_only=True)
    power_of_attorney_documents = SerializerMethodField()
    investor_account_code = CharField(source='investor.investor_account_code', default=None)
    share_class = FundShareClassSerializer()
    vehicle = FundVehicleSerializer()
    investing_as = SerializerMethodField()
    investor_location = CharField(source='kyc_record.investor_location.name', default=None)
    application_started = CharField(source='eligibility_response.created_at', default=None)
    skip_tax = serializers.BooleanField(source='fund.skip_tax', default=False)
    transfers = SerializerMethodField()
    internal_comments = SerializerMethodField()
    investment_country = SerializerMethodField()

    class Meta:
        model = Application
        fields = '__all__'

    @staticmethod
    def get_department(obj: Application):
        if obj.kyc_record and obj.kyc_record.department:
            return obj.kyc_record.department

        if obj.defaults_from_fund_file:
            department = obj.defaults_from_fund_file.get('department')
            return department

    @staticmethod
    def get_office_location(obj: Application):
        if obj.kyc_record and obj.kyc_record.office_location:
            return obj.kyc_record.office_location.name

        if obj.defaults_from_fund_file:
            country_id = obj.defaults_from_fund_file.get('office_location')
            if country_id:
                try:
                    country = Country.objects.get(id=country_id)
                except Country.DoesNotExist:
                    return None
                return country.name

    @staticmethod
    def get_first_name(obj: Application):
        if obj.kyc_record:
            return obj.kyc_record.first_name
        if obj.defaults_from_fund_file and obj.defaults_from_fund_file.get('first_name'):
            return obj.defaults_from_fund_file['first_name']
        return obj.user.first_name

    @staticmethod
    def get_last_name(obj: Application):
        if obj.kyc_record:
            return obj.kyc_record.last_name
        if obj.defaults_from_fund_file and obj.defaults_from_fund_file.get('last_name'):
            return obj.defaults_from_fund_file['last_name']

        return obj.user.last_name

    @staticmethod
    def get_job_band(obj: Application):
        if obj.kyc_record:
            return obj.kyc_record.job_band
        if obj.defaults_from_fund_file and obj.defaults_from_fund_file.get('job_band'):
            return obj.defaults_from_fund_file['job_band']

    # @staticmethod
    # def get_application_approval(obj: Application):
    #     if obj.status == Application.Status.APPROVED:
    #         return 'Approved'
    #     if obj.status == Application.Status.DENIED:
    #         return 'Declined'
    #     if obj.status == Application.Status.WITHDRAWN:
    #         return 'Withdrawn'
    #     if obj.status == Application.Status.FINALIZED:
    #         return 'Finalized'
    #     return 'Pending'

    @staticmethod
    def get_investment_detail(obj: Application):
        return ApplicationInvestmentDetails(application=obj).get()

    @staticmethod
    def get_power_of_attorney_documents(obj: Application):
        if not obj.company.power_of_attorney_document:
            return None

        power_of_attorney_document = obj.company.power_of_attorney_document
        template = DocumentSerializer(power_of_attorney_document).data
        company_user = CompanyUser.objects.get(company=obj.company, user=obj.user)
        user_document = None
        if company_user.power_of_attorney_document:
            user_document = DocumentSerializer(company_user.power_of_attorney_document).data

        return {
            'template': template,
            'user_document': user_document
        }

    @staticmethod
    def get_investing_as(obj: Application):
        if obj.kyc_record and obj.kyc_record.kyc_investor_type:
            return obj.kyc_record.get_kyc_investor_type_display()

    @staticmethod
    def get_eligibility_status(obj):
        if not obj.is_eligible:
            return 'Not Eligible'
        else:
            return 'Approved' if obj.is_approved else 'Pending'

    def get_internal_comments(self, obj: Application):
        if not obj.workflow:
            return ''

        comments = CommentSerializer(obj.workflow.workflow_comments.all(), many=True).data
        return FormatComments(comments=comments, admin_mapping=self.context.get('admin_name_mapping', {})).process()

    @staticmethod
    def get_transfers(obj: Application):
        return TransferSerializer(obj.transfer).data if obj.transfer else None

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


class ApplicationRetrieveSerializer(ApplicantManagementSerializer):
    status_detail = serializers.SerializerMethodField()

    @staticmethod
    def get_status_detail(obj: Application):
        application_task_status = FundApplicationsStatusService(
            fund=obj.fund,
            application=obj
        ).process()
        return application_task_status.get(obj.id, {})


class ApplicantListViewSerializer(ModelSerializer):
    first_name = SerializerMethodField()
    last_name = SerializerMethodField()
    # application_approval = SerializerMethodField()
    investment_detail = SerializerMethodField()
    user = RetailUserBaseSerializer(read_only=True)
    investor_account_code = CharField(source='investor.investor_account_code', default=None)
    share_class = FundShareClassSerializer()
    vehicle = FundVehicleSerializer()
    job_band = SerializerMethodField()
    department = SerializerMethodField()
    office_location = SerializerMethodField()
    kyc_wf_slug = CharField(source='kyc_record.workflow.slug', default=None)
    is_removable = SerializerMethodField()
    skip_tax = serializers.BooleanField(source='fund.skip_tax', default=False)
    transfers = SerializerMethodField()

    class Meta:
        model = Application
        fields = '__all__'

    @staticmethod
    def get_first_name(obj: Application):
        if obj.kyc_record:
            return obj.kyc_record.first_name
        if obj.defaults_from_fund_file and obj.defaults_from_fund_file.get('first_name'):
            return obj.defaults_from_fund_file['first_name']
        return obj.user.first_name

    @staticmethod
    def get_job_band(obj: Application):
        if obj.kyc_record:
            return obj.kyc_record.job_band
        if obj.defaults_from_fund_file and obj.defaults_from_fund_file.get('job_band'):
            return obj.defaults_from_fund_file['job_band']

    @staticmethod
    def get_department(obj: Application):
        if obj.kyc_record and obj.kyc_record.department:
            return obj.kyc_record.department

        if obj.defaults_from_fund_file:
            department = obj.defaults_from_fund_file.get('department')
            return department

    def get_office_location(self, obj: Application):
        country_id_name_map = self.context.get('country_id_name_map', {})
        location_id = None
        if obj.kyc_record:
            location_id = obj.kyc_record.office_location_id

        if not location_id and obj.defaults_from_fund_file:
            location_id = obj.defaults_from_fund_file.get('office_location')

        if location_id:
            return country_id_name_map.get(location_id)

    @staticmethod
    def get_last_name(obj: Application):
        if obj.kyc_record:
            return obj.kyc_record.last_name
        if obj.defaults_from_fund_file and obj.defaults_from_fund_file.get('last_name'):
            return obj.defaults_from_fund_file['last_name']

        return obj.user.last_name

    # @staticmethod
    # def get_application_approval(obj: Application):
    #     if obj.status == Application.Status.APPROVED:
    #         return 'Approved'
    #     if obj.status == Application.Status.DENIED:
    #         return 'Declined'
    #     if obj.status == Application.Status.WITHDRAWN:
    #         return 'Withdrawn'
    #     if obj.status == Application.Status.FINALIZED:
    #         return 'Finalized'
    #     return 'Pending'

    @staticmethod
    def get_eligibility_status(obj):
        if not obj.is_eligible:
            return 'Not Eligible'
        else:
            return 'Approved' if obj.is_approved else 'Pending'

    @staticmethod
    def get_investment_detail(obj: Application):
        return ApplicationInvestmentDetails(application=obj).get()

    @staticmethod
    def get_is_removable(obj: Application):
        return not obj.eligibility_response or not obj.eligibility_response.is_eligible

    @staticmethod
    def get_transfers(obj: Application):
        return TransferSerializer(obj.transfer).data if obj.transfer else None


class ApplicationDocumentRequestsSerializer(ModelSerializer):
    application = ApplicationSerializer(required=False)
    status_display = CharField(source='get_status_display', read_only=True)
    application_id = IntegerField(required=True)

    def create(self, validated_data):
        application = Application.objects.get(id=validated_data['application_id'])
        instance = ApplicationDocumentsRequests.objects.create(application=application, **validated_data)
        return instance

    class Meta:
        model = ApplicationDocumentsRequests
        fields = '__all__'
        read_only_fields = ('uuid', 'status', 'status_display')


class ApplicantAmlKycSerializer(ModelSerializer):
    kyc_record = KYCRecordDetailsSerializer(read_only=True)
    internal_comments = SerializerMethodField()

    class Meta:
        model = Application
        fields = '__all__'

    def get_internal_comments(self, obj: Application):
        if not obj.workflow:
            return ''

        comments = CommentSerializer(obj.workflow.workflow_comments.all(), many=True).data
        return FormatComments(comments=comments, admin_mapping=self.context.get('admin_name_mapping', {})).process()


class ApplicationCompanyDocumentUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ApplicationCompanyDocument
        fields = ('deleted',)


class ApplicationCompanyDocumentCreationSerializer(serializers.Serializer):
    company_document_id = serializers.IntegerField()
    file_data = serializers.FileField(write_only=True, required=True, allow_empty_file=False)
    application_id = serializers.IntegerField()

    def create(self, validated_data):
        company = self.context['company']
        application = Application.objects.get(
            company=company,
            id=validated_data['application_id']
        )

        company_document = CompanyDocument.objects.get(
            company=company,
            id=validated_data['company_document_id']
        )
        uploaded_document_info = UploadDocumentService.upload(
            document_data=validated_data['file_data']
        )  # type: UploadedDocumentInfo

        partner_id = uuid.uuid4().hex
        document = Document.objects.create(
            partner_id=partner_id,
            content_type=uploaded_document_info.content_type,
            title=validated_data['file_data'].name,
            extension=uploaded_document_info.extension,
            document_id=uploaded_document_info.document_id,
            document_path=uploaded_document_info.document_path,
            document_type=Document.DocumentType.COMPANY_DOCUMENT,
            file_date=timezone.now().date(),
            company=company,
            access_scope=Document.AccessScopeOptions.USER_ONLY.value,
            uploaded_by_admin=self.context['admin_user'],
            uploaded_by_user=application.get_company_user(),
        )
        application_company_document = ApplicationCompanyDocument.objects.create(
            company_document=company_document,
            application=application,
            signed_document=document,
            completed=True,
        )
        MarkRequiredOnceDocumentAsDeleted.process(
            application_company_document=application_company_document
        )
        return validated_data
