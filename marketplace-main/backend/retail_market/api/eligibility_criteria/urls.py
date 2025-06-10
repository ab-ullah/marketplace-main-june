from django.urls import re_path

from api.eligibility_criteria.views.criteria_response_views import (
    CriteriaBlockResponseAPIView, CriteriaBlockResponseGetCreateAPIView, ResponseBlockDocumentCreateAPIView,
    ResponseDocumentsAPIView, CriteriaResponseUpdateAPIView, CriteriaResponseEligibilityStatusView,
    CreateInvestmentAmountAPIView, UpdateInvestmentAmountAPIView, GetFundCriteriaResponse, KYCEligibilityCardsAPIView,
    SubmitEligibilityResponseAPIView, EligibilityCriteriaResponseTaskAPIView, SmartDecisionNavigationView
)
from api.eligibility_criteria.views.fund_criteria_views import CriteriaPreviewRetrieveAPIView

urlpatterns = [
    re_path(r'^(?P<pk>\d+)/preview$', CriteriaPreviewRetrieveAPIView.as_view(), name='criteria-preview-retrieve-view'),
    re_path(r'^response/criteria_block/$', CriteriaBlockResponseAPIView.as_view(), name='create-update-block-response'),
    re_path(
        r'^response/criteria_block/document$',
        ResponseBlockDocumentCreateAPIView.as_view(),
        name='create-block-response-document'
    ),
    re_path(r'^response/(?P<pk>\d+)/documents$', ResponseDocumentsAPIView.as_view(), name='fetch-block-documents'),
    re_path(r'^response/(?P<pk>\d+)/update$', CriteriaResponseUpdateAPIView.as_view(), name='criteria-response-update'),
    re_path(
        r'^response/(?P<pk>\d+)/status$',
        CriteriaResponseEligibilityStatusView.as_view(),
        name='criteria-response-status'
    ),
    re_path(
        r'^response/(?P<fund_external_id>.+)/(?P<country_code>\w{2})/(?P<vehicle_type>\w+)$',
        CriteriaBlockResponseGetCreateAPIView.as_view(),
        name='fetch-block-response'
    ),
    re_path(
        r'^response/(?P<fund_external_id>.+)/fetch$',
        GetFundCriteriaResponse.as_view(),
        name='get-eligibility-response'
    ),
    re_path(
        r'^response/(?P<response_id>\d+)/investment_amount$',
        CreateInvestmentAmountAPIView.as_view(),
        name='create-investment-amount'
    ),
    re_path(
        r'^response/(?P<response_id>\d+)/submit-for-review$',
        SubmitEligibilityResponseAPIView.as_view(),
        name='submit-for-review'
    ),
    re_path(
        r'^response/kyc/(?P<application_id>\d+)/$',
        KYCEligibilityCardsAPIView.as_view(),
        name='kyc-criteria-response'
    ),
    re_path(
        r'^investment/(?P<pk>\d+)/update$',
        UpdateInvestmentAmountAPIView.as_view(),
        name='investment-amount-update'
    ),
    re_path(
        r'^response/(?P<response_id>\d+)/create-task$',
        EligibilityCriteriaResponseTaskAPIView.as_view(),
        name='eligibility-criteria-response-task'
    ),
    re_path(
        r'^(?P<fund_external_id>.+)/criteria_block/(?P<pk>\d+)/(?P<navigation_point>next|previous|current)/block$',
        SmartDecisionNavigationView.as_view(),
        name='smart-decision-flow-navigation-view'
    ),
]
