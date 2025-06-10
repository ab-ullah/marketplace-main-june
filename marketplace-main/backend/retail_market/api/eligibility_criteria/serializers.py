import uuid

from django.db.transaction import atomic
from django.utils import timezone
from rest_framework import serializers
from rest_framework.exceptions import ValidationError
from rest_framework.fields import empty
from slugify import slugify

from api.admin_users.models import AdminUser
from api.applications.utils import get_application_or_404
from api.applications.services.undelete_application import \
    UndeleteApplicationService
from api.comments.models import ModuleChoices
from api.comments.services.update_comment_status import UpdateCommentService
from api.companies.models import CompanyUser
from api.documents.models import CriteriaBlockDocument, Document
from api.documents.services.upload_document import (UploadDocumentService,
                                                    UploadedDocumentInfo)
from api.eligibility_criteria.blocks_data.block_ids import \
    KNOWLEDGE_EMPLOYEE_ID
from api.eligibility_criteria.models import (Block, BlockCategory,
                                             CriteriaBlock,
                                             CriteriaBlockConnector,
                                             CriteriaBlockGroupConnector,
                                             CriteriaBlockResponse,
                                             CustomSmartBlock,
                                             CustomSmartBlockField,
                                             EligibilityCriteriaResponse,
                                             FundEligibilityCriteria,
                                             InvestmentAmount,
                                             ResponseBlockDocument,
                                             CustomSmartBlockTemplate)
from api.eligibility_criteria.services.admin.create_eligibility_criteria_block import \
    CreateEligibilityCriteriaBlockService
from api.eligibility_criteria.services.create_eligibility_criteria import \
    CreateEligibilityCriteriaService
from api.eligibility_criteria.services.publish_criteria import PublishCriteria
from api.eligibility_criteria.services.resolve_comments import \
    resolve_comments_for_response_block
from api.eligibility_criteria.services.smart_decision_service import \
    SmartDecisionBlockService
from api.eligibility_criteria.utils.eligibility_criteria import (
    create_eligibility_criteria_response_task,
    get_criteria_selected_region_country_codes)
from api.geographics.models import Country
from api.libs.utils.user_name import get_display_name
from api.workflows.models import Task


class FundEligibilityCriteriaSerializer(serializers.ModelSerializer):
    country_region_codes = serializers.ListField(child=serializers.CharField(), write_only=True)
    name = serializers.SerializerMethodField()
    status_name = serializers.SerializerMethodField()
    creator_name = serializers.SerializerMethodField()
    selected_region_country_codes = serializers.SerializerMethodField()
    is_publishable = serializers.SerializerMethodField()

    class Meta:
        model = FundEligibilityCriteria
        fields = '__all__'

    def create(self, validated_data):
        validated_data['created_by'] = self.context['admin_user']
        creator_service = CreateEligibilityCriteriaService(validated_data=validated_data)
        return creator_service.create()

    def update(self, instance: FundEligibilityCriteria, validated_data):
        updated_criteria = super().update(instance=instance, validated_data=validated_data)

        if validated_data.get('status') and validated_data[
            'status'] == FundEligibilityCriteria.CriteriaStatusChoice.PUBLISHED.value:
            PublishCriteria(criteria=instance).mark_publish_task_completed()

        if validated_data.get('country_region_codes'):
            CreateEligibilityCriteriaService.create_regions_countries(
                fund_criteria=instance,
                country_region_codes=validated_data['country_region_codes'],
                company=instance.fund.company,
                update=True
            )

        return updated_criteria

    @staticmethod
    def get_status_name(obj: FundEligibilityCriteria):
        return obj.get_status_display()

    @staticmethod
    def get_creator_name(obj: FundEligibilityCriteria):
        if obj.created_by:
            return get_display_name(obj.created_by.user)
        return ''

    @staticmethod
    def get_selected_region_country_codes(obj: FundEligibilityCriteria):
        return get_criteria_selected_region_country_codes(eligibility_criteria=obj)

    @staticmethod
    def get_name(obj: FundEligibilityCriteria):
        return obj.name

    @staticmethod
    def get_is_publishable(obj: FundEligibilityCriteria):
        return obj.status == FundEligibilityCriteria.CriteriaStatusChoice.APPROVED.value


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = BlockCategory
        fields = '__all__'


