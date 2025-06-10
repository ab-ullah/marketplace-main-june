from django.urls import re_path

from api.funds.admin_views.admin_dashboard_views import AdminDashboardAPIView
from api.funds.views.document_views import FundDocumentListAPIView, FundDocumentResponseCreateView, \
    FundDataProtectionPolicyDocumentListAPIView, FundDataProtectionPolicyView, PublicFundDocumentListView
from api.funds.views.funds_views import FundsRetrieveByExternalIdAPIView, FundProfileBySlugAPIView, \
    FundInterestCreateAPIView, FundsBasicDetailRetrieveAPIView, FundsSlugCompanyInfoAPIView, \
    FundInterestUserAnswerCreateAPIView, FundIndicateInterestAPIView, FundPermissionsCheckView

urlpatterns = [
    re_path(
        r'^external_id/(?P<fund_external_id>.+)/public/documents$',
        PublicFundDocumentListView.as_view(),
        name='public-fund-document-list'
    ),
    re_path(
        r'^external_id/(?P<fund_external_id>.+)/data-protection-policy-document$',
        FundDataProtectionPolicyDocumentListAPIView.as_view(),
        name='fund-data-protection-policy-document'
    ),
    re_path(
        r'^external_id/(?P<fund_external_id>.+)/data-protection-policy-document-response$',
        FundDataProtectionPolicyView.as_view(),
        name='fund-data-protection-policy-document-response'
    ),
    re_path(
        r'^external_id/(?P<fund_external_id>.+)/investors$',
        FundsRetrieveByExternalIdAPIView.as_view(),
        name='funds-details-by-slug'
    ),
    re_path(
        r'^external_id/(?P<fund_external_id>.+)/company_info$',
        FundsSlugCompanyInfoAPIView.as_view(),
        name='funds-company-info-by-slug'
    ),
    re_path(
        r'^external_id/(?P<fund_external_id>.+)/profile$',
        FundProfileBySlugAPIView.as_view(),
        name='funds-profile-by-slug'
    ),
    re_path(
        r'^external_id/(?P<fund_external_id>.+)/indicate-interest$',
        FundIndicateInterestAPIView.as_view(),
        name='funds-indicate-interest'
    ),
    re_path(
        r'^external_id/(?P<fund_external_id>.+)/documents$',
        FundDocumentListAPIView.as_view(),
        name='funds-documents-list'
    ),
    re_path(
        r'^external_id/(?P<fund_external_id>.+)/documents/response$',
        FundDocumentResponseCreateView.as_view(),
        name='funds-documents-response-create'
    ),
    re_path(
        r'^external_id/(?P<fund_external_id>.+)/base-info$',
        FundsBasicDetailRetrieveAPIView.as_view(),
        name='funds-base-info-by-slug'
    ),
    re_path(
        r'^external_id/(?P<fund_external_id>.+)/permissions-check$',
        FundPermissionsCheckView.as_view(),
        name='funds-permissions-check-by-slug'
    ),
    re_path(
        r'^external_id/(?P<fund_external_id>.+)$',
        FundsRetrieveByExternalIdAPIView.as_view(),
        name='funds-details-by-slug'
    ),
    re_path(r'^admin$', AdminDashboardAPIView.as_view(), name='admin-stat-view'),
    re_path(r'^interest$', FundInterestCreateAPIView.as_view(), name='fund-interest-create'),
    re_path(
        r'^interest/question/response$',
        FundInterestUserAnswerCreateAPIView.as_view(),
        name='funds-interest-question-response-create'
    ),
]
