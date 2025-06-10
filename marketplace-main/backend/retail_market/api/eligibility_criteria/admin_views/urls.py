from django.urls import re_path

from api.eligibility_criteria.admin_views import fund_criteria_views
from api.eligibility_criteria.admin_views.custom_smart_block_views import CustomSmartBlockListCreateAPIView, \
    CustomSmartBlockUpdateAPIView, CustomSmartBlockFieldListCreateAPIView, CustomSmartBlockFieldUpdateAPIView
from api.eligibility_criteria.admin_views.fund_blocks import BlockListAPIView
from api.eligibility_criteria.admin_views.fund_criteria_views import GetInvestmentAmountAPIView, \
    UpdateInvestmentAmountAPIView, AddCustomLogicCriteriaBlock

urlpatterns = [
    re_path(r'^blocks$', BlockListAPIView.as_view(), name='blocks-list'),
    re_path(r'^bulk-publish$', fund_criteria_views.BulkPublishAPIView.as_view(), name='bulk-publish-api'),
    re_path(
        r'^validate-update-custom-expression$',
        fund_criteria_views.UpdateAndValidateExpression.as_view(),
        name='validate-update-custom-expression-view'
    ),
    re_path(r'^$', fund_criteria_views.FundEligibilityCriteriaCreateAPIView.as_view(), name='create-criteria'),
    re_path(r'^(?P<pk>\d+)$', fund_criteria_views.CriteriaRetrieveAPIView.as_view(),
            name='criteria-retrieve-view'),
    re_path(r'^(?P<pk>\d+)/custom/decision$', fund_criteria_views.CalculateCustomExpressionLogicDecision.as_view(),
            name='criteria-custom-expression-view'),
    re_path(r'^(?P<pk>\d+)/decision$', fund_criteria_views.CalculateCustomLogicDecision.as_view(),
            name='criteria-retrieve-view'),
    re_path(r'^(?P<pk>\d+)/edit$', fund_criteria_views.CriteriaUpdateAPIView.as_view(), name='criteria-update-view'),
    re_path(r'^(?P<pk>\d+)/preview$', fund_criteria_views.CriteriaPreviewRetrieveAPIView.as_view(),
            name='criteria-preview-retrieve-view'),
    re_path(r'^(?P<pk>\d+)/documents$', fund_criteria_views.CriteriaDocumentCreateAPIView.as_view(),
            name='criteria-document-create-view'),
    re_path(r'^(?P<pk>\d+)/revisions-complete$', fund_criteria_views.CriteriaDocumentCreateAPIView.as_view(),
            name='criteria-document-create-view'),
    re_path(r'^connector/(?P<pk>\d+)$', fund_criteria_views.CriteriaBlockConnectorUpdateAPIView.as_view(),
            name='connector-update-view'),
    re_path(r'^criteria_block/(?P<pk>\d+)$', fund_criteria_views.CriteriaBlockUpdateAPIView.as_view(),
            name='criteria_block-update-view'),
    re_path(r'^criteria_block/(?P<pk>\d+)/position$', fund_criteria_views.UpdateCriteriaBlockPositionAPIView.as_view(),
            name='criteria_block-update-view'),
    re_path(r'^(?P<criteria_id>\d+)/documents/list$', fund_criteria_views.CriteriaDocumentListAPIView.as_view(),
            name='criteria-document-list-view'),
    re_path(r'^(?P<criteria_id>\d+)/block$', fund_criteria_views.CriteriaBlockCreateAPIView.as_view(),
            name='criteria-add-block'),
    re_path(
        r'^response/(?P<pk>\d+)/$',
        fund_criteria_views.EligibilityCardsAPIView.as_view(),
        name='kyc-criteria-response-admin'
    ),
    re_path(
        r'^response/(?P<fund_external_id>.+)/investment_amount$',
        GetInvestmentAmountAPIView.as_view(),
        name='get-fund-investment-amount'
    ),
    re_path(
        r'^investment/(?P<pk>\d+)/update$',
        UpdateInvestmentAmountAPIView.as_view(),
        name='admin-investment-amount-update'
    ),
    re_path(
        r'^custom_smart_blocks$',
        CustomSmartBlockListCreateAPIView.as_view(),
        name='admin-custom-smart-blocks'
    ),
    re_path(
        r'^custom_smart_blocks/(?P<pk>\d+)$',
        CustomSmartBlockUpdateAPIView.as_view(),
        name='admin-custom-smart-block-update'
    ),
    re_path(
        r'^custom_smart_blocks/(?P<block_id>\d+)/fields$',
        CustomSmartBlockFieldListCreateAPIView.as_view(),
        name='admin-custom-smart-block-fields'
    ),
    re_path(
        r'^custom_smart_blocks/(?P<block_id>\d+)/fields/(?P<pk>\d+)$',
        CustomSmartBlockFieldUpdateAPIView.as_view(),
        name='admin-custom-smart-block-fields-update'
    ),
    re_path(
        r'^(?P<pk>\d+)/custom_logic_block$',
        AddCustomLogicCriteriaBlock.as_view(),
        name='admin-custom-logic-block'
    ),
    re_path(r'^(?P<criteria_id>\d+)/smart_block/connector$',
            fund_criteria_views.SmartDecisionBlockConnectorCreateAPIView.as_view(),
            name='smart-decision-block-connector-create'
            ),
    re_path(r'^(?P<criteria_id>\d+)/smart_block/connector/delete$',
            fund_criteria_views.SmartDecisionCriteriaBlockConnectorDelete.as_view(),
            name='smart-decision-block-connector-delete'
            ),
    re_path(r'^custom-block-templates/$', fund_criteria_views.CustomSmartBlockTemplatesListCreateView.as_view(),
            name='list-criteria-custom-block-templates'),
    re_path(r'^custom-block-templates/(?P<pk>\d+)$', fund_criteria_views.CustomSmartBlockTemplatesUpdateView.as_view(),
            name='update-custom-block-templates'),
    re_path(r'^(?P<criteria_id>\d+)/create-from-template/(?P<template_id>\d+)$', fund_criteria_views.CreateSmartBlockFromTemplateView.as_view(),
            name='create-block-from-template'),
]

