from rest_framework import serializers


class BaseCurrencyConversionSerializer(serializers.ModelSerializer):
    def to_representation(self, instance):
        data = super().to_representation(instance)
        currency_info = instance.get_currency_details()
        data.update(currency_info)
        return data