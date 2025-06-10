from django.db.models import Sum
from rest_framework import serializers
from rest_framework.exceptions import ValidationError

from api.capital_calls.models import (CapitalCall, CapitalCallDetail,
                                      FundCapitalCall, Distribution, Commitment)
from api.capital_calls.services.create_capital_call_from_file import \
    ProcessCapitalCallFile
from api.capital_calls.services.create_capital_call_notice import \
    CreateCapitalCallNotice
from api.capital_calls.services.create_capital_call_notification import \
    CreateCapitalCallNotificationService
from api.capital_calls.services.create_capital_call_task import \
    CreateCapitalCallTask
from api.currencies.services.fund_currency_info import FundCurrencyDetail
from api.documents.serializers import DocumentSerializer
from api.serializers import BaseCurrencyConversionSerializer
from api.users.serializers import RetailUserListSerializer
from api.workflows.models import Task


class BaseCapitalCallSerializer(BaseCurrencyConversionSerializer):
    class Meta:
        model = CapitalCall
        exclude = ('created_at', 'modified_at')


class BaseCommitmentSerializer(BaseCurrencyConversionSerializer):
    class Meta:
        model = Commitment
        exclude = ('created_at', 'modified_at')



class BaseDistributionSerializer(BaseCurrencyConversionSerializer):
    class Meta:
        model = Distribution
        exclude = ('created_at', 'modified_at')


class CapitalCallSerializer(serializers.ModelSerializer):
    invested_amount = serializers.SerializerMethodField()
    currency = serializers.SerializerMethodField()
    fund_name = serializers.CharField(source='fund.name')

    class Meta:
        model = CapitalCall
        exclude = ('created_at', 'modified_at')

    def create(self, validated_data):
        capital_call = super().create(validated_data)
        capital_call_notification_service = CreateCapitalCallNotificationService(capital_call=capital_call)
        capital_call_notification_service.create()
        return capital_call

    @staticmethod
    def get_invested_amount(obj: CapitalCall):
        return obj.fund_investor.commitment_amount

    @staticmethod
    def get_currency(obj: CapitalCall):
        fund_detail = FundCurrencyDetail(fund=obj.fund)
        return fund_detail.process()


class CapitalCallDocumentSerializer(serializers.Serializer):
    document_file = serializers.FileField(write_only=True)
    due_date = serializers.DateField(write_only=True, format="%m/%d/%Y", input_formats=['%m/%d/%Y'])

    def validate(self, attrs):
        fund = self.context['fund']
        capital_calls = FundCapitalCall.objects.filter(fund=fund, due_date=attrs['due_date'])
        if capital_calls:
            raise ValidationError('A capital call file with the same fund id & due date exists in the system!')
        return attrs

    def create(self, validated_data):
        fund = self.context['fund']
        admin_user = self.context['admin_user']
        document_file = validated_data.get('document_file', None)
        due_date = validated_data.get('due_date')
        capital_call, _ = ProcessCapitalCallFile(
            in_memory_file=document_file,
            due_date=due_date,
            fund=fund,
            admin_user=admin_user
        ).process()
        CreateCapitalCallTask(
            fund=fund,
            capital_call=capital_call,
            admin_user=admin_user
        ).create_workflow_task()
        CreateCapitalCallNotice(capital_call=capital_call).create_notices()
        return capital_call


class CapitalCallDetailCreateSerializer(serializers.ModelSerializer):

    class Meta:
        model = CapitalCallDetail
        exclude = ('created_at', 'modified_at')


class CapitalCallDetailSerializer(serializers.ModelSerializer):
    user = RetailUserListSerializer()
    currency = serializers.SerializerMethodField()
    notice = DocumentSerializer()

    class Meta:
        model = CapitalCallDetail
        exclude = ('created_at', 'modified_at')

    @staticmethod
    def get_currency(obj: CapitalCall):
        fund_detail = FundCurrencyDetail(fund=obj.capital_call.fund)
        return fund_detail.process()


class FundCapitalCallSerializer(serializers.ModelSerializer):
    total_capital_called = serializers.SerializerMethodField()
    total_amount_received = serializers.SerializerMethodField()
    currency = serializers.SerializerMethodField()
    can_approve = serializers.SerializerMethodField()
    are_documents_generated = serializers.SerializerMethodField()
    task_id = serializers.SerializerMethodField()
    document = DocumentSerializer()

    class Meta:
        model = FundCapitalCall
        exclude = ('created_at', 'modified_at')

    @staticmethod
    def get_total_capital_called(obj: FundCapitalCall):
        return CapitalCallDetail.objects.filter(capital_call=obj).aggregate(Sum('amount'))['amount__sum']

    @staticmethod
    def get_total_amount_received(obj: FundCapitalCall):
        return 0

    @staticmethod
    def get_currency(obj: FundCapitalCall):
        fund_detail = FundCurrencyDetail(fund=obj.fund)
        return fund_detail.process()

    def get_can_approve(self, obj: FundCapitalCall):
        admin = self.context.get('admin_user')
        try:
            task = Task.objects.get(workflow=obj.workflow)
            return task.assigned_to == admin
        except Task.DoesNotExist:
            return None

    @staticmethod
    def get_are_documents_generated(obj: FundCapitalCall):
        capital_call_details = CapitalCallDetail.objects.filter(capital_call=obj)
        return capital_call_details.count() == capital_call_details.filter(notice__isnull=False).count()

    @staticmethod
    def get_task_id(obj: FundCapitalCall):
        try:
            task = Task.objects.get(workflow=obj.workflow)
            return task.id
        except Task.DoesNotExist:
            return None
