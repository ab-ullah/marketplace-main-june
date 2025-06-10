from rest_framework.response import Response
from rest_framework.views import APIView

from api.funds.services.admin_stats import AdminStatsService
from api.mixins.admin_view_mixin import AdminViewMixin
from api.permissions.is_sidecar_admin_permission import IsSidecarAdminUser


class AdminDashboardAPIView(AdminViewMixin, APIView):
    permission_classes = (IsSidecarAdminUser,)

    def get(self, request, *args, **kwargs):
        admin_stats_service = AdminStatsService(company=self.company)
        admin_stats = admin_stats_service.get_fund_stats()
        return Response(admin_stats)
