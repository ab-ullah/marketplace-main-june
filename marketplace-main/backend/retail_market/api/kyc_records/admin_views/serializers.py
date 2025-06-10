from rest_framework import serializers
from rest_framework.generics import get_object_or_404
from slugify import slugify

from api.cards.utils import get_fund_kyc_workflow_name
from api.constants.kyc_investor_types import KYCInvestorType
from api.documents.models import KYCDocument
from api.geographics.serializers import CountrySerializer
from api.kyc_records.models import KYCRecord
from api.kyc_records.serializers import KYCAdminDocumentSerializer
from api.payments.models import PaymentDetail
from api.payments.serializers import PaymentDetailSerializer, PaymentDetailReadSerializer
from api.users.models import RetailUser
from api.users.serializers import RetailUserSerializer
from api.cards.models import Workflow as KYCWorkflow

class KYCUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = KYCRecord
        fields = '__all__'


class BaseKYCSerializer(serializers.ModelSerializer):
    kyc_documents = serializers.SerializerMethodField()
    kyc_investor_type_name = serializers.SerializerMethodField()
    citizenship_country = CountrySerializer()
    home_country = CountrySerializer()
    eligibility_country = CountrySerializer()
    id_issuing_country = CountrySerializer()
    office_location = CountrySerializer()
    jurisdiction = CountrySerializer()
    investor_location = CountrySerializer()
    user = RetailUserSerializer()

    class Meta:
        model = KYCRecord
        fields = '__all__'

    @staticmethod
    def get_kyc_investor_type_name(obj: KYCRecord):
        return KYCInvestorType(obj.kyc_investor_type).name

    @staticmethod
    def get_kyc_documents(obj: KYCRecord):
        queryset = KYCDocument.include_deleted.filter(kyc_record=obj)
        return KYCAdminDocumentSerializer(queryset, many=True).data


class KYCRecordDetailSerializer(BaseKYCSerializer):
    kyc_participants = BaseKYCSerializer(many=True)
    payment_detail = PaymentDetailReadSerializer()


class KYCRecordCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = KYCRecord
        fields = '__all__'
        read_only_fields = ['company', 'workflow']

    def create(self, validated_data):
        company = self.context['company']
        validated_data['company'] = company
        kyc_investor_type = validated_data.get('kyc_investor_type', KYCInvestorType.INDIVIDUAL.value)
        company_workflow_name = get_fund_kyc_workflow_name(
            company=company,
            vehicle_type=KYCInvestorType(kyc_investor_type).name
        )
        company_workflow = KYCWorkflow.objects.get(
            company=company,
            slug=slugify(company_workflow_name),
            type=KYCWorkflow.FLOW_TYPES.KYC.value
        )
        validated_data['workflow'] = company_workflow
        return super().create(validated_data=validated_data)

    def validate(self, attrs):
        get_object_or_404(
            RetailUser,
            id=attrs['user'].id,
            associated_company_users__company=self.context['company']
        )
        return attrs
