import json
import logging
import uuid
from typing import Union

from django.apps import apps
from django.core.exceptions import ObjectDoesNotExist, ValidationError
from django.db.transaction import atomic
from django.utils.translation import gettext_lazy as _
from django_q.tasks import async_task
from django.utils import timezone
from rest_framework import serializers
from rest_framework.generics import get_object_or_404
from slugify import slugify

from api.applications.models import Application
from api.applications.utils import get_application_or_404
from api.backup.models import FundBackup, FundDocumentsBackup, DynamoFund
from api.backup.services.backup_fund_to_dynamo_service import BackupFundToDynamoService
from api.backup.serializers import LasalleApplicationReport, LasalleDocumentBackup, CompleteApplicationBackup
from api.comments.models import ModuleChoices
from api.comments.services.update_comment_status import UpdateCommentService
from api.companies.models import CompanyUser
from api.companies.serializers import CompanySerializer
from api.currencies.services.fund_currency_info import FundCurrencyDetail
from api.documents.models import FundDocument, Document, CompanyDataProtectionPolicyDocument, PublicFundDocument
from api.documents.services.upload_document import UploadedDocumentInfo, UploadDocumentService
from api.dsls.serializer_fields import FilterLangCharField
from api.eligibility_criteria.models import InvestmentAmount
from api.funds.constants import CODE_TO_FILE_MAPPING, INVALID_LEVERAGE
from api.funds.models import Fund, FundProfile, FundInterest, FundDocumentResponse, FundShareClass, \
    FundIndicationOfInterest, FundInterestQuestion, FundInterestUserAnswer, ExternalOnboarding, DocumentFilter, \
    LeverageOption
from api.funds.models import FundManager
from api.funds.models import FundTag
from api.funds.services.get_invite_file_processor import get_invite_file_processor
from api.funds.services.process_invite_file import ProcessInviteFileService
from api.investors.models import FundOrder
from api.investors.serializers import (
    FundInvestorSerializer, FundOrderSerializer, RetrieveFundOrderSerializer
)
from api.investors.services.fund_investment_details_published_email import FundInvestorDetailsPublishedEmailService
from api.kyc_records.serializers import DocumentSerializer
from api.libs.utils.identifiers import get_uuid
from api.notifications.tasks import async_process_application_notifications


class FundManagerSerializer(serializers.ModelSerializer):
    class Meta:
        model = FundManager
        exclude = ('created_at', 'modified_at',)
        read_only_fields = ('company',)

    def create(self, validated_data):
        if 'company' not in validated_data:
            validated_data['company'] = self.context['company']

        return super().create(validated_data)


class FundTagSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(required=False)
    name = serializers.CharField(required=False)
    slug = serializers.CharField(required=False)

    class Meta:
        model = FundTag
        fields = ('name', 'slug', 'id', )


class LeverageOptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = LeverageOption
        fields = ('amount', 'description', )


