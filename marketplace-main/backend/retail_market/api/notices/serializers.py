from rest_framework import serializers

from api.currencies.serializers import CurrencySerializer
from api.firms.serializers import FirmSerializer
from api.investors.serializers import RetrieveFundSerializer
from api.notices.models import TransactionalConsideration, ValuationConsideration


class TransactionalConsiderationsCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = TransactionalConsideration
        fields = '__all__'

    def create(self, validated_data):
        transactional_consideration, _ = TransactionalConsideration.objects.update_or_create(
            fund=validated_data['fund'],
            firm=validated_data['firm'],
            company=validated_data['company'],
            investor=validated_data['investor'],
            notice_date=validated_data['notice_date'],
            defaults=validated_data
        )
        return transactional_consideration


class TransactionalConsiderationsDetailSerializer(serializers.ModelSerializer):
    fund_name = serializers.CharField(source='fund.name', read_only=True)
    firm_name = serializers.CharField(source='firm.name', read_only=True)
    currency_code = serializers.CharField(source='fund.fund_currency.code', read_only=True, default=None)
    firm = FirmSerializer()
    currency = CurrencySerializer(source='fund.fund_currency')
    fund = RetrieveFundSerializer()
    company_logo = serializers.SerializerMethodField()

    class Meta:
        model = TransactionalConsideration
        fields = '__all__'

    def create(self, validated_data):
        transactional_consideration, _ = TransactionalConsideration.objects.update_or_create(
            fund=validated_data['fund'],
            firm=validated_data['firm'],
            company=validated_data['company'],
            investor=validated_data['investor'],
            notice_date=validated_data['notice_date'],
            defaults=validated_data
        )
        return transactional_consideration

    @staticmethod
    def get_company_logo(obj):
        company = obj.company
        if company.logo:
            return company.logo.url
        return None


class ValuationConsiderationsCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ValuationConsideration
        fields = '__all__'

    def create(self, validated_data):
        valuation_consideration, _ = ValuationConsideration.objects.update_or_create(
            fund=validated_data['fund'],
            firm=validated_data['firm'],
            company=validated_data['company'],
            investor=validated_data['investor'],
            notice_date=validated_data['notice_date'],
            defaults=validated_data
        )
        return valuation_consideration


class ValuationConsiderationsDetailSerializer(serializers.ModelSerializer):
    fund_name = serializers.CharField(source='fund.name', read_only=True)
    firm_name = serializers.CharField(source='firm.name', read_only=True)
    currency_code = serializers.CharField(source='fund.fund_currency.code', read_only=True, default=None)
    firm = FirmSerializer()
    currency = CurrencySerializer(source='fund.fund_currency')
    fund = RetrieveFundSerializer()
    company_logo = serializers.SerializerMethodField()

    class Meta:
        model = ValuationConsideration
        fields = '__all__'

    @staticmethod
    def get_company_logo(obj):
        company = obj.company
        if company.logo:
            return company.logo.url
        return None
