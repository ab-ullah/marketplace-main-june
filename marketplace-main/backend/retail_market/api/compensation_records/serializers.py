from rest_framework import serializers

from api.compensation_records.models import CompensationRecord, Cash, InsuranceBenefit, MiscellaneousBenefit, \
    CompensationTax
from api.currencies.serializers import CurrencySerializer
from api.libs.utils.dictionary import get_from_dictionary_using_dot


class CompensationRecordCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = CompensationRecord
        fields = '__all__'

    def create(self, validated_data):
        compensation_record, _ = CompensationRecord.objects.update_or_create(
            company=validated_data['company'],
            user=validated_data['user'],
            year=validated_data['year'],
            defaults=validated_data
        )
        return compensation_record


class CompensationTaxSerializer(serializers.ModelSerializer):
    class Meta:
        model = CompensationTax
        fields = '__all__'


class MiscellaneousBenefitSerializer(serializers.ModelSerializer):
    class Meta:
        model = MiscellaneousBenefit
        fields = '__all__'


class InsuranceBenefitSerializer(serializers.ModelSerializer):
    class Meta:
        model = InsuranceBenefit
        fields = '__all__'


class CashSerializer(serializers.ModelSerializer):
    total_bonus = serializers.SerializerMethodField()

    class Meta:
        model = Cash
        fields = '__all__'

    @staticmethod
    def get_total_bonus(instance: Cash):
        return instance.bonus + instance.extra_bonus


class CompensationRecordDetailSerializer(serializers.ModelSerializer):
    currency = CurrencySerializer()
    cash = CashSerializer()
    insurance_benefits = InsuranceBenefitSerializer()
    misc_benefits = MiscellaneousBenefitSerializer()
    taxes = CompensationTaxSerializer()

    class Meta:
        model = CompensationRecord
        fields = '__all__'

    def total_benefits(self, details):
        benefit_sum = 0
        benefits_breakdown = self.context.get('benefits_breakdown', [])
        for benefit in benefits_breakdown:
            value = get_from_dictionary_using_dot(data=details, key_with_dots=benefit['field_name'])
            if value:
                benefit_sum += value

        return benefit_sum

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation['total_benefits'] = self.total_benefits(
            details=representation
        )
        return representation
