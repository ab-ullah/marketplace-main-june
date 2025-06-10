from django.db.models import Q
from rest_framework.generics import get_object_or_404
from rest_framework import mixins, viewsets

from api.funds.models import Fund
from api.mixins.admin_view_mixin import AdminViewMixin
from api.cards.serializers import WorkflowSerializer
from api.cards.models import Workflow


class FundWorkflowsListView(AdminViewMixin, mixins.ListModelMixin,
                            viewsets.GenericViewSet):
    serializer_class = WorkflowSerializer

    def get_queryset(self):
        fund_external_id = self.kwargs.get('fund_external_id')
        return Workflow.objects.filter(
            Q(fund__external_id=fund_external_id) | Q(fund__isnull=True)
        ).filter(company_id__in=self.company_ids)

    def get_serializer_context(self):
        fund_external_id = self.kwargs.get('fund_external_id')
        context = super().get_serializer_context()
        fund = get_object_or_404(
            Fund,
            external_id=fund_external_id,
            company_id__in=self.company_ids
        )
        context['fund'] = fund
        return context