class BlockSerializer(serializers.ModelSerializer):
    category = CategorySerializer()
    country_name = serializers.CharField(source='country.name', default=None)
    region_name = serializers.CharField(source='region.name', default=None)

    class Meta:
        model = Block
        fields = '__all__'


class BlockCategorySerializer(serializers.ModelSerializer):
    category_blocks = BlockSerializer(many=True)

    class Meta:
        model = BlockCategory
        fields = '__all__'


class AvailableReviewerSerializer(serializers.ModelSerializer):
    label = serializers.SerializerMethodField()
    value = serializers.IntegerField(source='id')

    class Meta:
        model = AdminUser
        fields = ('label', 'value',)

    @staticmethod
    def get_label(obj):
        return get_display_name(obj.user)


class CriteriaBlockCreateSerializer(serializers.ModelSerializer):
    is_smart_view = serializers.BooleanField(required=False, write_only=True)

    class Meta:
        model = CriteriaBlock
        fields = '__all__'

    def validate(self, attrs):
        criteria = attrs['criteria']  # type: FundEligibilityCriteria
        if not criteria.fund.company_id == self.context['company'].id:
            raise ValidationError('Fund does not belong to your company')
        return attrs

    def create(self, validated_data):
        criteria = validated_data['criteria']
        return CreateEligibilityCriteriaBlockService.create(
            criteria=criteria,
            validated_data=validated_data
        )


class CriteriaBlockGroupConnectorSerializer(serializers.ModelSerializer):
    class Meta:
        model = CriteriaBlockGroupConnector
        fields = '__all__'


class CriteriaBlockConnectorSerializer(serializers.ModelSerializer):
    class Meta:
        model = CriteriaBlockConnector
        fields = '__all__'


class CriteriaBlockDocumentSerializer(serializers.ModelSerializer):
    document_name = serializers.CharField(source='document.title', default=None)
    document_id = serializers.CharField(source='document.document_id', default=None)
    doc_id = serializers.IntegerField(source='document_id', default=None)
    extension = serializers.CharField(source='document.extension', default=None)

    class Meta:
        model = CriteriaBlockDocument
        fields = ('document_name', 'document_id', 'doc_id', 'extension')


class EligibilityCalculationSerializer(serializers.ModelSerializer):
    block = BlockSerializer(read_only=True)
    block_connected_to = CriteriaBlockConnectorSerializer(many=True, read_only=True)

    class Meta:
        model = CriteriaBlock
        fields = '__all__'


class FundEligibilityCriteriaDocumentSerializer(serializers.Serializer):
    file_data = serializers.FileField(write_only=True)
    criteria_id = serializers.IntegerField()

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
            document_type=Document.DocumentType.ELIGIBILITY_CRITERIA_DOCUMENT,
            file_date=timezone.now().date(),
            access_scope=Document.AccessScopeOptions.COMPANY,
            uploaded_by_admin=self.context['admin_user']
        )
        CriteriaBlockDocument.objects.create(
            document=document,
            criteria_block_id=validated_data['criteria_id']
        )

        return validated_data


