from rest_framework.generics import (CreateAPIView, ListAPIView,
                                     get_object_or_404)

from api.distribution_notices.models import (DistributionNotice,
                                             DistributionNoticeDetail)
from api.distribution_notices.serializers import (
    DistributionNoticeDetailSerializer, DistributionNoticeDocumentSerializer,
    DistributionNoticeSerializer)
from api.funds.models import Fund
from api.mixins.admin_view_mixin import AdminViewMixin
from api.permissions.is_sidecar_admin_permission import IsSidecarAdminUser


class DistributionNoticeListView(AdminViewMixin, ListAPIView):
    serializer_class = DistributionNoticeSerializer

    def get_queryset(self):
        return DistributionNotice.objects.filter(
            company=self.company,
            fund__external_id=self.kwargs['fund_external_id']
        )

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['admin_user'] = self.admin_user
        return context


class DistributionNoticeDetailListView(AdminViewMixin, ListAPIView):
    serializer_class = DistributionNoticeDetailSerializer

    def get_queryset(self):
        return DistributionNoticeDetail.objects.filter(
            distribution_notice__company=self.company,
            distribution_notice__id=self.kwargs['pk']
        )


class DistributionNoticeCreateAPIView(AdminViewMixin, CreateAPIView):
    permission_classes = (IsSidecarAdminUser,)
    serializer_class = DistributionNoticeDocumentSerializer

    def get_queryset(self):
        return DistributionNotice.objects.filter(
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
