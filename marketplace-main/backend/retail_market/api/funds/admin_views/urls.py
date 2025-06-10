from django.urls import re_path

from api.funds.admin_views.admin_dashboard_views import AdminDashboardAPIView
from api.funds.admin_views.fund_create_update_views import PublishFundAPIView, FundsUpdateDestroyAPIView, \
    FundsListCreateAPIView
from api.funds.admin_views.fund_document_views import FundDocumentCreateAPIView, FundDocumentListAPIView, \
    FundDocumentUpdateAPIView, FundDocumentResponseListView, ApplicationFundDocumentListAPIView, FundDocumentFieldsView
from api.funds.admin_views.fund_document_views import PublicFundDocumentListCreateView
from api.funds.admin_views.fund_share_class_views import FundShareClassListAPIView
from api.funds.admin_views.fund_views import FundsRetrieveBySlugAPIView, FundsBasicDetailRetrieveAPIView, \
    FundsApplicationStatus, FundInterestQuestionBulkCreateAPIView, ExportIndicationOfInterestAnswers, \
    FundManagerListCreateView, FundTagListCreateAPIView

urlpatterns = [
    re_path(r'^$', FundsListCreateAPIView.as_view(), name='funds-list-create'),
    re_path(r'^(?P<pk>\d+)/publish$', PublishFundAPIView.as_view(), name='publish-fund'),
    re_path(r'^(?P<pk>\d+)$', FundsUpdateDestroyAPIView.as_view(), name='funds-update'),
    re_path(
        r'^external_id/(?P<fund_external_id>.+)/base-info$',
        FundsBasicDetailRetrieveAPIView.as_view(),
        name='funds-base-info-by-slug'
    ),
    re_path(r'^external_id/(?P<fund_external_id>.+)$', FundsRetrieveBySlugAPIView.as_view(),
            name='admin-funds-details-by-slug'),
    re_path(r'^(?P<fund_external_id>.+)/documents$', FundDocumentListAPIView.as_view(),
            name='admin-funds-documents-by-slug'),
    re_path(
        r'^documents/application/(?P<application_id>.+)$',
        ApplicationFundDocumentListAPIView.as_view(),
        name='admin-funds-documents-for-application'
    ),
    re_path(
        r'^(?P<fund_external_id>.+)/share-classes$',
        FundShareClassListAPIView.as_view(),
        name='admin-funds-share-classes-list'
    ),
    re_path(r'^(?P<fund_external_id>.+)/documents/create$', FundDocumentCreateAPIView.as_view(),
            name='admin-funds-documents-create'),
    re_path(
        r'^(?P<fund_external_id>.+)/documents/(?P<pk>\d+)$',
        FundDocumentUpdateAPIView.as_view(),
        name='admin-funds-documents-update'
    ),
    re_path(r'^admin$', AdminDashboardAPIView.as_view(), name='admin-stat-view'),
    re_path(
        r'^applications/(?P<application_id>\d+)/documents/response$',
        FundDocumentResponseListView.as_view(),
        name='admin-funds-documents-response-list'
    ),
    re_path(r'^(?P<fund_external_id>.+)/applicants/status$', FundsApplicationStatus.as_view(),
            name='admin-fund-applicants-status'),
    re_path(r'^(?P<fund_external_id>.+)/document-fields/$', FundDocumentFieldsView.as_view(),
            name='admin-funds-documents-fields'),
    re_path(r'interest/question$', FundInterestQuestionBulkCreateAPIView.as_view(),
            name='fund-interest-questions-create'),
    re_path(r'interest/(?P<fund_external_id>.+)/export$', ExportIndicationOfInterestAnswers.as_view(),
            name='export-indication-of-interest'),
    re_path(
        r'^(?P<fund_external_id>.+)/public/document$',
        PublicFundDocumentListCreateView.as_view(),
        name='admin-funds-public-document-list-create'),
    re_path(
        r'^(?P<fund_external_id>.+)/managers$',
        FundManagerListCreateView.as_view(),
        name='admin-fund-manager-list-create'),
    re_path(r'^tags$', FundTagListCreateAPIView.as_view(), name='fund-tag-list-create'),
]
