from django.urls import path

from api.distribution_notices.admin_views.views import (
    DistributionNoticeCreateAPIView, DistributionNoticeDetailListView,
    DistributionNoticeListView)

urlpatterns = [
    path(
        '<fund_external_id>/document',
        DistributionNoticeCreateAPIView.as_view(),
        name='admin-distribution-notice-list-create'
    ),
    path('<fund_external_id>', DistributionNoticeListView.as_view(), name='admin-distribution-notice-list'),
    path(
        '<fund_external_id>/detail/<pk>',
        DistributionNoticeDetailListView.as_view(),
        name='admin-distribution-notice-detail-list'
    ),
]