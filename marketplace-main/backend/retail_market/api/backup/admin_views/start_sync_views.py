import http

from django.shortcuts import get_object_or_404
from django_q.tasks import async_task
from rest_framework.response import Response
from rest_framework.views import APIView

from api.backup.services.backup_fund_to_dynamo_service import BackupFundToDynamoService
from api.constants.feature_flags import CAN_PUSH_RECORDS_TO_BOOKS
from api.feature_flags.provider import FeatureFlagProvider
from api.funds.models import Fund
from api.mixins.admin_view_mixin import AdminViewMixin


class StartPushToRecord(APIView, AdminViewMixin):

    def post(self, request):
        fund_id = request.data["fund_id"]
        fund = get_object_or_404(Fund, pk=fund_id)
        feature_flag_provider = FeatureFlagProvider.from_params(company_id=self.company.id)
        is_active = feature_flag_provider.is_active(CAN_PUSH_RECORDS_TO_BOOKS)
        if not is_active:
            return Response({"message": f"Feature disabled for company: {self.company.name}"},
                            status=http.HTTPStatus.PRECONDITION_FAILED)
        async_task(
            BackupFundToDynamoService.sync_applications_and_documents,
            report_email=self.request.user.email,
            fund_id=fund.id
        )
        return Response({"message": f"Sync started for fund: {fund.name}"}, status=http.HTTPStatus.OK)
