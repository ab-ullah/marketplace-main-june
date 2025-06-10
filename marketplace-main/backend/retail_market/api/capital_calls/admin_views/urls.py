from django.urls import path

from api.capital_calls.admin_views.capital_call_views import CapitalCallCreateAPIView, CapitalCallListView, \
    CapitalCallDetailListView

urlpatterns = [
    path(r'<fund_external_id>/document', CapitalCallCreateAPIView.as_view(), name='admin-capital-call-list-create'),
    path(r'<fund_external_id>', CapitalCallListView.as_view(), name='admin-capital-call-list'),
    path(r'<fund_external_id>/detail/<pk>', CapitalCallDetailListView.as_view(), name='admin-capital-call-detail-list'),
]