class FundSerializer(serializers.ModelSerializer):
    fund_type_name = serializers.SerializerMethodField()
    total = serializers.SerializerMethodField()
    fund_type_selector = serializers.SerializerMethodField()
    business_line_selector = serializers.SerializerMethodField()
    currency_selector = serializers.SerializerMethodField()
    invite_file = serializers.FileField(write_only=True, required=False, allow_null=True)
    partner_id = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    file_errors = None
    status = serializers.SerializerMethodField()
    has_eligibility_criteria = serializers.SerializerMethodField()
    can_start_accepting_applications = serializers.SerializerMethodField()
    can_finalize = serializers.SerializerMethodField()
    managers = FundManagerSerializer(many=True, required=False)
    fund_managers = serializers.JSONField(write_only=True, required=False)
    tags = FundTagSerializer(many=True, required=False)
    external_onboarding_url = serializers.URLField(required=False, allow_blank=True)
    document_filter = FilterLangCharField(allow_blank=True, required=False)
    dynamo_id = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    dynamo_id_content = serializers.CharField(source="dynamo_fund.dynamo_id", read_only=True, allow_null=True, allow_blank=True)
    leverage_options = LeverageOptionSerializer(many=True, required=False)

    def get_can_start_accepting_applications(self, obj: Fund) -> bool:
        try:
            has_external_onboarding = obj.external_onboarding.url is not None
        except ObjectDoesNotExist:
            has_external_onboarding = False
        return self.fund_has_elegibility_criteria(obj) or has_external_onboarding

    class Meta:
        model = Fund
        exclude = ('modified_at',)
        read_only_fields = ('slug', 'managers')

    def get_create_or_update_tags(self, tags):
        tag_ids = []

        # to be removed when using serializer correctly
        if isinstance(tags, str):
            tags = json.loads(tags)

        for tag in tags:
            tag['company_id'] = self.context['company'].id
            tag_name = tag.get('name')
            if not tag_name:
                continue
            tag['slug'] = slugify(tag_name)
            tag_instance, created = FundTag.objects.get_or_create(
                company=self.context['company'],
                slug=tag['slug'],
                defaults={'name': tag_name}
            )
            tag_ids.append(tag_instance.pk)
        return tag_ids

    def create_leverages(self, leverages, fund_id):
        leverage_ids = []
        for leverage in leverages:
            qs = LeverageOption.objects.filter(fund_id=fund_id, amount=int(leverage['amount']), description=leverage['description'])
            if qs.exists():
                leverage_instance = qs.first()
            else:
                leverage_instance = LeverageOption.objects.create(fund_id=fund_id, amount=int(leverage['amount']), description=leverage['description'])
            leverage_ids.append(leverage_instance.pk)
        return leverage_ids

    def validate(self, attrs):
        super().validate(attrs)
        leverage_options = self.initial_data.get('leverage_options', [])
        leverage_options = self._validate_leverage_options(leverage_options)
        attrs['leverage_options'] = leverage_options
        if not self._validate_is_finalized(attrs):
            raise serializers.ValidationError("Fund can't be finalized, id is not in list")
        if 'partner_id' in attrs:
            partner_id = attrs['partner_id']
            qs = Fund.objects.filter(partner_id=partner_id, company=self.context['company'])
            if self.instance:
                qs = qs.exclude(id=self.instance.id)
            if qs.exists():
                existing_fund = qs.first()
                raise serializers.ValidationError(f"Partner ID: {partner_id} already assigned to the fund: {existing_fund.name}")
        return attrs

    def _validate_is_finalized(self, attrs):
        if 'is_finalized' in attrs and attrs['is_finalized']:
            return self._fund_id_in_finalized_funds(self.instance.id)
        else:
            return True

    def _validate_leverage_options(self, leverage_options):
        # to be removed when using serializer correctly
        if isinstance(leverage_options, str):
            leverage_options = json.loads(leverage_options)
        if self.instance and leverage_options:
            all_applications = self.instance.applications.select_related('investment_amount')
            all_eligibility_responses = self.instance.applications.select_related(
                'eligibility_response__investment_amount')
            all_leverages = set()
            for application in all_applications:
                if application.investment_amount:
                    all_leverages.add(json.dumps({
                        'amount': int(application.investment_amount.leverage_ratio),
                        'description': application.investment_amount.leverage_option_description, }))
            for application in all_eligibility_responses:
                if application.eligibility_response and application.eligibility_response.investment_amount:
                    all_leverages.add(json.dumps({
                        'amount': int(application.eligibility_response.investment_amount.leverage_ratio),
                        'description': application.eligibility_response.investment_amount.leverage_option_description, }))
            serialized_leverage_options = [json.dumps({"amount": int(leverage_option['amount']),
                                                       "description": leverage_option['description']}) for
                                           leverage_option in leverage_options]
            for leverage in all_leverages:
                if leverage not in serialized_leverage_options:
                    deserialized = json.loads(leverage)
                    message = f"Leverage option: {deserialized['amount']}:1 can't be modified as there are applicants using it"
                    if deserialized['description']:
                        message = f"Leverage option: {deserialized['amount']}:1 - {deserialized['description']} can't be modified as there are applicants using it"
                    raise ValidationError(message)
        for leverage_option in leverage_options:
            if leverage_option['amount'] == INVALID_LEVERAGE:
                raise ValidationError("1:1 leverage is not leverage")
        return leverage_options

    def create(self, validated_data):
        if not validated_data.get('company'):
            validated_data['company'] = self.context['company']

        if not validated_data.get('created_by'):
            validated_data['created_by'] = self.context['admin_user']

        if not validated_data.get('managed_by') and self.context.get('user'):
            validated_data['managed_by'] = self.context['user']

        if not validated_data.get('partner_id'):
            validated_data['partner_id'] = get_uuid()

        validated_data['slug'] = slugify(validated_data['name'])

        invite_file = validated_data.pop('invite_file', None)
        external_onboarding_url = validated_data.pop('external_onboarding_url', None)
        dynamo_id = validated_data.pop('dynamo_id', None)
        document_filter = validated_data.pop('document_filter', None)
        # leverage_options = getattr(self, 'initial_data', {}).get('leverage_options', [])
        leverage_options = validated_data.pop('leverage_options', [])
        # validated_data['enable_internal_tax_flow'] = True
        with atomic():
            fund_managers = validated_data.pop('fund_managers', [])
            # this has to be refactored, so it uses serializers the right way without bypassing validation
            tags = getattr(self, 'initial_data', {}).get('tags', [])
            fund = super(FundSerializer, self).create(validated_data=validated_data)
            if fund_managers:
                fund.managers.set(fund_managers)

            if tags:
                fund.tags.set(self.get_create_or_update_tags(tags=tags))

            if leverage_options:
                self.create_leverages(leverage_options, fund.id)

            if invite_file:
                fund.is_invite_only = True
                fund.save()
                importer = get_invite_file_processor(fund=fund)
                self.file_errors = importer(
                    in_memory_file=invite_file,
                    fund=fund,
                    uploaded_by=self.context['admin_user']
                ).process()
            if external_onboarding_url:
                ExternalOnboarding.objects.create(url=external_onboarding_url, fund=fund)
            if dynamo_id:
                DynamoFund.objects.create(fund=fund, dynamo_id=dynamo_id)
            if document_filter:
                DocumentFilter.objects.create(code=document_filter, fund=fund)
            return fund

    def update_property(self, value, fund_property, field, message, model_class):
        if value:
            prop, created = model_class.objects.get_or_create(fund=self.instance, defaults={field: value})
            if not created:
                setattr(prop, field, value)
                prop.save()
        elif not self.partial or value == '':
            try:
                prop = getattr(self.instance, fund_property)
                prop.delete()
            except ObjectDoesNotExist:
                logging.debug(message)

    def update(self, instance: Fund, validated_data):
        invite_file = validated_data.pop('invite_file', None)

        fund_managers = validated_data.pop('fund_managers', [])
        if fund_managers:
            instance.managers.set(fund_managers)

        tags = getattr(self, 'initial_data', {}).get('tags', [])

        if tags:
            instance.tags.set(self.get_create_or_update_tags(tags=tags))

        leverage_options = validated_data.pop('leverage_options', [])
        if leverage_options:
            self.update_leverage_options(leverage_options)

        external_onboarding_url = validated_data.pop('external_onboarding_url', None)
        document_filter = validated_data.pop('document_filter', None)
        dynamo_id = validated_data.pop('dynamo_id', None)
        is_finalized = validated_data.get('is_finalized', None)

        self.update_property(value=external_onboarding_url,
                             field="url",
                             model_class=ExternalOnboarding,
                             message="External onboarding does not exist",
                             fund_property="external_onboarding")
        self.update_property(value=document_filter,
                             field="code",
                             model_class=DocumentFilter,
                             message="Document filter does not exist",
                             fund_property="document_filter")
        self.update_property(value=dynamo_id,
                             field="dynamo_id",
                             model_class=DynamoFund,
                             message="Dynamo fund does not exist",
                             fund_property="dynamo_fund")

        if is_finalized:
            async_task(self.application_task, fund_id=instance.id)
            async_task(self.document_list_task, fund_id=instance.id)
            async_task(self.document_task, fund_id=instance.id)
            # async_task(self.full_backup, fund_id=instance.id)

        if not invite_file:
            notify_investors = 'publish_investment_details' in validated_data \
                               and validated_data['publish_investment_details'] \
                               and instance.publish_investment_details is False
            updated_instance = super(FundSerializer, self).update(instance, validated_data)
            if notify_investors:
                # InvestmentDetailNotificationService(fund=updated_instance).process_fund()
                FundInvestorDetailsPublishedEmailService(fund_id=updated_instance.id).send_investment_published_email()
            return updated_instance

        importer = get_invite_file_processor(fund=instance)
        self.file_errors = importer(
            in_memory_file=invite_file,
            fund=instance,
            uploaded_by=self.context['admin_user']
        ).process()
        return instance

    def update_leverage_options(self, leverage_options):
        ids = []
        for leverage in leverage_options:
            leverage_option_qs = self.instance.leverage_options.filter(amount=leverage['amount'],
                                                                  description=leverage['description'])

            # due to get_or_create implementation, I can't use it in here
            if leverage_option_qs.exists():
                leverage_option = leverage_option_qs.first()
            else:
                leverage_option = LeverageOption.objects.create(fund=self.instance, amount=leverage['amount'],
                                                                description=leverage['description'])
            ids.append(int(leverage_option.id))
        all_ids = self.instance.leverage_options.values_list('id', flat=True)
        to_be_removed = self.instance.leverage_options.filter(id__in=[pk for pk in all_ids if pk not in ids])
        to_be_removed.delete()

    @staticmethod
    def application_task(fund_id):
        backup_storage = apps.get_app_config('backup').backup_storage
        fund = Fund.objects.get(pk=fund_id)
        output = fund.backup_serialized_to(LasalleApplicationReport, backup_storage)
        FundBackup.objects.create(fund_id=fund_id, storage_key=output['storage_key'])

    @staticmethod
    def document_list_task(fund_id):
        backup_storage = apps.get_app_config('backup').backup_storage
        fund = Fund.objects.get(pk=fund_id)
        output = fund.backup_serialized_documents_to(LasalleDocumentBackup, backup_storage)
        FundDocumentsBackup.objects.create(fund=fund, storage_key=output['storage_key'])

    @staticmethod
    def document_task(fund_id):
        backup_storage = apps.get_app_config('backup').backup_storage
        fund = Fund.objects.get(pk=fund_id)
        fund.backup_documents_to(backup_storage)

    @staticmethod
    def full_backup(fund_id):
        backup_storage = apps.get_app_config('backup').backup_storage
        fund = Fund.objects.get(pk=fund_id)
        output = fund.backup_serialized_to(CompleteApplicationBackup, backup_storage)

    @staticmethod
    def get_fund_type_name(obj: Fund) -> str:
        return obj.get_fund_type_display()

    @staticmethod
    def get_total(obj: Fund):
        return obj.sold + obj.unsold

    @staticmethod
    def get_fund_type_selector(obj: Fund) -> dict:
        return {
            'label': obj.get_fund_type_display(),
            'value': obj.fund_type
        }

    @staticmethod
    def get_business_line_selector(obj: Fund) -> Union[dict, None]:
        if not obj.business_line:
            return None
        return {
            'label': obj.get_business_line_display(),
            'value': obj.business_line
        }

    @staticmethod
    def get_currency_selector(obj: Fund) -> Union[dict, None]:
        if not obj.fund_currency:
            return None
        return {
            'label': obj.fund_currency.code,
            'value': obj.fund_currency_id
        }

    def format_file_errors(self):
        error_messages = []
        for error in self.file_errors:
            for field, errors in error.items():
                if field not in CODE_TO_FILE_MAPPING:
                    error_messages.append(', '.join(errors))
                    continue
                field_errors = ', '.join(errors)
                error_messages.append(
                    f'{CODE_TO_FILE_MAPPING[field]}: {field_errors}'
                )
        return ','.join(error_messages)

    def to_representation(self, instance):
        if self.file_errors:
            return {
                'id': instance.id,
                'invite_file_error': self.format_file_errors()
            }
        return super().to_representation(instance)

    def get_status(self, obj: Fund) -> str:
        if obj.publish_investment_details:
            return 'Live on Portal'

        if not (obj.is_published and obj.accept_applications):
            return 'In Draft'

        has_criteria = self.fund_has_elegibility_criteria(obj)
        if not (has_criteria or self.get_can_start_accepting_applications(obj)):
            return 'In Draft'

        if obj.close_applications:
            return 'Closed for New Applications'

        has_applications = obj.id in self.context.get('funds_with_eligibility_response', [])

        if not has_applications:
            return 'Accepting Applications'

        has_pending_applications = obj.id in self.context.get('fund_with_non_approved_eligibility_response', [])

        if has_pending_applications:
            return 'Applicant Review'

        if obj.is_finalized:
            return 'Finalized'

        return 'Live on Portal'

    def get_has_eligibility_criteria(self, obj: Fund):
        return self.fund_has_elegibility_criteria(obj)

    def fund_has_elegibility_criteria(self, obj):
        return obj.id in self.context.get('funds_with_published_criteria', [])

    def get_can_finalize(self, obj):
        return self._fund_id_in_finalized_funds(obj.id)

    def _fund_id_in_finalized_funds(self, fund_id):
        return fund_id in self.context.get('funds_can_be_finalized', [])


