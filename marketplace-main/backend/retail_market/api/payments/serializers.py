from django.db.transaction import atomic
from rest_framework import serializers
from rest_framework.exceptions import ValidationError

from api.applications.services.pre_document_signing_review_service import PreDocumentSigningReviewService
from api.applications.utils import get_application_or_404
from api.comments.models import ModuleChoices
from api.comments.services.update_comment_status import UpdateCommentService
from api.geographics.serializers import CountrySerializer
from api.payments.models import PaymentDetail
from api.workflows.models import WorkFlow


class PaymentDetailSerializer(serializers.ModelSerializer):
    fund_external_id = serializers.CharField(write_only=True, required=False, allow_null=True, allow_blank=True)

    class Meta:
        model = PaymentDetail
        fields = "__all__"
        read_only_fields = ('user',)

    def validate(self, attrs):
        country = attrs['bank_country']

        if country.iso_code == "US":
            self.validate_us_fields(attrs)
        elif country.iso_code == "UK":
            self.validate_uk_fields(attrs)
        else:
            self.validate_non_us_fields(attrs)

        return attrs

    def validate_us_fields(self, attrs):
        required_fields = ['state', 'routing_number']

        if errors := self.validate_required_fields(required_fields, attrs):
            raise ValidationError(errors)

    def validate_uk_fields(self, attrs):
        required_fields = ['swift_code']
        self.add_required_fields_for_intermediary_bank(required_fields, attrs)

        if errors := self.validate_required_fields(required_fields, attrs):
            raise ValidationError(errors)

    def validate_non_us_fields(self, attrs):
        # required_fields = ['province', 'swift_code', 'iban_number']
        required_fields = ['swift_code', 'iban_number']
        self.add_required_fields_for_intermediary_bank(required_fields, attrs)

        if errors := self.validate_required_fields(required_fields, attrs):
            raise ValidationError(errors)

    @staticmethod
    def add_required_fields_for_intermediary_bank(required_fields, attrs):
        if attrs.get('have_intermediary_bank') and not all(
                (attrs.get('intermediary_bank_name'), attrs.get('intermediary_bank_swift_code'))
        ):
            if not attrs.get('intermediary_bank_name'):
                required_fields.extend(['intermediary_bank_name'])
            if not attrs.get('intermediary_bank_swift_code'):
                required_fields.extend(['intermediary_bank_swift_code'])

    @staticmethod
    def validate_required_fields(fields, attrs):
        return {
            _field: 'This field is required'
            for _field in fields
            if not attrs.get(_field)
        }

    def create(self, validated_data):
        with atomic():
            retail_user = self.context['requested_user']
            company = self.context['company']
            fund_external_id = self.context['fund_external_id']
            validated_data['user'] = retail_user

            application = get_application_or_404({
                'user_id': retail_user.id,
                'fund__external_id': fund_external_id,
                'company': company
            })

            if application.payment_detail:
                payment_detail = application.payment_detail
                for attr, value in validated_data.items():
                    setattr(payment_detail, attr, value)
                    payment_detail.save()
            else:
                payment_detail = super().create(validated_data)
                application.payment_detail = payment_detail
                application.save()

            if application.kyc_record.payment_detail != payment_detail:
                application.kyc_record.payment_detail = payment_detail
                application.kyc_record.save()

            application.has_submitted_banking_details = True
            application.save()

            fund_enabled_workflow = application.fund.get_enabled_workflows()
            if fund_enabled_workflow.get(WorkFlow.WorkFlowModuleChoices.PRE_DOCUMENT_SIGNING.value):
                PreDocumentSigningReviewService(
                    application=application
                ).start_review()
            return payment_detail

    def update(self, instance, validated_data):
        fund_external_id = validated_data.pop('fund_external_id', None)
        update_comment_status_service = UpdateCommentService(
            module=ModuleChoices.BANKING_DETAILS.value,
            instance=instance,
            update_values=validated_data
        )
        updated_instance = super().update(instance, validated_data)
        update_comment_status_service.update_comments_status()

        if fund_external_id:
            application = get_application_or_404({
                'user_id': instance.user.id,
                'fund__external_id': fund_external_id,
            })
            fund_enabled_workflow = application.fund.get_enabled_workflows()
            if fund_enabled_workflow.get(WorkFlow.WorkFlowModuleChoices.PRE_DOCUMENT_SIGNING.value):
                PreDocumentSigningReviewService(
                    application=application
                ).start_review()
        return updated_instance


class PaymentDetailReadSerializer(serializers.ModelSerializer):
    bank_country = CountrySerializer()

    class Meta:
        model = PaymentDetail
        fields = "__all__"