class CriteriaResponseBlockSerializer(serializers.Serializer):
    eligibility_criteria_id = serializers.IntegerField()
    block_id = serializers.IntegerField(required=False)
    response_json = serializers.JSONField()
    is_preview = serializers.BooleanField(required=False, write_only=True)
    is_smart_view = serializers.BooleanField(required=False, write_only=True)

    def create(self, validated_data):
        if validated_data.get('is_preview'):
            return CriteriaBlockResponse()

        with atomic():
            criteria = FundEligibilityCriteria.objects.get(id=validated_data['eligibility_criteria_id'])
            # company_user = CompanyUser.objects.get(
            #     company=criteria.fund.company,
            #     user=self.context['request'].user
            # )

            user_application = get_application_or_404({
                'user_id': self.context['requested_user'].id,
                'company': criteria.fund.company,
                'fund__external_id': criteria.fund.external_id,
                'eligibility_response__criteria_id': validated_data['eligibility_criteria_id']
            })

            criteria_response = user_application.eligibility_response

            criteria_block_response, _ = CriteriaBlockResponse.objects.update_or_create(
                criteria_response=criteria_response,
                block_id=validated_data['block_id'],
                defaults={
                    'response_json': validated_data['response_json']
                }
            )
            resolve_comments_for_response_block(
                response_block=criteria_block_response,
                company=criteria_response.criteria.fund.company
            )
            UndeleteApplicationService(
                fund=criteria_response.criteria.fund,
                user=criteria_response.response_by.user
            ).process()

            criteria_response.last_position = validated_data['block_id']
            criteria_response.save()
            return criteria_block_response

    def get_next_step(self, criteria_block_response):
        if hasattr(self, 'initial_data'):
            return SmartDecisionBlockService(initial_data=self.initial_data).next_block()

    def to_representation(self, criteria_block_response):
        next_block_data = {}
        next_block = self.get_next_step(criteria_block_response=criteria_block_response)
        if next_block:
            next_block_data = CriteriaBlockSerializer(next_block).data

        return {
            "eligibility_criteria_response_id": criteria_block_response.criteria_response_id,
            "block_id": criteria_block_response.block_id,
            "response_json": criteria_block_response.response_json,
            "next_block": next_block_data
        }


class InvestmentAmountSerializer(serializers.ModelSerializer):
    leverage_option_description = serializers.CharField(allow_blank=True, allow_null=True)

    class Meta:
        model = InvestmentAmount
        fields = '__all__'

    def create(self, validated_data):
        criteria_response = self.context['criteria_response']  # type: EligibilityCriteriaResponse
        # skip levered amount saving if not set at fund level
        application = criteria_response.application
        if application:
            fund = application.fund
            if fund and not fund.max_levered_commitment_amount:
                validated_data.pop('unlevered_amount', None)
                validated_data.pop('levered_amount', None)

        max_leverage = criteria_response.kyc_record.max_leverage_ratio
        if max_leverage is not None and validated_data.get('leverage_ratio'):
            if validated_data['leverage_ratio'] > max_leverage:
                raise ValidationError('Requested leverage exceed the allowed leverage')

        if not criteria_response.investment_amount:
            investment_amount = super().create(validated_data)
            criteria_response.investment_amount = investment_amount
            criteria_response.save(update_fields=['investment_amount'])
        else:
            investment_amount = criteria_response.investment_amount
            update_comment_status_service = UpdateCommentService(
                module=ModuleChoices.INVESTMENT_ALLOCATION.value,
                instance=investment_amount,
                update_values=validated_data
            )
            for k, v in validated_data.items():
                setattr(investment_amount, k, v)
            investment_amount.save()
            update_comment_status_service.update_comments_status(prefix=f'{criteria_response.id}')

        request = self.context['request']
        if criteria_response.is_eligible and not request.GET.get('skip_task'):
            create_eligibility_criteria_response_task(user=self.context['requested_user'],
                                                      criteria_response=criteria_response)

        UndeleteApplicationService(
            fund=criteria_response.criteria.fund,
            user=criteria_response.response_by.user
        ).process()

        return investment_amount


class UpdateInvestmentAmountSerializer(serializers.ModelSerializer):
    class Meta:
        model = InvestmentAmount
        fields = '__all__'

    def update(self, investment_amount, validated_data):
        update_comment_status_service = UpdateCommentService(
            module=ModuleChoices.INVESTMENT_ALLOCATION.value,
            instance=investment_amount,
            update_values=validated_data
        )
        for field, update_value in validated_data.items():
            setattr(investment_amount, field, update_value)
        investment_amount.save()
        update_comment_status_service.update_comments_status()
        return investment_amount


class CriteriaResponseSerializer(serializers.ModelSerializer):
    user_block_responses = CriteriaResponseBlockSerializer(many=True)
    investment_amount = InvestmentAmountSerializer()
    max_leverage = serializers.SerializerMethodField(read_only=True)
    offer_leverage = serializers.SerializerMethodField(read_only=True)
    min_investment = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = EligibilityCriteriaResponse
        fields = '__all__'

    @staticmethod
    def get_max_leverage(obj: EligibilityCriteriaResponse):
        return obj.kyc_record.max_leverage_ratio

    @staticmethod
    def get_min_investment(obj: EligibilityCriteriaResponse):
        return obj.criteria.fund.minimum_investment

    @staticmethod
    def get_offer_leverage(obj: EligibilityCriteriaResponse):
        return obj.criteria.fund.offer_leverage


class CriteriaResponseUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = EligibilityCriteriaResponse
        fields = '__all__'


class UserResponseFetchSerializer(serializers.Serializer):
    criteria_preview = serializers.JSONField(required=False)
    user_response = serializers.JSONField(required=False)
    error = serializers.CharField(required=False)


class EligibilityStatusSerializer(serializers.Serializer):
    is_eligible = serializers.BooleanField()


class CriteriaResponseBlockDocumentSerializer(serializers.Serializer):
    file_data = serializers.FileField(write_only=True)
    response_block_id = serializers.IntegerField()
    options = serializers.JSONField()

    def validate(self, attrs):
        try:
            response_block = CriteriaBlockResponse.objects.get(id=attrs['response_block_id'])
            if response_block.criteria_response.response_by.user_id != self.context['requested_user'].id:
                raise ValidationError('Only the response creator can add documents')
        except CriteriaBlockResponse.DoesNotExist:
            raise ValidationError('Criteria response block not found')
        return attrs

    def create(self, validated_data):
        uploaded_document_info = UploadDocumentService.upload(
            document_data=validated_data['file_data']
        )  # type: UploadedDocumentInfo

        response_block = CriteriaBlockResponse.objects.get(id=validated_data['response_block_id'])
        company = response_block.block.criteria.fund.company
        company_user = CompanyUser.objects.get(company=company, user=self.context['requested_user'])

        document = Document.objects.create(
            partner_id=uuid.uuid4().hex,
            company=company,
            content_type=uploaded_document_info.content_type,
            title=validated_data['file_data'].name,
            extension=uploaded_document_info.extension,
            document_id=uploaded_document_info.document_id,
            document_path=uploaded_document_info.document_path,
            document_type=Document.DocumentType.ELIGIBILITY_CRITERIA_DOCUMENT,
            file_date=timezone.now().date(),
            uploaded_by_user=company_user,
            access_scope=Document.AccessScopeOptions.USER_ONLY.value
        )
        ResponseBlockDocument.objects.create(
            document=document,
            response_block_id=validated_data['response_block_id'],
            payload={'options': validated_data['options']}
        )
        resolve_comments_for_response_block(response_block=response_block, company=company)
        return validated_data


class ResponseBlockDocumentReadSerializer(serializers.ModelSerializer):
    document_name = serializers.CharField(source='document.title', default=None)
    document_id = serializers.CharField(source='document.document_id', default=None)
    doc_id = serializers.IntegerField(source='document_id', default=None)
    extension = serializers.CharField(source='document.extension', default=None)

    class Meta:
        model = ResponseBlockDocument
        fields = '__all__'


class CriteriaInvestmentAmountSerializer(serializers.Serializer):
    amount = serializers.SerializerMethodField()
    leverage = serializers.SerializerMethodField()
    total_gross_investment = serializers.SerializerMethodField()
    total_by_fund_size = serializers.SerializerMethodField()
    percentage_by_fund_size = serializers.SerializerMethodField()

    def __init__(self, instance=None, data=empty, **kwargs):
        self.fund = kwargs['context'].pop('fund')
        super().__init__(instance, data, context=kwargs['context'])

    def get_amount(self, _):
        return self.context['amount']

    def get_leverage(self, _):
        return self.context['leverage']

    def get_total_gross_investment(self, _):
        self.total_gross_investment = round(float(self.context['total_investment']), ndigits=3)
        return self.total_gross_investment

    def get_total_by_fund_size(self, _):
        if self.fund.target_fund_size:
            return round(self.total_gross_investment / float(self.fund.target_fund_size), ndigits=3)

        return 0

    # Return the percentage to avoid having to parse and round on the frontend
    def get_percentage_by_fund_size(self, _):
        if self.fund.target_fund_size:
            return round(self.context['leverage'] / float(self.fund.target_fund_size) * 100.0, ndigits=2)

        return 0