class FundBaseInfoSerializer(FundSerializer):

    class Meta:
        model = Fund
        fields = ('id', 'name', 'slug', 'external_id', 'is_published', 'enable_internal_tax_flow', 'skip_tax',
                  'publish_investment_details', 'can_start_accepting_applications', 'open_for_indication_interest',
                  'has_eligibility_criteria', 'close_applications', 'accept_applications')


class FundBaseInfoListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Fund
        fields = ('id', 'name', 'external_id')


class FundProfileSerializer(serializers.ModelSerializer):
    eligibility_criteria_headings = serializers.SerializerMethodField()

    class Meta:
        model = FundProfile
        exclude = ('created_at', 'modified_at',)

    @staticmethod
    def get_eligibility_criteria_headings(obj: FundProfile):
        criteria_keys = []
        if not obj.eligibility_criteria:
            return criteria_keys

        for criteria in obj.eligibility_criteria:
            criteria_keys.extend(criteria.keys())

        return list(set(criteria_keys))


class FundShareClassSerializer(serializers.ModelSerializer):
    class Meta:
        model = FundShareClass
        fields = '__all__'


class FundDetailSerializer(serializers.ModelSerializer):
    fund_investors = FundInvestorSerializer(many=True)
    fund_orders = FundOrderSerializer(many=True)
    company = CompanySerializer()
    fund_type_name = serializers.SerializerMethodField()
    business_line_name = serializers.SerializerMethodField()
    total = serializers.SerializerMethodField()
    application_period_start_date = serializers.DateField(format='%m/%d/%Y', default=None)
    application_period_end_date = serializers.DateField(format='%m/%d/%Y', default=None)
    confirmation_date = serializers.DateField(format='%B %d, %Y', default=None)
    anticipated_first_call_date = serializers.DateField(format='%m/%d/%Y', default=None)
    show_new_commitment_flow = serializers.BooleanField(source='company.show_new_commitment_flow', read_only=True)
    leverage_options = LeverageOptionSerializer(many=True)
    user_leverage = serializers.SerializerMethodField()
    requested_allocations = serializers.SerializerMethodField()
    currency = serializers.SerializerMethodField()
    fund_profile = FundProfileSerializer()
    tags = FundTagSerializer(many=True)
    managers = FundManagerSerializer(many=True)
    logo = serializers.SerializerMethodField()
    has_active_application = serializers.SerializerMethodField()
    enabled_workflows = serializers.SerializerMethodField()

    class Meta:
        model = Fund
        exclude = ('created_at', 'modified_at')

    @staticmethod
    def get_enabled_workflows(obj: Fund):
        return obj.get_enabled_workflows()

    @staticmethod
    def get_fund_type_name(obj: Fund) -> str:
        return obj.get_fund_type_display()

    @staticmethod
    def get_business_line_name(obj: Fund) -> str:
        return obj.get_business_line_display()

    @staticmethod
    def get_total(obj: Fund):
        return obj.sold + obj.unsold

    def get_company_user(self, fund: Fund):
        return CompanyUser.objects.get(
            company=fund.company,
            user=self.context['requested_user']
        )

    # def get_leverage_options(self, obj: Fund):
    #     company_user = self.get_company_user(fund=obj)
    #     leverage_service = GetLeverageOptionsService(company_user=company_user)
    #     return leverage_service.process()

    def get_user_leverage(self, obj: Fund):
        company_user = self.get_company_user(fund=obj)
        if company_user.role:
            return company_user.role.leverage_ratio
        return ''

    def get_requested_allocations(self, obj: Fund):
        company_user = self.get_company_user(fund=obj)  # type: CompanyUser
        requested_allocations = []
        for investor_id in company_user.associated_investor_profiles.values_list('investor_id', flat=True):
            try:
                requested_allocation = FundOrder.objects.filter(fund=obj, investor_id=investor_id).latest('created_at')
                requested_allocations.append(RetrieveFundOrderSerializer(requested_allocation).data)
            except FundOrder.DoesNotExist:
                continue
        return requested_allocations

    @staticmethod
    def get_currency(obj: Fund):
        fund_detail = FundCurrencyDetail(fund=obj)
        return fund_detail.process()

    @staticmethod
    def get_logo(obj: Fund):
        if obj.logo:
            return obj.logo.url
        if obj.company.logo:
            return obj.company.logo.url

    def get_has_active_application(self, obj: Fund):
        user = self.context['requested_user']
        return Application.objects.filter(
            user_id=user.id,
            fund_id=obj.id,
            eligibility_response__isnull=False
        ).exists()


