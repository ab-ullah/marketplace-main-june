from django.db.models import Q
from rest_framework.generics import ListAPIView

from api.applications.selectors.application_started_fund_ids import (
    get_application_started_fund_ids,
    get_withdrawn_declined_application_fund_ids, get_transfer_application_fund_ids, get_application_completed_fund_ids)
from api.funds.models import Fund, PublishedFund
from api.investors.serializers import NonInvestedOpportunitySerializer
from api.investors.services.user_opportunities import UserOpportunitiesService
from api.mixins.company_user_mixin import CompanyUserViewMixin


class NonInvestedCompanyOpportunitiesListAPIView(CompanyUserViewMixin, ListAPIView):
    serializer_class = NonInvestedOpportunitySerializer

    def get_queryset(self):
        fund_model = Fund if self.show_unpublished_funds else PublishedFund
        queryset = fund_model.objects.filter(company_id__in=self.company_ids)
        queryset = queryset.filter(company__slug=self.kwargs['company_slug'])
        investor_ids = self.investor_ids

        opportunities_service = UserOpportunitiesService(investor_ids=investor_ids)
        queryset = opportunities_service.get_funds_qs(queryset=queryset)

        applications_map = opportunities_service.get_applications_map_for_user(user=self.request.user)
        if funds_to_exclude := opportunities_service.get_funds_to_exclude_by_applications(queryset, applications_map):
            queryset = queryset.exclude(id__in=funds_to_exclude)

        return queryset.order_by('-created_at')


class NonInvestedOpportunitiesListAPIView(CompanyUserViewMixin, ListAPIView):
    serializer_class = NonInvestedOpportunitySerializer

    def get_queryset(self):
        fund_model = Fund if self.show_unpublished_funds else PublishedFund
        in_progress_funds = get_application_started_fund_ids(user=self.requested_user)
        active_transfer_funds = get_transfer_application_fund_ids(user=self.requested_user)
        withdrawn_declined_fund_ids = get_withdrawn_declined_application_fund_ids(user=self.requested_user)
        exclude_conditions = Q(id__in=in_progress_funds) | Q(id__in=withdrawn_declined_fund_ids)
        queryset = fund_model.objects.filter(
            company_id__in=self.company_ids
        ).filter(
            Q(id__in=active_transfer_funds) | Q(is_finalized=False)
        ).filter(
            Q(id__in=active_transfer_funds) | Q(close_applications=False)
        ).exclude(exclude_conditions)
        investor_ids = self.investor_ids
        opportunities_service = UserOpportunitiesService(investor_ids=investor_ids)
        queryset = opportunities_service.get_funds_qs(
            queryset=queryset,
            active_transfer_fund_ids=active_transfer_funds
        )
        applications_map = opportunities_service.get_applications_map_for_user(user=self.requested_user)
        if funds_to_exclude := opportunities_service.get_funds_to_exclude_by_applications(queryset, applications_map):
            queryset = queryset.exclude(id__in=funds_to_exclude)

        queryset = queryset.select_related('external_onboarding', 'document_filter', 'company', 'fund_currency')
        return queryset.order_by('-accept_applications', 'name')


class PastOpportunitiesListAPIView(CompanyUserViewMixin, ListAPIView):
    serializer_class = NonInvestedOpportunitySerializer

    def get_queryset(self):
        fund_model = Fund if self.show_unpublished_funds else PublishedFund
        fund_ids_to_fetch = get_withdrawn_declined_application_fund_ids(user=self.requested_user)
        fund_ids_to_fetch.extend(get_application_completed_fund_ids(user=self.requested_user))
        fund_ids_to_fetch = list(set(fund_ids_to_fetch))
        queryset = fund_model.objects.filter(
            company_id__in=self.company_ids,
            id__in=fund_ids_to_fetch
        )

        queryset = queryset.select_related('external_onboarding', 'document_filter', 'company', 'fund_currency')
        return queryset.order_by('-accept_applications', 'name')