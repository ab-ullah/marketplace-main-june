from django.db.models import Max
from rest_framework.generics import ListAPIView
from rest_framework.response import Response
from rest_framework.views import APIView

from api.mixins.company_user_mixin import CompanyUserViewMixin
from api.notices.models import TransactionalConsideration, ValuationConsideration
from api.notices.serializers import TransactionalConsiderationsDetailSerializer, ValuationConsiderationsDetailSerializer
from api.notices.services.process_notices_details import NoticesService, ValuationNotice

from api.notices.utils import get_quarter


class TransactionConsiderationsListAPIView(CompanyUserViewMixin, ListAPIView):
    serializer_class = TransactionalConsiderationsDetailSerializer

    def get_queryset(self):
        # fetch dates in format yy-mm-dd
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')

        queryset = TransactionalConsideration.objects.filter(
            company_id__in=self.company_ids,
            investor_id__in=self.investor_ids
        )
        if start_date and end_date:
            queryset = queryset.filter(
                notice_date__range=[start_date, end_date]
            )

        return queryset.select_related(
            'fund__fund_currency',
            'company',
            'firm',
        )


class InvestorNoticeDetailAPIView(CompanyUserViewMixin, APIView):
    def get(self, request, *args, **kwargs):
        response_data = {
            **NoticesService(
                investor_ids=self.investor_ids,
                company_ids=self.company_ids,
                start_date=self.request.query_params.get('start_date'),
                end_date=self.request.query_params.get('end_date')
            ).compile()
        }
        return Response(response_data)


class TransactionConsiderationsByFirmListAPIView(CompanyUserViewMixin, ListAPIView):
    serializer_class = TransactionalConsiderationsDetailSerializer

    def get_queryset(self):
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')

        qs = TransactionalConsideration.objects.filter(
            company_id__in=self.company_ids,
            investor_id__in=self.investor_ids,
            firm_id=self.kwargs['firm_id']
        ).order_by('-notice_date')

        if start_date and end_date:
            qs = qs.filter(
                notice_date__range=[start_date, end_date]
            )
        return qs


class ValuationNoticeDetailAPIView(CompanyUserViewMixin, APIView):
    def get(self, request, *args, **kwargs):
        response_data = {
            **ValuationNotice(
                investor_ids=self.investor_ids,
                company_ids=self.company_ids,
                start_date=self.request.query_params.get('end_date'),
                end_date=self.request.query_params.get('end_date')
            ).compile()
        }
        return Response(response_data)


class ValuationConsiderationsByFirmListAPIView(CompanyUserViewMixin, ListAPIView):
    serializer_class = ValuationConsiderationsDetailSerializer

    def get_queryset(self):
        end_date = self.request.query_params.get('end_date')

        qs = ValuationConsideration.objects.filter(
            company_id__in=self.company_ids,
            investor_id__in=self.investor_ids,
            firm_id=self.kwargs['firm_id']
        )
        if end_date:
            qs = qs.filter(
                notice_date__lte=end_date
            )
        else:
            latest_notice_date = qs.aggregate(Max('notice_date'))['notice_date__max']
            qs = qs.filter(notice_date=latest_notice_date)
        return qs
