from rest_framework import serializers

from api.interest_statements.services.data_classes import SegmentInfo


class SegmentSerializer(serializers.Serializer):
    loan_balance = serializers.FloatField()
    brought_forward_interest = serializers.FloatField()
    from_date = serializers.DateField(format='%m/%d/%Y')
    days = serializers.IntegerField()
    to_date = serializers.DateField(format='%m/%d/%Y')
    interest = serializers.FloatField()
    loan_accrued_interest = serializers.SerializerMethodField()
    investment_currency_symbol = serializers.SerializerMethodField()

    @staticmethod
    def get_loan_accrued_interest(obj: SegmentInfo):
        return round(float(obj.loan_balance) + float(obj.brought_forward_interest), 2)

    @staticmethod
    def get_investment_currency_symbol(obj):
        return '$'


class QuarterSerializer(serializers.Serializer):
    year = serializers.IntegerField()
    quarter = serializers.CharField()
    total_interest = serializers.FloatField()
    segments = SegmentSerializer(many=True)
