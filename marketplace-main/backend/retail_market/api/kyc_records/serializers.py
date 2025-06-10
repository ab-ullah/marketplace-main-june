import uuid
from typing import Iterable

from django.db.transaction import atomic
from django.forms.models import model_to_dict
from django.utils import timezone
from rest_framework import serializers
from rest_framework.exceptions import ValidationError

from api.cards.models import Workflow
from api.cards.serializers import WorkflowLiteSerializer
from api.comments.models import ApplicationComment, ModuleChoices
from api.comments.services.update_comment_status import UpdateCommentService
from api.companies.models import CompanyUser
from api.documents.models import Document, KYCDocument
from api.documents.serializers import DocumentDetailSerializer
from api.documents.services.upload_document import UploadDocumentService, UploadedDocumentInfo
from api.eligibility_criteria.models import EligibilityCriteriaResponse
from api.funds.models import Fund
from api.kyc_records.models import KYCInvestorType, KYCRiskEvaluation
from api.kyc_records.models import KYCRecord, KYCStatuses
from api.kyc_records.services.check_and_start_kyc_review import CheckAndStartKYCReview
from api.kyc_records.services.create_kyc_workflow import GetKycWorkflow
from api.kyc_records.services.kyc_version_service import KYCVersionHistory
from api.kyc_records.utils import reset_kyc_record_approval
from api.users.serializers import RetailUserInfoSerializer

KYC_SKIP_UPDATE_FIELD = ('status', 'approved', 'review_workflow', 'tax_record', 'payment_detail')


class KYCSerializer(serializers.ModelSerializer):
    user = RetailUserInfoSerializer(read_only=True)
    workflow = WorkflowLiteSerializer(read_only=True)
    kyc_investor_type_name = serializers.SerializerMethodField()
    # investment_detail = serializers.SerializerMethodField(read_only=True)
    email = serializers.SerializerMethodField(read_only=True)
    risk_evaluation = serializers.IntegerField(source='risk_value_kyc.risk_value', default=None, read_only=True)
    fund_external_id = serializers.CharField(write_only=True, required=False, allow_null=True)
    kyc_participants = serializers.SerializerMethodField()

    @staticmethod
    def validate_required_field_by_dependency(field_id, errors, attrs, dependency):
        dependency_field = dependency.get('field')
        actual_value = str(attrs.get(dependency_field)) if dependency_field in attrs else None
        dependency_relation = dependency.get('relation')
        if dependency_relation == 'equals':
            dependency_value = str(dependency.get('value'))
            if dependency_value == actual_value:
                errors[field_id] = "This field is required"
                return
        elif dependency_relation == 'not equals':
            dependency_value = str(dependency.get('value'))
            if dependency_value != actual_value:
                errors[field_id] = "This field is required"
                return
        elif dependency_relation == 'in':
            dependency_value = list(map(lambda x: str(x), dependency.get('value')))
            if actual_value in dependency_value:
                errors[field_id] = "This field is required"
                return
        elif dependency_relation == 'not in':
            dependency_value = list(map(lambda x: str(x), dependency.get('value')))
            if actual_value not in dependency_value:
                errors[field_id] = "This field is required"
                return

    @staticmethod
    def validate_required_field(field, errors, attrs):
        field_id = field.get('id')
        value = attrs.get(field_id) if field_id in attrs else None
        if value is not None:
            # The value exists, nothing else to validate
            return
        field_dependencies = field.get('field_dependencies')
        if isinstance(field_dependencies, Iterable):
            [KYCSerializer.validate_required_field_by_dependency(field_id, errors, attrs, dependency) for dependency in
             field_dependencies]
        else:
            # there are not field dependencies
            errors[field.get('id')] = "This field is required"
            return

    @staticmethod
    def validate_wf_schema(new_data, workflow: Workflow):
        errors = {}
        fund_external_id = new_data.get('fund_external_id')
        fund = None
        if fund_external_id:
            fund = Fund.objects.filter(external_id=fund_external_id).first()
        for card in workflow.cards.filter(kyc_investor_type=new_data['kyc_investor_type']).all():
            for field in card.schema:
                if fund and fund.skip_net_worth_question and field.get('id') == 'net_worth':
                    continue
                if field.get('required') and field.get('type') != 'file_upload':
                    KYCSerializer.validate_required_field(field, errors, new_data)
        if errors:
            raise serializers.ValidationError(errors)

    def validate(self, attrs):
        user = self.context.get('requested_user')
        if not user:
            user = self.context['request'].user
        attrs['user'] = user
        wf_slug = self.context['view'].kwargs['wf_slug']
        workflow = Workflow.objects.filter(company_id__in=self.context['view'].company_ids,
                                           slug=wf_slug).select_related('company').first()
        attrs['workflow'] = workflow
        attrs['company'] = workflow.company
        return attrs

    def update(self, instance: KYCRecord, validated_data):
        user = validated_data.pop('user', None)
        validated_data.pop('approved', None)
        fund_external_id = validated_data.pop('fund_external_id', None)
        module = ApplicationComment.ModuleChoices.KYC_RECORD.value
        prefix = None
        if instance.kyc_investor_type == KYCInvestorType.PARTICIPANT.value:
            module = ApplicationComment.ModuleChoices.PARTICIPANT.value
            prefix = f'participant_{instance.id}'

        update_comment_status_service = UpdateCommentService(
            module=module,
            instance=instance,
            update_values=validated_data
        )

        is_record_updated = False
        for field, value in validated_data.items():
            if not hasattr(instance, field):
                continue

            if field.lower() in KYC_SKIP_UPDATE_FIELD:
                continue

            current_value = getattr(instance, field)
            if value != current_value:
                is_record_updated = True
                break

        if is_record_updated:
            reset_kyc_record_approval(
                kyc_record=instance,
                fund_external_id=fund_external_id,
                user=user
            )
            validated_data['approved'] = False

        updated_instance = super().update(instance, validated_data)
        if fund_external_id and not updated_instance.is_participant_record():
            CheckAndStartKYCReview.async_check_and_start_review(
                fund_external_id=fund_external_id,
                kyc_record=updated_instance
            )
        update_comment_status_service.update_comments_status(prefix=prefix)
        return updated_instance

    def get_kyc_investor_type_name(self, obj: KYCRecord):
        return KYCInvestorType(obj.kyc_investor_type).name


    def get_kyc_participants(self, obj):
        if self.context.get('application'):
            participants = KYCVersionHistory(
                application=self.context['application'],
                kyc_record=obj
            ).get_participants()
        else:
            participants = obj.kyc_participants.all()
        return KYCParticipantSerializer(participants, many=True).data