class AdminFundDetailSerializer(serializers.ModelSerializer):
    fund_type_name = serializers.SerializerMethodField()
    business_line_name = serializers.SerializerMethodField()
    enabled_workflows = serializers.SerializerMethodField()
    application_period_start_date = serializers.DateField(format='%m/%d/%Y', default=None)
    application_period_end_date = serializers.DateField(format='%m/%d/%Y', default=None)
    confirmation_date = serializers.DateField(format='%B %d, %Y', default=None)
    anticipated_first_call_date = serializers.DateField(format='%m/%d/%Y', default=None)
    currency = serializers.SerializerMethodField()
    fund_profile = FundProfileSerializer()
    tags = FundTagSerializer(many=True)
    managers = FundManagerSerializer(many=True)
    external_onboarding_url = serializers.URLField(source='external_onboarding.url', read_only=True)
    document_filter = serializers.CharField(source='document_filter.code', read_only=True)
    dynamo_id = serializers.CharField(source='dynamo_fund.dynamo_id', read_only=True)
    show_new_commitment_flow = serializers.BooleanField(source='company.show_new_commitment_flow', read_only=True)
    leverage_options = LeverageOptionSerializer(many=True)

    class Meta:
        model = Fund
        exclude = ('created_at', 'modified_at')

    @staticmethod
    def get_fund_type_name(obj: Fund) -> str:
        return obj.get_fund_type_display()

    @staticmethod
    def get_business_line_name(obj: Fund) -> str:
        return obj.get_business_line_display()

    @staticmethod
    def get_currency(obj: Fund):
        fund_detail = FundCurrencyDetail(fund=obj)
        return fund_detail.process()

    @staticmethod
    def get_enabled_workflows(obj: Fund):
        return obj.get_enabled_workflows()


