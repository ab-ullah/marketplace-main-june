from django.db.models import Q
from rest_framework import mixins, viewsets
from rest_framework.generics import get_object_or_404

from api.cards.models import Card, Workflow
from api.cards.serializers import CardSerializer, WorkflowSerializer
from api.funds.models import Fund
from api.mixins.admin_view_mixin import AdminViewMixin
from api.mixins.company_user_mixin import CompanyUserViewMixin
from api.permissions.is_sidecar_admin_permission import IsSidecarAdminUser


class CreateCardView(AdminViewMixin, mixins.CreateModelMixin, viewsets.GenericViewSet):
    permission_classes = (IsSidecarAdminUser,)
    queryset = Card.objects.all()
    serializer_class = CardSerializer


class FundWorkflowsListView(CompanyUserViewMixin, mixins.ListModelMixin,
                            viewsets.GenericViewSet):
    serializer_class = WorkflowSerializer

    def get_queryset(self):
        fund_external_id = self.kwargs.get('fund_external_id')
        fund = get_object_or_404(
            Fund,
            external_id=fund_external_id,
            company_id__in=self.company_ids
        )
        return Workflow.objects.filter(
            Q(fund__external_id=fund_external_id) | Q(fund__isnull=True)
        ).filter(company_id=fund.company_id)

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


class FundWorkflowsCreateView(AdminViewMixin, mixins.CreateModelMixin,
                              viewsets.GenericViewSet):
    serializer_class = WorkflowSerializer