class BooleanComponentField(serializers.Field):

    def to_representation(self, value):
        if not value is None:
            if value:
                return 't'
            else:
                return 'f'
        return None

    def to_internal_value(self, data):
        if str(data).lower() in ['t', 'true', '1', 'on']:
            return True
        else:
            return False


class KYCTopRecordSerializer(KYCSerializer):

    def validate(self, attrs):
        super().validate(attrs)

        if self.instance is None:  # is kyc record creation flow
            record_count = KYCRecord.objects.filter(user=attrs['user'],
                                                    workflow=attrs['workflow'],
                                                    deleted=False) \
                .exclude(kyc_investor_type=KYCInvestorType.PARTICIPANT).count()
            if record_count > 0:
                raise serializers.ValidationError('User already has a KYC record for the given workflow')
        if attrs.get('status') in [KYCStatuses.SUBMITTED, KYCStatuses.APPROVED]:
            new_data = model_to_dict(self.instance) if self.instance is not None else {}
            new_data.update(self.initial_data)
            super().validate_wf_schema(new_data, attrs['workflow'])
            participants = list(
                self.instance.kyc_participants.values_list('id', flat=True).filter(status=KYCStatuses.CREATED).order_by(
                    'id').all())
            if participants:
                raise serializers.ValidationError(
                    'Participants with ids {} are not ready yet.'.format(participants))
        return attrs

    def create(self, validated_data):
        validated_data['user'] = self.context['requested_user']
        return super().create(validated_data)

    # def get_investment_detail(self, obj: KYCRecord):
    #     max_leverage = None
    #     if obj.max_leverage_ratio:
    #         max_leverage = int(obj.max_leverage_ratio)
    #     return {
    #         'requested_leverage': None,
    #         'max_leverage': f'{max_leverage}:1' if max_leverage else None,
    #         'final_leverage': None,
    #         'requested_entity': None,
    #         'final_entity': None,
    #         'total_investment': None,
    #         'eligibility_decision': None,
    #         'final_leverage_ratio': None,
    #         'eligibility_type': None,
    #         'id': None,
    #         'leverage_option_description': None,
    #     }
    #
    #     try:
    #         latest_criteria_response = EligibilityCriteriaResponse.objects.filter(
    #             kyc_record=obj
    #         ).select_related('investment_amount').latest('created_at')
    #         if not latest_criteria_response.investment_amount:
    #             return investment_detail
    #
    #         investment_amount = latest_criteria_response.investment_amount
    #         requested_entity = float(investment_amount.amount)
    #
    #         if not max_leverage:
    #             max_leverage = investment_amount.leverage_ratio
    #
    #         leverage_ratio = f'{int(investment_amount.leverage_ratio)}:1'
    #
    #         final_amount = investment_amount.amount
    #         final_leverage = investment_amount.leverage_ratio
    #
    #         if investment_amount.final_amount:
    #             final_amount = investment_amount.final_amount
    #         if investment_amount.has_final_leverage_set():
    #             final_leverage = investment_amount.final_leverage_ratio
    #
    #         total_investment = float(final_amount) + float(final_leverage) * float(final_amount)
    #         investment_detail['final_entity'] = final_amount
    #         investment_detail['final_leverage_ratio'] = f'{int(final_leverage)}:1'
    #
    #         investment_detail['id'] = investment_amount.id
    #         investment_detail['requested_leverage'] = leverage_ratio
    #         investment_detail['max_leverage'] = f'{max_leverage}:1'
    #         investment_detail['requested_entity'] = requested_entity
    #
    #         eligibility_decision = 'Approved' if latest_criteria_response.is_approved else 'Pending'
    #         investment_detail['total_investment'] = total_investment
    #         eligibility_type = 'Knowledgeable' if latest_criteria_response.is_knowledgeable else 'Financial'
    #         investment_detail['eligibility_decision'] = eligibility_decision
    #         investment_detail['eligibility_type'] = eligibility_type
    #         investment_detail['leverage_option_description'] = investment_amount.leverage_option_description
    #
    #         return investment_detail

        # except EligibilityCriteriaResponse.DoesNotExist:
        #     return investment_detail

    def get_email(self, obj: KYCRecord):
        return obj.user.email

    def get_kyc_investor_type_name(self, obj: KYCRecord):
        return KYCInvestorType(obj.kyc_investor_type).name


