from django.db import transaction
from rest_framework import serializers

from api.agreements.models import ApplicantAgreementDocument, AgreementDocumentWitness, ApplicationWitness
from api.agreements.services.create_applicant_agreement_documents import CreateApplicantAgreementDocument
from api.documents.serializers import DocumentSerializer
from api.kyc_records.models import KYCRecord
from api.workflows.services.user_on_boarding_workflow import UserOnBoardingWorkFlowService
from api.companies.models import CompanyUser


class WitnessSerializer(serializers.ModelSerializer):
    class Meta:
        model = ApplicationWitness
        fields = '__all__'
        read_only_fields = ('application',)

    @staticmethod
    def get_company_user(application):
        return CompanyUser.objects.get(
            company=application.company,
            user=application.user
        )

    def create(self, validated_data):
        with transaction.atomic():
            validated_data['application'] = self.context['application']
            application_witness = super().create(validated_data)
            CreateApplicantAgreementDocument(application=self.context['application']).create()
            workflow_service = UserOnBoardingWorkFlowService(
                fund=self.context['application'].fund,
                company_user=self.get_company_user(self.context['application']),
                transferred_application_id=self.context['application'].id if self.context['application'].is_transferred else None
            )
            workflow_service.get_or_create_agreement_workflow()
        return application_witness


class AgreementDocumentWitnessSerializer(serializers.ModelSerializer):
    class Meta:
        model = AgreementDocumentWitness
        fields = '__all__'


class ApplicantAgreementDocumentSerializer(serializers.ModelSerializer):
    agreement_witness = AgreementDocumentWitnessSerializer()
    signed_document = DocumentSerializer()
    certificate = DocumentSerializer()
    document = DocumentSerializer(source='agreement_document.document')
    status = serializers.SerializerMethodField()
    is_gp_signer = serializers.SerializerMethodField()

    class Meta:
        model = ApplicantAgreementDocument
        fields = '__all__'

    @staticmethod
    def get_status(obj: ApplicantAgreementDocument):
        if not obj.completed:
            return 'pending your signature'

        # if hasattr(obj, 'agreement_witness') and obj.agreement_witness.completed:
        #     return 'signed'
        #
        # return 'pending witness signature'
        return 'signed'

    def get_is_gp_signer(self, obj: ApplicantAgreementDocument):
        admin_user = self.context.get('admin_user')
        if obj.agreement_document.gp_signer and admin_user:
            if admin_user.id == obj.agreement_document.gp_signer.id:
                return True
        return False


class WitnessRequestorSerializer(serializers.ModelSerializer):
    first_name = serializers.CharField(
        source='applicant_agreement_document.application.kyc_record.first_name',
        default=None
    )
    last_name = serializers.CharField(
        source='applicant_agreement_document.application.kyc_record.last_name',
        default=None
    )

    class Meta:
        model = AgreementDocumentWitness
        fields = ('first_name', 'last_name', 'completed')


class SigningUrlSerializer(serializers.Serializer):
    signing_url = serializers.URLField()


class AgreementKycRecordSerializer(serializers.ModelSerializer):
    citizenship_country = serializers.CharField(source='citizenship_country.name', default=None)

    class Meta:
        model = KYCRecord
        fields = '__all__'
