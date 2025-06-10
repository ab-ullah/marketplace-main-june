from django.urls import path

from .views import PaymentDetailUpdateAPIView

urlpatterns = [
    path('<pk>', PaymentDetailUpdateAPIView.as_view(), name='payment-detail-update'),
]
