from rest_framework.response import Response
from rest_framework.views import APIView

from api.feature_flags.provider import FeatureFlagProvider
from api.mixins.admin_view_mixin import AdminViewMixin
from api.permissions.is_sidecar_admin_permission import IsSidecarAdminUser


class DummyView(AdminViewMixin, APIView):
    permission_classes = (IsSidecarAdminUser,)

    def get(self, request, format=None):
        feature_flag_provider = FeatureFlagProvider.from_params(company_id=self.company.id)
        a_happened = False
        b_happened = False
        if feature_flag_provider.is_active("A"):
            a_happened = True
        if feature_flag_provider.is_active("B"):
            b_happened = True
        return Response(data=dict(a_happened=a_happened, b_happened=b_happened), status=200)