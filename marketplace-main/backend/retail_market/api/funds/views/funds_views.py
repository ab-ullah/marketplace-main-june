from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.generics import ListCreateAPIView, RetrieveAPIView, get_object_or_404, CreateAPIView

from api.companies.models import CompanyUser
from api.companies.serializers import CompanyInfoSerializer
from api.funds.models import Fund, FundInterest, FundIndicationOfInterest
from api.funds.serializers import FundDetailSerializer, FundProfileDetailSerializer, \
    FundInterestSerializer, FundBaseInfoSerializer, FundInterestUserAnswerSerializer
from api.mixins.company_user_mixin import CompanyUserViewMixin

from api.applications.models import Application


class FundsBasicDetailRetrieveAPIView(CompanyUserViewMixin, RetrieveAPIView):
    serializer_class = FundBaseInfoSerializer
    queryset = Fund.objects.all()
    lookup_field = 'slug'
    lookup_url_kwarg = 'slug'


class FundsRetrieveByExternalIdAPIView(CompanyUserViewMixin, RetrieveAPIView):
    serializer_class = FundDetailSerializer
    queryset = Fund.objects.all()
    lookup_field = 'external_id'
    lookup_url_kwarg = 'fund_external_id'

    def get_queryset(self):
        queryset = super().get_queryset()
        queryset = queryset.prefetch_related('fund_orders'). \
            prefetch_related('fund_orders__investor'). \
            prefetch_related('fund_orders__investor'). \
            prefetch_related('fund_investors'). \
            prefetch_related('fund_investors__investor'). \
            prefetch_related('fund_share_classes')
        return queryset


class FundsSlugCompanyInfoAPIView(CompanyUserViewMixin, RetrieveAPIView):
    serializer_class = CompanyInfoSerializer
    queryset = Fund.objects.all()

    def get_object(self):
        fund = get_object_or_404(
            Fund,
            external_id=self.kwargs['fund_external_id'],
            company_id__in=self.company_ids
        )
        return fund.company


class FundProfileBySlugAPIView(CompanyUserViewMixin, RetrieveAPIView):
    serializer_class = FundProfileDetailSerializer
    queryset = Fund.objects.all()
    lookup_field = 'external_id'
    lookup_url_kwarg = 'fund_external_id'

    def get_queryset(self):
        queryset = super().get_queryset()
        if not self.show_unpublished_funds:
            queryset = queryset.filter(is_published=True)
        return queryset


class FundInterestCreateAPIView(CompanyUserViewMixin, ListCreateAPIView):
    serializer_class = FundInterestSerializer

    def get_queryset(self):
        return FundInterest.objects.filter(user__user=self.requested_user)


class FundIndicateInterestAPIView(CompanyUserViewMixin, APIView):

    def get_company_user(self, fund: Fund):
        company_user = get_object_or_404(
            CompanyUser,
            user=self.requested_user,
            company=fund.company
        )
        return company_user

    def post(self, request, fund_external_id):
        fund = get_object_or_404(
            Fund,
            external_id=fund_external_id
        )
        FundIndicationOfInterest.objects.create(
            fund=fund,
            user=self.get_company_user(fund),
            response_json=request.data
        )

        return Response({'status': 'success'})


class FundInterestUserAnswerCreateAPIView(CompanyUserViewMixin, CreateAPIView):
    serializer_class = FundInterestUserAnswerSerializer


class FundPermissionsCheckView(CompanyUserViewMixin, APIView):

    def get_company_user(self, fund: Fund):
        company_user = get_object_or_404(
            CompanyUser,
            user=self.requested_user,
            company=fund.company
        )
        return company_user

    def get(self, request, fund_external_id):
        fund = get_object_or_404(
            Fund,
            external_id=fund_external_id
        )
        is_user_have_access = False
        if fund.is_invite_only:
            is_user_have_access = Application.objects.filter(fund=fund, user=self.requested_user).exists()
        else:
            is_user_have_access = CompanyUser.objects.filter(user=self.requested_user, company=fund.company).exists()

        return Response({'status': is_user_have_access})
