from django.urls import re_path

from api.fund_marketing_pages.views.fund_marketing_views import FundMarketingListCreateAPIView, \
    FundMarketingRetrieveUpdateDeleteAPIView, FundFactCreateAPIView, FundFactRetrieveUpdateDeleteAPIView, \
    RequestAllocationCriteriaCreateAPIView, RequestAllocationCriteriaRetrieveUpdateDeleteAPIView, \
    FooterBlockCreateAPIView, FooterBlockRetrieveUpdateDeleteAPIView, RequestAllocationDocumentCreateAPIView, \
    PromoFileCreateAPIView, PromoFileDeleteAPIView, \
    FundMarketingDocumentCreateAPIView, \
    IconOptionsListAPIView, ContactRetrieveUpdateDeleteAPIView, FundMarketingPageReviewersAPIView, \
    FundMarketingPageReviewerDeleteAPIView

urlpatterns = [
    re_path(r'^$', FundMarketingListCreateAPIView.as_view(), name='fund-marketing-list-create'),
    re_path(r'^(?P<pk>\d+)$', FundMarketingRetrieveUpdateDeleteAPIView.as_view(),
            name='fund-marketing-retrieve-update'),
    re_path(r'^(?P<fund_marketing_page_id>\d+)/fund-facts$', FundFactCreateAPIView.as_view(),
            name='fund-fact-create-view'),
    re_path(r'^(?P<fund_marketing_page_id>\d+)/promo-files$', PromoFileCreateAPIView.as_view(),
            name='promo-files-create-view'),
    re_path(r'^(?P<fund_marketing_page_id>\d+)/promo-files/(?P<pk>\d+)$', PromoFileDeleteAPIView.as_view(),
            name='promo-files-create-view'),
    re_path(r'^(?P<fund_marketing_page_id>\d+)/fund-facts/(?P<pk>\d+)$', FundFactRetrieveUpdateDeleteAPIView.as_view(),
            name='fund-fact-retrieve-update-view'),
    re_path(r'^(?P<fund_marketing_page_id>\d+)/request-allocation$', RequestAllocationCriteriaCreateAPIView.as_view(),
            name='request-allocation-create-view'),
    re_path(r'^(?P<fund_marketing_page_id>\d+)/request-allocation/(?P<pk>\d+)$',
            RequestAllocationCriteriaRetrieveUpdateDeleteAPIView.as_view(),
            name='request-allocation-retrieve-update-view'),
    re_path(r'^(?P<fund_marketing_page_id>\d+)/contact/(?P<pk>\d+)$',
            ContactRetrieveUpdateDeleteAPIView.as_view(),
            name='request-allocation-retrieve-update-view'),
    re_path(r'^(?P<fund_marketing_page_id>\d+)/request-allocation/(?P<request_allocation_id>\d+)/documents$',
            RequestAllocationDocumentCreateAPIView.as_view(),
            name='request-allocation-document-create-view'),
    re_path(r'^(?P<fund_marketing_page_id>\d+)/footer-blocks$', FooterBlockCreateAPIView.as_view(),
            name='footer-blocks-create-view'),
    re_path(r'^(?P<fund_marketing_page_id>\d+)/footer-blocks/(?P<pk>\d+)$',
            FooterBlockRetrieveUpdateDeleteAPIView.as_view(),
            name='footer-blocks-retrieve-update-view'),
    re_path(r'^(?P<fund_marketing_page_id>\d+)/documents$', FundMarketingDocumentCreateAPIView.as_view(),
            name='document-create-view'),
    re_path(r'^(?P<fund_marketing_page_id>\d+)/reviewers$',
            FundMarketingPageReviewersAPIView.as_view(),
            name='fund-page-reviewers-view'),
    re_path(r'^(?P<fund_marketing_page_id>\d+)/reviewers/(?P<pk>\d+)$',
            FundMarketingPageReviewerDeleteAPIView.as_view(),
            name='fund-page-reviewers-delete-view'),
    re_path(r'^icons$',
            IconOptionsListAPIView.as_view(),
            name='icons-list-view'),
]