class BulkPublishSerializer(serializers.Serializer):
    criteria_ids = serializers.ListField(child=serializers.IntegerField())


class CriteriaBlockPositionUpdateSerializer(serializers.Serializer):
    new_position = serializers.IntegerField()


class CustomSmartBlockFieldSerializer(serializers.ModelSerializer):
    nested_fields = serializers.SerializerMethodField()

    class Meta:
        model = CustomSmartBlockField
        fields = '__all__'

    def validate(self, attrs):
        if attrs.get('required_documents'):
            required_documents = attrs['required_documents']
            if not (required_documents.get('title') and required_documents.get('description')):
                attrs['required_documents'] = {}
        return attrs

    @staticmethod
    def get_nested_fields(obj: CustomSmartBlockField):
        return CustomSmartBlockFieldSerializer(obj.nested_fields.all(), many=True).data


class CustomSmartBlockSerializer(serializers.ModelSerializer):
    custom_fields = serializers.SerializerMethodField()

    class Meta:
        model = CustomSmartBlock
        fields = '__all__'
        read_only_fields = ('company', 'created_by', 'custom_fields')

    @staticmethod
    def get_custom_fields(obj: CustomSmartBlock):
        return CustomSmartBlockFieldSerializer(obj.custom_fields.filter(parent_field__isnull=True), many=True).data

    def create(self, validated_data):
        validated_data['company'] = self.context['company']
        validated_data['created_by'] = self.context['admin_user']
        custom_block = super().create(validated_data)
        criteria = validated_data['eligibility_criteria']
        criteria_block_data = {
            'custom_block': custom_block,
            'criteria': criteria,
            'is_custom_block': True,
            'is_smart_view': criteria.is_smart_criteria
        }
        CreateEligibilityCriteriaBlockService.create(
            criteria=criteria,
            validated_data=criteria_block_data
        )
        return custom_block


class CriteriaBlockSerializer(serializers.ModelSerializer):
    block = BlockSerializer(read_only=True)
    custom_block = CustomSmartBlockSerializer(read_only=True)
    block_connected_to = CriteriaBlockConnectorSerializer(many=True, read_only=True)
    criteria_block_documents = CriteriaBlockDocumentSerializer(many=True)

    class Meta:
        model = CriteriaBlock
        fields = '__all__'

    def update(self, instance, validated_data):
        if validated_data.get('payload'):
            payload = validated_data['payload']
            if payload.get('option'):
                option = payload['option']
                if instance.block.block_id == KNOWLEDGE_EMPLOYEE_ID:
                    option['is_knowledgeable'] = True
                action = payload.get('action', '').lower().strip()
                current_options = instance.payload.get('options', [])
                if action == 'add':
                    updated_options = [*current_options, option]
                elif action == 'delete':
                    updated_options = [opt for opt in current_options if opt['id'] != option['id']]
                elif action == 'update':
                    updated_options = []
                    for current_option in current_options:
                        if current_option['id'] == option['id']:
                            current_option['text'] = option['text']
                        updated_options.append(current_option)
                else:
                    updated_options = current_options
                payload['options'] = updated_options
            validated_data['payload'] = {**instance.payload, **validated_data['payload']}
        return super().update(instance, validated_data)


