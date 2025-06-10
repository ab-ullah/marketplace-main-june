from django.http import Http404
from rest_framework.generics import get_object_or_404, UpdateAPIView, ListCreateAPIView

from api.applications.utils import get_application_or_404
from api.funds.models import Fund
from api.mixins.company_user_mixin import CompanyUserViewMixin
from api.payments.models import PaymentDetail
from api.payments.serializers import PaymentDetailSerializer


class PaymentDetailListCreateAPIView(CompanyUserViewMixin, ListCreateAPIView):
    serializer_class = PaymentDetailSerializer

    def get_fund(self):
        return get_object_or_404(
            Fund,
            external_id=self.kwargs['fund_external_id'],
            company_id__in=self.company_ids
        )

    def get_serializer_context(self):
        context = super().get_serializer_context()
        fund = self.get_fund()
        context['fund_external_id'] = self.kwargs['fund_external_id']
        context['company'] = fund.company
        return context

    def get_queryset(self):
        fund = self.get_fund()
        application = get_application_or_404({
            'company': fund.company,
            'user_id': self.requested_user.id,
            'fund__external_id': fund.external_id
        })
        if not application.payment_detail:
            raise Http404
        return PaymentDetail.objects.filter(
            user=self.requested_user,
            id=application.payment_detail_id
        )


class PaymentDetailUpdateAPIView(CompanyUserViewMixin, UpdateAPIView):
    serializer_class = PaymentDetailSerializer

    def get_queryset(self):
        return PaymentDetail.objects.filter(user=self.requested_user)
