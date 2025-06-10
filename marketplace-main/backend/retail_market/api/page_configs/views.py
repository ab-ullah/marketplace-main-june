from django.http import Http404
from rest_framework.generics import RetrieveAPIView
from rest_framework.response import Response

from api.constants.compensation.page_configs import PARTICIPANT_COMPENSATION_VIEW_CONFIG
from api.constants.page_config_defaults import INVESTOR_DASHBOARD_CONFIG, INVESTMENT_DETAIL_PAGE_CONFIG, \
    NOTICE_CONSIDERATIONS_CONFIG, NOTICE_CONSIDERATIONS_FIRM_DETAIL_CONFIG
from api.mixins.company_user_mixin import CompanyUserViewMixin
from api.page_configs.data.carry import CARRY_PAGE_CONFIG_DEFAULT
from api.page_configs.models import PageConfig, CustomTextConfig
from api.page_configs.serializers import PageConfigSerializer, CustomTextConfigSerializer

PAGE_CONFIG_MAPPING = {
    PageConfig.PageTypes.INVESTOR_DASHBOARD.value: INVESTOR_DASHBOARD_CONFIG,
    PageConfig.PageTypes.INVESTMENT_DETAIL_PAGE.value: INVESTMENT_DETAIL_PAGE_CONFIG,
    PageConfig.PageTypes.NOTICE_CONSIDERATIONS.value: NOTICE_CONSIDERATIONS_CONFIG,
    PageConfig.PageTypes.NOTICE_CONSIDERATIONS_FIRM_DETAIL.value: NOTICE_CONSIDERATIONS_FIRM_DETAIL_CONFIG,
    PageConfig.PageTypes.COMPENSATION_VIEW.value: PARTICIPANT_COMPENSATION_VIEW_CONFIG,
    PageConfig.PageTypes.CARRY_CONFIG.value: CARRY_PAGE_CONFIG_DEFAULT,
}


class PageConfigAPIView(CompanyUserViewMixin, RetrieveAPIView):
    serializer_class = PageConfigSerializer
    queryset = PageConfig.objects.all()

    def get_queryset(self):
        qs = super().get_queryset()
        page = self.kwargs.get('page')
        qs = qs.filter(page=page, enabled=True)
        fund_external_id = self.request.GET.get('fund_external_id')
        if fund_external_id and page == PageConfig.PageTypes.INVESTMENT_DETAIL_PAGE:
            if qs.filter(fund__external_id=fund_external_id).exists():
                qs = qs.filter(fund__external_id=fund_external_id)
        return qs

    def get_object(self):
        page_configs = self.get_queryset()
        if len(page_configs) > 1:
            return None

        return page_configs.first()

    def get(self, *args, **kwargs):
        page = self.kwargs.get('page')
        page_value = PAGE_CONFIG_MAPPING.get(page)
        if not page_value:
            raise Http404

        page_config = self.get_object()
        if page_config:
            page_value = PageConfigSerializer(page_config).data['page_value']

        return Response(page_value)


class OnboardingCustomText(CompanyUserViewMixin, RetrieveAPIView):
    serializer_class = CustomTextConfigSerializer

    def get_object(self):
        try:
            return CustomTextConfig.objects.filter(
                company_id__in=self.company_ids
            ).latest('modified_at')
        except CustomTextConfig.DoesNotExist:
            raise Http404
