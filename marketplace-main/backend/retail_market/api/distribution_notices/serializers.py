from django.db.models import Sum
from rest_framework import serializers
from rest_framework.exceptions import ValidationError

from api.distribution_notices.services.create_distribution_notice_documents import \
    CreateDistributionNoticeDocuments
from api.currencies.services.fund_currency_info import FundCurrencyDetail
from api.distribution_notices.models import (DistributionNotice,
                                             DistributionNoticeDetail)
from api.distribution_notices.services.create_distribution_notice_task import \
    CreateDistributionNoticeTask
from api.distribution_notices.services.create_distribution_notices_from_file import \
    ProcessDistributionNoticeFile
from api.documents.serializers import DocumentSerializer
from api.users.serializers import RetailUserListSerializer
from api.workflows.models import Task


class DistributionNoticeDocumentSerializer(serializers.Serializer):
    document_file = serializers.FileField(write_only=True)
    distribution_date = serializers.DateField(write_only=True, format="%m/%d/%Y", input_formats=['%m/%d/%Y'])

    def validate(self, attrs):
        fund = self.context['fund']
        distribution_notices = DistributionNotice.objects.filter(
            fund=fund, distribution_date=attrs['distribution_date']
        )
        if distribution_notices:
            raise ValidationError(
                'A distribution notice with the same fund id & distribution date exists in the system!'
            )
        return attrs

    def create(self, validated_data):
        fund = self.context['fund']
        admin_user = self.context['admin_user']
        document_file = validated_data.get('document_file', None)
        distribution_date = validated_data.get('distribution_date')
        distribution_notice, _ = ProcessDistributionNoticeFile(
            in_memory_file=document_file,
            distribution_date=distribution_date,
            fund=fund,
            admin_user=admin_user
        ).process()
        CreateDistributionNoticeTask(
            fund=fund,
            distribution_notice=distribution_notice,
            admin_user=admin_user
        ).create_workflow_task()
        CreateDistributionNoticeDocuments(distribution_notice=distribution_notice).create_notices()
        return distribution_notice


class DistributionNoticeDetailCreateSerializer(serializers.ModelSerializer):

    class Meta:
        model = DistributionNoticeDetail
        exclude = ('created_at', 'modified_at')


class DistributionNoticeDetailSerializer(serializers.ModelSerializer):
    user = RetailUserListSerializer()
    currency = serializers.SerializerMethodField()
    document = DocumentSerializer()

    class Meta:
        model = DistributionNoticeDetail
        exclude = ('created_at', 'modified_at')

    @staticmethod
    def get_currency(obj: DistributionNotice):
        fund_detail = FundCurrencyDetail(fund=obj.distribution_notice.fund)
        return fund_detail.process()


class DistributionNoticeSerializer(serializers.ModelSerializer):
    total_distributed = serializers.SerializerMethodField()
    currency = serializers.SerializerMethodField()
    can_approve = serializers.SerializerMethodField()
    task_id = serializers.SerializerMethodField()
    are_documents_generated = serializers.SerializerMethodField()
    document = DocumentSerializer()

    class Meta:
        model = DistributionNotice
        exclude = ('created_at', 'modified_at')

    @staticmethod
    def get_total_distributed(obj: DistributionNotice):
        return DistributionNoticeDetail.objects.filter(distribution_notice=obj).aggregate(Sum('amount'))['amount__sum']

    @staticmethod
    def get_currency(obj: DistributionNotice):
        fund_detail = FundCurrencyDetail(fund=obj.fund)
        return fund_detail.process()

    def get_can_approve(self, obj: DistributionNotice):
        admin = self.context.get('admin_user')
        try:
            task = Task.objects.get(workflow=obj.workflow)
            return task.assigned_to == admin
        except Task.DoesNotExist:
            return None

    @staticmethod
    def get_are_documents_generated(obj: DistributionNotice):
        distribution_notice_details = DistributionNoticeDetail.objects.filter(distribution_notice=obj)
        return distribution_notice_details.count() == distribution_notice_details.filter(document__isnull=False).count()

    @staticmethod
    def get_task_id(obj: DistributionNotice):
        try:
            task = Task.objects.get(workflow=obj.workflow)
            return task.id
        except Task.DoesNotExist:
            return None