class FundProfileDetailSerializer(serializers.ModelSerializer):
    fund_profile = FundProfileSerializer()
    company = CompanySerializer()
    fund_type = serializers.SerializerMethodField()
    currency = serializers.SerializerMethodField()
    documents = serializers.SerializerMethodField()
    indicated_interest = serializers.SerializerMethodField()

    class Meta:
        model = Fund
        exclude = ('created_at', 'modified_at')

    @staticmethod
    def get_fund_type(obj: Fund):
        return obj.get_fund_type_display()

    @staticmethod
    def get_currency(obj: Fund):
        fund_detail = FundCurrencyDetail(fund=obj)
        return fund_detail.process()

    @staticmethod
    def get_documents(obj: Fund):
        documents = []
        for fund_doc in obj.fund_documents.all():
            document = fund_doc.document
            documents.append({
                'title': document.title,
                'document_id': document.document_id,
                'name': document.document_path.rsplit('/', 1)[-1],
                'extension': document.extension,
            })
        return documents

    def get_indicated_interest(self, obj: Fund):
        company_user = CompanyUser.objects.get(
            company=obj.company,
            user=self.context['requested_user']
        )
        return FundIndicationOfInterest.objects.filter(fund=obj, user=company_user).exists()


class FundInterestSerializer(serializers.ModelSerializer):
    class Meta:
        model = FundInterest
        exclude = ('created_at', 'modified_at')
        read_only_fields = ('user',)

    def create(self, validated_data):
        company_user = CompanyUser.objects.get(
            company=validated_data['fund'].company,
            user=self.context['requested_user']
        )
        validated_data['user'] = company_user
        return super().create(validated_data=validated_data)


