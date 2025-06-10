from rest_framework import status
from rest_framework.generics import ListAPIView, get_object_or_404
from rest_framework.response import Response
from rest_framework.views import APIView

from api.carry_pools.serializers import ParticipantDetailSerializer
from api.compensation_records.models import CompensationRecord
from api.compensation_records.serializers import CompensationRecordDetailSerializer
from api.mixins.company_user_mixin import CompanyUserViewMixin
from api.mixins.vesting_date_mixin import VestingDateViewMixin
from api.page_configs.models import PageConfig
from api.page_configs.services.company_page_config import CompanyPageConfigRetrieval
from api.users.models import RetailUser


class TotalCompensationHistory(CompanyUserViewMixin, ListAPIView):
    serializer_class = CompensationRecordDetailSerializer

    def get_serializer_context(self):
        context = super().get_serializer_context()
        page_config = CompanyPageConfigRetrieval(
            company=self.companies[0],
            page_type=PageConfig.PageTypes.COMPENSATION_VIEW.value
        ).get_config()
        if not page_config:
            return context

        context['benefits_breakdown'] = page_config.get('benefits_breakdown', [])
        return context

    def get_queryset(self):
        user = get_object_or_404(RetailUser, pk=self.requested_user.id)
        return CompensationRecord.objects.filter(
            user_id=user.id,
            company=self.companies[0]
        ).select_related('cash', 'insurance_benefits', 'misc_benefits', 'taxes', 'currency').order_by('-year')
    
    
class LatestCompensation(CompanyUserViewMixin, APIView):
    def get_latest_compensation_data(self, user):
        latest_compensation = CompensationRecord.objects.filter(
            user=user,
            company=self.companies[0]
        ).order_by('-year').first()
        if not latest_compensation:
            return None

        page_config = CompanyPageConfigRetrieval(
            company=self.companies[0],
            page_type=PageConfig.PageTypes.COMPENSATION_VIEW.value
        ).get_config()
        benefits_breakdown = None
        if page_config:
            benefits_breakdown = page_config.get('benefits_breakdown', [])

        compensation_data = CompensationRecordDetailSerializer(
            latest_compensation,
            context={'benefits_breakdown': benefits_breakdown}
        ).data

        return compensation_data

    def get(self, request):
        user = get_object_or_404(RetailUser, id=self.requested_user.id)

        serializer_context = {
            'latest_compensation': self.get_latest_compensation_data(user=user)
        }
        result = ParticipantDetailSerializer(user, context=serializer_context).data
        return Response(result, status=status.HTTP_200_OK)


class CompensationCarryAllocationDetails(CompanyUserViewMixin, APIView):
    serializer_class = CompensationRecordDetailSerializer