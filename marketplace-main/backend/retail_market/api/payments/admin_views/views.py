from rest_framework.generics import UpdateAPIView

from api.mixins.admin_view_mixin import AdminViewMixin
from api.payments.models import PaymentDetail
from api.payments.serializers import PaymentDetailSerializer


class PaymentDetailUpdateAPIView(AdminViewMixin, UpdateAPIView):
    serializer_class = PaymentDetailSerializer

    def get_queryset(self):
        return PaymentDetail.objects.all()