class MarketingPageFundSerializer(serializers.ModelSerializer):
    class Meta:
        model = Fund
        exclude = ('created_at', 'modified_at')


class FundDocumentSerializer(serializers.ModelSerializer):
    document_name = serializers.CharField(source='document.title', default=None, read_only=True)
    document_id = serializers.CharField(source='document.document_id', default=None, read_only=True)
    doc_id = serializers.IntegerField(source='document_id', default=None, read_only=True)
    extension = serializers.CharField(source='document.extension', default=None, read_only=True)

    class Meta:
        model = FundDocument
        fields = '__all__'


class FundDocumentCreateSerializer(serializers.ModelSerializer):
    title = serializers.CharField()
    fund_external_id = serializers.CharField(write_only=True)
    document_file = serializers.FileField(write_only=True)
    replaces = serializers.IntegerField(write_only=True, required=False, allow_null=True)

    class Meta:
        model = FundDocument
        fields = ('title', 'fund_external_id', 'document_file', 'replaces')

    def create(self, validated_data):
        fund = Fund.objects.get(external_id=validated_data['fund_external_id'])
        uploaded_document_info = UploadDocumentService.upload(
            document_data=validated_data['document_file']
        )  # type: UploadedDocumentInfo

        fund_document_to_replace = None
        if validated_data.get('replaces'):
            fund_document_to_replace = get_object_or_404(
                FundDocument,
                id=validated_data['replaces'],
                fund=fund
            )

        document = Document.objects.create(
            title=validated_data['title'],
            content_type=uploaded_document_info.content_type,
            uploaded_by_admin=self.context['admin_user'],
            document_id=uploaded_document_info.document_id,
            document_path=uploaded_document_info.document_path,
            extension=uploaded_document_info.extension,
            partner_id=uuid.uuid4().hex,
            company=fund.company,
            access_scope=Document.AccessScopeOptions.COMPANY.value
        )
        fund_document = FundDocument.objects.create(document=document, fund=fund)

        if fund_document_to_replace:
            fund_document_to_replace.is_replaced = True
            fund_document_to_replace.replaced_by = fund_document
            fund_document_to_replace.save()

        return validated_data


