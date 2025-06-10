from rest_framework import serializers

from api.currencies.models import Currency, CurrencyRate
from api.funds.utils.convert_curreny_to_number import convert_currency_to_number
from api.libs.utils.format_currency import format_currency


class CurrencySerializer(serializers.ModelSerializer):
    class Meta:
        model = Currency
        exclude = ('created_at',)


class CurrencyRateSerializer(serializers.ModelSerializer):
    class Meta:
        model = CurrencyRate
        exclude = ('created_at', 'modified_at')


class CurrencyField(serializers.Field):
    def to_representation(self, value):
        if value == 0:
            return f"$0"
        return f"${format_currency(value)}"

    def to_internal_value(self, data):
        try:
            normalized = convert_currency_to_number(str(data))
            return normalized
        except Exception as e:
            raise serializers.ValidationError("Invalid currency format.") 