class KYCIndividualSerializer(KYCTopRecordSerializer):
    is_lasalle_or_jll_employee = BooleanComponentField(required=False, allow_null=True)
    pollitically_exposed_person = BooleanComponentField(required=False, allow_null=True)
    is_us_citizen = BooleanComponentField(required=False, allow_null=True)
    applicant_owned_by_another_entity = BooleanComponentField(required=False, allow_null=True)
    direct_parent_owned_by_another_entity = BooleanComponentField(required=False, allow_null=True)
    applicant_organized_for_specific_purpose_of_investing = BooleanComponentField(required=False, allow_null=True)

    def validate(self, attrs):
        super().validate(attrs)
        attrs['kyc_investor_type'] = KYCInvestorType.INDIVIDUAL
        return attrs

    def get_kyc_participants(self, obj):
        return []

    class Meta:
        model = KYCRecord
        fields = '__all__'
        read_only_fields = ('workflow', 'company', 'id', 'user', 'investment_detail')


class KYCParticipantSerializer(KYCSerializer):
    kyc_investor_type_name = serializers.SerializerMethodField()
    one_director = BooleanComponentField(required=False, allow_null=True)

    def validate(self, attrs):
        attrs = super().validate(attrs)
        kyc_entity = KYCRecord.objects.filter(id=self.context['view'].kwargs['kyc_record_id']).get()
        attrs['kyc_entity'] = kyc_entity
        attrs['kyc_investor_type'] = KYCInvestorType.PARTICIPANT
        if attrs.get('status') in [KYCStatuses.SUBMITTED, KYCStatuses.APPROVED]:
            new_data = model_to_dict(self.instance) if self.instance is not None else {}
            new_data.update(self.initial_data)
            super().validate_wf_schema(new_data, attrs['workflow'])
        return attrs

    def get_kyc_participants(self, obj):
        return []

    def get_kyc_investor_type_name(self, obj: KYCRecord):
        return KYCInvestorType(obj.kyc_investor_type).name

    class Meta:
        model = KYCRecord
        fields = ('id', 'kyc_investor_type', 'kyc_investor_type_name',
                  'first_name', 'last_name', 'occupation',
                  'citizenship_country',
                  'id_document_type', 'id_issuing_country',
                  'id_expiration_date', 'number_of_id',
                  'source_of_wealth', 'status', 'uuid', 'entity_name', 'date_of_formation',
                  'jurisdiction', 'nature_of_business', 'registered_address', 'source_of_funds', 'one_director',
                  'fund_external_id'
                  )
        read_only_fields = ('id', 'kyc_investor_type', 'uuid',)


