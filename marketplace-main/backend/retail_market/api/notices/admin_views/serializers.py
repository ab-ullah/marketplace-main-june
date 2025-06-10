from rest_framework import serializers
from rest_framework.generics import get_object_or_404

from api.compensation_records.services.process_compensation_file import ProcessCompensationFile
from api.employment_records.services.importer.org_hierarchy_import import ProcessOrgHierarchyFile
from api.investors.models import Investor
from api.notices.services.constants import NOTICE_TYPE_TRANSACTIONAL, NOTICE_TYPE_VALUATION, NOTICE_TYPE_COMPENSATION, \
    NOTICE_TYPE_ORGANIZATION
from api.notices.services.process_considerations_csv import ProcessConsiderationsFile, ProcessValuationFile


class NoticeDocumentSerializer(serializers.Serializer):
    document_file = serializers.FileField(write_only=True)
    investor = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    notice_type = serializers.CharField(max_length=20, write_only=True)
    success = serializers.BooleanField(read_only=True)

    def create(self, validated_data):
        admin_user = self.context['admin_user']
        document_file = validated_data.get('document_file', None)
        investor = None
        if validated_data.get('investor'):
            investor = get_object_or_404(
                Investor,
                id=validated_data['investor']
            )
        notice_type = validated_data.get('notice_type')

        if notice_type == NOTICE_TYPE_TRANSACTIONAL:
            _, errors = ProcessConsiderationsFile(
                investor=investor,
                admin_user=admin_user,
                in_memory_file=document_file
            ).process()

        if notice_type == NOTICE_TYPE_VALUATION:
            _, errors = ProcessValuationFile(
                investor=investor,
                admin_user=admin_user,
                in_memory_file=document_file
            ).process()

        if notice_type == NOTICE_TYPE_COMPENSATION:
            _, errors = ProcessCompensationFile(
                admin_user=admin_user,
                in_memory_file=document_file
            ).process()

        if notice_type == NOTICE_TYPE_ORGANIZATION:
            _, errors = ProcessOrgHierarchyFile(
                admin_user=admin_user,
                in_memory_file=document_file
            ).process()
            if errors:
                raise serializers.ValidationError(errors)

        return {'success': True}
