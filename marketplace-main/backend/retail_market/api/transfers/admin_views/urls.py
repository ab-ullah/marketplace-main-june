from django.urls import path

from api.transfers.admin_views.transfer_views import (
    TransferListView, TransferRetrieveUpdateView)

urlpatterns = [
    path(r'', TransferListView.as_view(), name='admin-transfer-list'),
    path(r'<pk>', TransferRetrieveUpdateView.as_view(), name='admin-transfer-retrieve-update'),
]