class FundDocumentResponseSerializer(serializers.ModelSerializer):
    class Meta:
        model = FundDocumentResponse
        fields = '__all__'
        read_only_fields = ('fund', 'user')

    def create(self, validated_data):
        fund_document_response, _ = FundDocumentResponse.objects.get_or_create(
            fund=self.context['fund'],
            user=self.context['company_user'],
        )
        current_response = fund_document_response.response_json
        if not current_response:
            current_response = {}

        response_json = {**current_response, **validated_data['response_json']}
        fund_document_response.response_json = response_json
        fund_document_response.save(update_fields=['response_json'])

        params = {
            'fund__external_id': self.context['fund'].external_id,
            'user_id': self.context['company_user'].user_id
        }
        application = get_application_or_404(params)

        UpdateCommentService(
            module=ModuleChoices.FUND_DOCUMENTS.value,
            instance=fund_document_response,
            update_values={}
        ).update_application_module(application_id=application.id)

        return fund_document_response


class FundShareWithVehicleClassSerializer(serializers.ModelSerializer):
    display_share_class_vehicle_name = serializers.SerializerMethodField()

    class Meta:
        model = FundShareClass
        fields = '__all__'

    @staticmethod
    def get_display_share_class_vehicle_name(obj: FundShareClass):
        returnable = f"{obj.display_name} -- {obj.company_fund_vehicle.name}"
        return returnable


