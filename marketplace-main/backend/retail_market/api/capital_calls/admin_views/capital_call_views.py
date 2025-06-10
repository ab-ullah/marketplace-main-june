from django.db.models import Prefetch
from rest_framework.generics import (CreateAPIView, ListAPIView,
                                     get_object_or_404)

from api.capital_calls.models import CapitalCallDetail, FundCapitalCall
from api.capital_calls.serializers import (CapitalCallDetailSerializer,
                                           CapitalCallDocumentSerializer,
                                           FundCapitalCallSerializer)
from api.funds.models import Fund
from api.mixins.admin_view_mixin import AdminViewMixin
from api.permissions.is_sidecar_admin_permission import IsSidecarAdminUser


class CapitalCallListView(AdminViewMixin, ListAPIView):
    serializer_class = FundCapitalCallSerializer

    def get_queryset(self):
        return FundCapitalCall.objects.filter(
            company=self.company,
            fund__external_id=self.kwargs['fund_external_id']
        )

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['admin_user'] = self.admin_user
        return context


class CapitalCallDetailListView(AdminViewMixin, ListAPIView):
    serializer_class = CapitalCallDetailSerializer

    def get_queryset(self):
        return CapitalCallDetail.objects.filter(
            capital_call__company=self.company,
            capital_call__id=self.kwargs['pk']
        )


class CapitalCallCreateAPIView(AdminViewMixin, CreateAPIView):
    permission_classes = (IsSidecarAdminUser,)
    serializer_class = CapitalCallDocumentSerializer

    def get_queryset(self):
        capital_call_details = CapitalCallDetail.objects.select_related('user')

        return FundCapitalCall.objects.prefetch_related(
            Prefetch('capital_call_details', queryset=capital_call_details)
        ).filter(
            company=self.company,
            fund__external_id=self.kwargs['fund_external_id']
        )

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['fund'] = get_object_or_404(
            Fund,
            external_id=self.kwargs['fund_external_id'],
            company=self.company
        )
        context['admin_user'] = self.admin_user
        return context