class KYCPrivateCompanySerializer(KYCTopRecordSerializer):
    is_lasalle_or_jll_employee = BooleanComponentField(required=False, allow_null=True)
    pollitically_exposed_person = BooleanComponentField(required=False, allow_null=True)
    is_us_citizen = BooleanComponentField(required=False, allow_null=True)
    applicant_owned_by_another_entity = BooleanComponentField(required=False, allow_null=True)
    direct_parent_owned_by_another_entity = BooleanComponentField(required=False, allow_null=True)
    applicant_organized_for_specific_purpose_of_investing = BooleanComponentField(required=False, allow_null=True)

    def validate(self, attrs):
        super().validate(attrs)
        attrs['kyc_investor_type'] = KYCInvestorType.PRIVATE_COMPANY
        return attrs

    class Meta:
        model = KYCRecord
        fields = '__all__'
        read_only_fields = ('workflow', 'company', 'id', 'user', 'kyc_participants', 'investment_detail', 'uuid')


class KYCLimitedPartnershipSerializer(KYCTopRecordSerializer):
    is_lasalle_or_jll_employee = BooleanComponentField(required=False, allow_null=True)
    pollitically_exposed_person = BooleanComponentField(required=False, allow_null=True)
    general_partnership_is_a_private_company = BooleanComponentField(required=False, allow_null=True)
    is_us_citizen = BooleanComponentField(required=False, allow_null=True)
    applicant_owned_by_another_entity = BooleanComponentField(required=False, allow_null=True)
    direct_parent_owned_by_another_entity = BooleanComponentField(required=False, allow_null=True)
    applicant_organized_for_specific_purpose_of_investing = BooleanComponentField(required=False, allow_null=True)

    def validate(self, attrs):
        attrs['kyc_investor_type'] = KYCInvestorType.LIMITED_PARTNERSHIP
        return super().validate(attrs)

    class Meta:
        model = KYCRecord
        fields = '__all__'
        read_only_fields = ('workflow', 'company', 'id', 'user', 'kyc_participants', 'investment_detail', 'uuid')


class KYCTrustSerializer(KYCTopRecordSerializer):
    is_lasalle_or_jll_employee = BooleanComponentField(required=False, allow_null=True)
    pollitically_exposed_person = BooleanComponentField(required=False, allow_null=True)
    general_partnership_is_a_private_company = BooleanComponentField(required=False, allow_null=True)
    is_us_citizen = BooleanComponentField(required=False, allow_null=True)
    applicant_owned_by_another_entity = BooleanComponentField(required=False, allow_null=True)
    direct_parent_owned_by_another_entity = BooleanComponentField(required=False, allow_null=True)
    applicant_organized_for_specific_purpose_of_investing = BooleanComponentField(required=False, allow_null=True)

    def validate(self, attrs):
        attrs['kyc_investor_type'] = KYCInvestorType.TRUST
        return super().validate(attrs)

    class Meta:
        model = KYCRecord
        fields = '__all__'
        read_only_fields = ('workflow', 'company', 'id', 'user', 'kyc_participants', 'investment_detail', 'uuid')


class DocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Document
        fields = ('title', 'document_id', 'id')
        read_only_fields = ('id',)


class KYChoicesSerializer(serializers.Serializer):
    label = serializers.CharField(source=1)
    value = serializers.CharField(source=0)


class KYCSchemaSerializer(serializers.Serializer):
    id = serializers.CharField()
    label = serializers.CharField()
    required = serializers.BooleanField()
    type = serializers.CharField()
    data = serializers.SerializerMethodField()

    def get_data(self, obj):
        data = {'options': [], 'placeholder': obj['id'].title().replace('_', ' ')}
        if obj.get('data'):
            for option in obj['data']:
                opt = {'value': option[0], 'label': option[1]}
                data['options'].append(opt)
        return data