class FundDataProtectionPolicyDocumentSerializer(serializers.ModelSerializer):
    document = DocumentSerializer(read_only=True)

    class Meta:
        model = CompanyDataProtectionPolicyDocument
        fields = '__all__'


class FundIndicationOfInterestSerializer(serializers.ModelSerializer):
    class Meta:
        model = FundIndicationOfInterest
        fields = '__all__'


class BulkCreateInterestQuestionSerializer(serializers.ListSerializer):
    def create(self, validated_data):
        questions = [FundInterestQuestion(**item) for item in validated_data]
        return FundInterestQuestion.objects.bulk_create(questions)


class FundInterestQuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = FundInterestQuestion
        exclude = ('created_at', 'modified_at')
        list_serializer_class = BulkCreateInterestQuestionSerializer


class FundInterestUserAnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = FundInterestUserAnswer
        exclude = ('created_at', 'modified_at')
        read_only_fields = ('user', )

    def create(self, validated_data):
        company_user = CompanyUser.objects.get(
            company=validated_data['question'].fund.company,
            user=self.context['requested_user']
        )
        validated_data['user'] = company_user
        return super().create(validated_data=validated_data)


class PublicFundDocumentSerializer(serializers.ModelSerializer):
    document = DocumentSerializer(read_only=True)
    title = serializers.CharField(write_only=True)
    document_file = serializers.FileField(write_only=True)

    class Meta:
        model = PublicFundDocument
        fields = ('document', 'title', 'document_file',)

    def create(self, validated_data):
        uploaded_document_info = UploadDocumentService.upload(
            document_data=validated_data['document_file']
        )

        fund = Fund.objects.get(external_id=self.context['fund_external_id'])
        admin_user = self.context['admin_user']

        document = Document.objects.create(
            partner_id=uuid.uuid4().hex,
            content_type=uploaded_document_info.content_type,
            title=validated_data['title'],
            extension=uploaded_document_info.extension,
            document_id=uploaded_document_info.document_id,
            document_path=uploaded_document_info.document_path,
            document_type=Document.DocumentType.PUBLIC_DOCUMENT,
            file_date=timezone.now().date(),
            company=fund.company,
            access_scope=Document.AccessScopeOptions.COMPANY.value,
            uploaded_by_admin=admin_user
        )

        instance = PublicFundDocument.objects.create(
            fund=fund,
            document=document
        )

        return instance
