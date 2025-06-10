from django.db.models import Prefetch
from rest_framework.generics import RetrieveAPIView
from rest_framework.response import Response

from api.eligibility_criteria.models import FundEligibilityCriteria, CriteriaBlock
from api.eligibility_criteria.serializers import FundEligibilityCriteriaDetailSerializer
from api.eligibility_criteria.services.eligibility_criteria_preview import CriteriaPreviewService
from api.mixins.company_user_mixin import CompanyUserViewMixin


class CriteriaPreviewRetrieveAPIView(CompanyUserViewMixin, RetrieveAPIView):
    serializer_class = FundEligibilityCriteriaDetailSerializer

    def get_queryset(self):
        return FundEligibilityCriteria.objects.filter(
            fund__company_id__in=self.company_ids
        ).prefetch_related(
            Prefetch(
                'criteria_blocks',
                queryset=CriteriaBlock.objects.filter(auto_completed=False)
            )
        ).prefetch_related(
            'criteria_blocks__block'
        ).prefetch_related(
            'criteria_blocks__criteria_block_documents'
        ).select_related(
            'fund'
        ).prefetch_related(
            'criteria_regions'
        ).prefetch_related(
            'criteria_regions__region'
        ).prefetch_related(
            'criteria_countries'
        ).prefetch_related(
            'criteria_countries__country'
        )

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        response_data = serializer.data
        preview_service = CriteriaPreviewService(data=response_data)
        return Response(preview_service.process())
