from typing import List

from api.applications.models import Application
from api.investors.models import FundInvestor


class UserOpportunitiesService:
    def __init__(self, investor_ids: List[int]):
        self.investor_ids = investor_ids

    def get_invested_fund_ids(self):
        fund_ids = FundInvestor.objects.filter(investor_id__in=self.investor_ids).values_list('fund_id', flat=True)
        return list(fund_ids)

    def get_funds_qs(self, queryset, active_transfer_fund_ids=None):
        invested_fund_ids = self.get_invested_fund_ids()
        if active_transfer_fund_ids:
            invested_fund_ids = list(set(invested_fund_ids) - set(active_transfer_fund_ids))
        queryset = queryset.exclude(id__in=invested_fund_ids)
        return queryset.select_related('fund_currency').select_related('company')

    @staticmethod
    def get_funds_to_exclude_by_applications(queryset, applications_map):
        return [
            fund.id
            for fund in queryset
            if fund.is_invite_only and fund.id not in applications_map
        ]

    def get_applications_map_for_user(self, user):
        applications = Application.objects.filter(user=user).values_list('id', 'fund_id')
        applications_map = {}
        for application_id, fund_id in applications:
            if fund_id not in applications_map:
                applications_map[fund_id] = []

            applications_map[fund_id].append(application_id)

        return applications_map