class FundEligibilityCriteriaDetailSerializer(serializers.ModelSerializer):
    criteria_blocks = CriteriaBlockSerializer(many=True)
    connectors = serializers.SerializerMethodField()
    fund_slug = serializers.CharField(source='fund.slug', default=None)
    fund_external_id = serializers.CharField(source='fund.external_id', default=None)
    countries = serializers.SerializerMethodField()
    is_publishable = serializers.SerializerMethodField()
    has_requested_review = serializers.SerializerMethodField()
    is_published = serializers.SerializerMethodField()
    has_requested_changes = serializers.SerializerMethodField()
    is_creator = serializers.SerializerMethodField()
    fund_name = serializers.SerializerMethodField()
    selected_region_country_codes = serializers.SerializerMethodField()
    name = serializers.SerializerMethodField()
    has_custom_logic_block = serializers.SerializerMethodField()

    class Meta:
        model = FundEligibilityCriteria
        fields = '__all__'
        read_only_fields = ('criteria_blocks', 'connectors',)

    @staticmethod
    def get_countries(obj: FundEligibilityCriteria):
        countries = obj.criteria_countries.all()
        regions = obj.criteria_regions.all()
        seen_countries = set()
        criteria_countries = []

        def process_country(country_obj: Country):
            if country_obj.id in seen_countries:
                return
            seen_countries.add(country_obj.id)
            criteria_countries.append({'label': country_obj.name, 'value': country_obj.iso_code})

        for criteria_region in regions:
            region = criteria_region.region
            for country in region.countries.all():
                process_country(country)

        for criteria_country in countries:
            country = criteria_country.country
            process_country(country)

        return criteria_countries

    @staticmethod
    def get_is_publishable(obj: FundEligibilityCriteria):
        return obj.status == FundEligibilityCriteria.CriteriaStatusChoice.APPROVED.value

    @staticmethod
    def get_has_requested_review(obj: FundEligibilityCriteria):
        return obj.workflow.workflow_tasks.filter(task_type=Task.TaskTypeChoice.REVIEW_REQUEST).exists()

    @staticmethod
    def get_is_published(obj: FundEligibilityCriteria):
        return obj.status == FundEligibilityCriteria.CriteriaStatusChoice.PUBLISHED.value

    @staticmethod
    def get_has_requested_changes(obj: FundEligibilityCriteria):
        return obj.workflow.workflow_tasks.filter(
            task_type=Task.TaskTypeChoice.CHANGES_REQUESTED.value,
            completed=False
        ).exists()

    def get_is_creator(self, obj: FundEligibilityCriteria):
        admin_user = self.context.get('admin_user')
        if not admin_user:
            return False
        return obj.created_by_id == admin_user.id

    @staticmethod
    def get_fund_name(obj: FundEligibilityCriteria):
        return obj.fund.name

    @staticmethod
    def get_name(obj: FundEligibilityCriteria):
        return obj.name

    @staticmethod
    def get_selected_region_country_codes(obj: FundEligibilityCriteria):
        return get_criteria_selected_region_country_codes(eligibility_criteria=obj)

    @staticmethod
    def get_has_custom_logic_block(obj: FundEligibilityCriteria):
        return obj.get_has_custom_logic_block()

    @staticmethod
    def get_connectors(obj: FundEligibilityCriteria):
        connectors = []
        for connector in CriteriaBlockConnector.objects.filter(from_block__criteria=obj):
            connectors.append(CriteriaBlockConnectorSerializer(connector).data)

        return connectors


class SmartDecisionBlockConnectorSerializer(serializers.ModelSerializer):
    class Meta:
        model = CriteriaBlockConnector
        fields = ('from_block', 'from_option', 'to_block',)

    def create(self, validated_data):
        return SmartDecisionBlockService.create(self.context['criteria'], validated_data=validated_data)


class CustomSmartBlockTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomSmartBlockTemplate
        fields = '__all__'


class CustomSmartBlockTemplateCreateSerializer(serializers.Serializer):
    criteria_id = serializers.IntegerField()
    company = serializers.IntegerField()

    def create(self, validated_data):
        criteria_blocks = CriteriaBlock.objects.filter(
            criteria_id=validated_data['criteria_id'],
            is_custom_block=True,
            custom_block__is_template=True
        )
        for block in criteria_blocks:
            block_data = CustomSmartBlockSerializer(block.custom_block).data
            template_exists = CustomSmartBlockTemplate.objects.filter(
                company_id=validated_data['company'],
                slug=slugify(block_data['title']),
                deleted=False
            ).exists()
            if template_exists:
                continue

            CustomSmartBlockTemplate.objects.create(
                company_id=validated_data['company'],
                title=block_data['title'],
                slug=slugify(block_data['title']),
                description=block_data['description'],
                is_multiple_selection_enabled=block_data['is_multiple_selection_enabled'],
                custom_fields=block_data['custom_fields']
            )
        return validated_data

