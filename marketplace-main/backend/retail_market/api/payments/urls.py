from django.urls import re_path

from api.payments.views import PaymentDetailListCreateAPIView, PaymentDetailUpdateAPIView

urlpatterns = [
    re_path(r'detail/(?P<pk>\d+)/update', PaymentDetailUpdateAPIView.as_view(), name='payment-detail-update-api-view'),
    re_path(r'detail/(?P<fund_external_id>.+)', PaymentDetailListCreateAPIView.as_view(),
            name='payment-detail-list-create-api-view'),
]