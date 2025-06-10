from rest_framework.generics import ListAPIView

from api.applications.selectors.application_started_fund_ids import (
    get_application_completed_fund_ids, get_application_started_fund_ids)
from api.funds.models import Fund
from api.investors.serializers import ActiveApplicationsFundSerializer
from api.investors.services.investor_application_started_status import InvestorApplicationsStatusService
from api.mixins.company_user_mixin import CompanyUserViewMixin


class ActiveApplicationsAPIView(CompanyUserViewMixin, ListAPIView):
    serializer_class = ActiveApplicationsFundSerializer

    def get_serializer_context(self):
        context = super().get_serializer_context()
        status_mapping, url_mapping, _, _ = InvestorApplicationsStatusService(user=self.requested_user).process()
        context['fund_status'] = status_mapping
        context['continue_url'] = url_mapping
        context['requested_user'] = self.requested_user
        return context

    def get_queryset(self):
        fund_ids = get_application_started_fund_ids(user=self.requested_user)
        funds_ids_with_completion = get_application_completed_fund_ids(user=self.requested_user)
        return Fund.objects.filter(
            company_id__in=self.company_ids,
            id__in=fund_ids
        ).exclude(id__in=funds_ids_with_completion)