class KYCDocumentSerializer(serializers.Serializer):
    file_data = serializers.FileField(write_only=True)
    fund_external_id = serializers.CharField(write_only=True, required=False, allow_null=True)
    record_id = serializers.IntegerField(source='kyc_record_id')
    field_id = serializers.CharField(source='kyc_record_file_id')
    document = DocumentSerializer(read_only=True)

    def create(self, validated_data):
        uploaded_document_info = UploadDocumentService.upload(
            document_data=validated_data['file_data']
        )  # type: UploadedDocumentInfo

        kyc_record = KYCRecord.objects.get(id=validated_data['kyc_record_id'])
        company = kyc_record.company

        is_uploaded_by_admin = self.context.get('uploaded_by_admin')
        if is_uploaded_by_admin:
            kyc_user = kyc_record.kyc_owner()
        else:
            kyc_user = self.context['requested_user']

        if not kyc_user:
            raise ValidationError(f'Unable to find the owner of kyc record with id: {kyc_record.id}')

        company_user = CompanyUser.objects.get(
            company=company,
            user=kyc_user
        )

        user_fields = {'uploaded_by_user': company_user}
        if is_uploaded_by_admin:
            user_fields['uploaded_by_admin'] = self.context['admin_user']

        partner_id = uuid.uuid4().hex
        document = Document.objects.create(
            partner_id=partner_id,
            content_type=uploaded_document_info.content_type,
            title=validated_data['file_data'].name,
            extension=uploaded_document_info.extension,
            document_id=uploaded_document_info.document_id,
            document_path=uploaded_document_info.document_path,
            document_type=Document.DocumentType.KYC_DOCUMENT,
            file_date=timezone.now().date(),
            company=kyc_record.company,
            access_scope=Document.AccessScopeOptions.USER_ONLY.value,
            **user_fields,
        )
        KYCDocument.objects.create(
            document=document,
            partner_id=partner_id,
            kyc_record_id=validated_data['kyc_record_id'],
            kyc_record_file_id=validated_data['kyc_record_file_id']
        )

        fund_external_id = validated_data.get('fund_external_id')
        if fund_external_id:
            reset_kyc_record_approval(
                kyc_record=kyc_record,
                fund_external_id=validated_data['fund_external_id'],
                user=kyc_user
            )

        if fund_external_id and not kyc_record.is_participant_record():
            CheckAndStartKYCReview.async_check_and_start_review(
                fund_external_id=fund_external_id,
                kyc_record=kyc_record
            )

        return validated_data


class KYCRiskEvaluationSerializer(serializers.ModelSerializer):
    class Meta:
        model = KYCRiskEvaluation
        fields = '__all__'
        read_only_fields = ('kyc_record', 'reviewer')

    def create(self, validated_data):
        validated_data['reviewer'] = self.context['admin_user']
        validated_data['kyc_record_id'] = self.context['kyc_id']
        instance, _ = KYCRiskEvaluation.objects.update_or_create(
            kyc_record_id=validated_data['kyc_record_id'],
            defaults=validated_data
        )
        return instance


class KYCInvestorTypeUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = KYCRecord
        fields = ('kyc_investor_type',)

    def update(self, instance, validated_data):
        if instance.kyc_investor_type == validated_data['kyc_investor_type']:
            return instance

        with atomic():
            workflow = GetKycWorkflow(
                fund=self.context['fund'],
                kyc_entity_type=validated_data['kyc_investor_type']
            ).get()
            validated_data['workflow'] = workflow
            return super().update(instance, validated_data)


class KYCRecordBaseSerializer(serializers.ModelSerializer):
    class Meta:
        model = KYCRecord
        exclude = (
            'created_at',
            'modified_at',
            'id',
            'uuid',
            'user',
            'workflow',
            'company',
            'review_workflow',
            'deleted'
        )


class KYCAdminDocumentSerializer(serializers.ModelSerializer):
    document = DocumentDetailSerializer()

    class Meta:
        model = KYCDocument
        fields = '__all__'


class KYCAdminSerializerWithDocuments(serializers.ModelSerializer):
    kyc_documents = KYCAdminDocumentSerializer(many=True)
    display_name = serializers.SerializerMethodField()

    class Meta:
        model = KYCRecord
        fields = (
            'id',
            'kyc_documents',
            'display_name',
            'id_document_type',
            'id_issuing_country',
            'id_expiration_date',
            'number_of_id',
            'uuid'
        )

    @staticmethod
    def get_display_name(obj: KYCRecord):
        return obj.get_display_name()


class KYCExpirationSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source='user.email')
    record_type = serializers.SerializerMethodField()

    class Meta:
        model = KYCRecord
        fields = (
            'email',
            'first_name',
            'last_name',
            'id_document_type',
            'id_expiration_date',
            'id_expiration_date',
            'record_type',
        )

    @staticmethod
    def get_record_type(obj: KYCRecord):
        return obj.get_kyc_investor_type_display()
