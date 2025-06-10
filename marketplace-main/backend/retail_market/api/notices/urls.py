from django.urls import path

from api.notices.views.notice_views import TransactionConsiderationsListAPIView, InvestorNoticeDetailAPIView, \
    TransactionConsiderationsByFirmListAPIView, ValuationNoticeDetailAPIView, ValuationConsiderationsByFirmListAPIView

urlpatterns = [
    path(
        'transactional-considerations',
        TransactionConsiderationsListAPIView.as_view(),
        name="transactional-considerations-list"
    ),
    path(
        'details',
        InvestorNoticeDetailAPIView.as_view(),
        name="transactional-details"
    ),
    path(
        'transactional-considerations/<firm_id>',
        TransactionConsiderationsByFirmListAPIView.as_view(),
        name="transactional-considerations-by-firm-list"
    ),
    path(
        'valuation-details',
        ValuationNoticeDetailAPIView.as_view(),
        name="valuation-details"
    ),
    path(
        'valuation-considerations/<firm_id>',
        ValuationConsiderationsByFirmListAPIView.as_view(),
        name="valuation-considerations-by-firm-list"
    ),
]
