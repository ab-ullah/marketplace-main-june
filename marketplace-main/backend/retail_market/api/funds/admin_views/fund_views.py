from rest_framework.generics import RetrieveAPIView, ListCreateAPIView, get_object_or_404
from rest_framework.response import Response
from rest_framework.status import HTTP_201_CREATED
from rest_framework.views import APIView

from api.funds.admin_views import FundViewMixin
from api.funds.constants import FUND_INTEREST_QUESTIONS
from api.funds.models import Fund, FundTag
from api.funds.models import FundInterestQuestion
from api.funds.models import FundManager
from api.funds.serializers import FundBaseInfoSerializer, AdminFundDetailSerializer
from api.funds.serializers import FundInterestQuestionSerializer
from api.funds.serializers import FundManagerSerializer
from api.funds.services.fund_application_statuses import FundApplicationsStatusService
from api.funds.services.process_indication_of_interest_answers import ProcessIndicationOfInterestAnswer
from api.investors.serializers import FundTagSerializer
from api.mixins.admin_view_mixin import AdminViewMixin
from api.permissions.is_sidecar_admin_permission import IsSidecarAdminUser


class FundsBasicDetailRetrieveAPIView(FundViewMixin, AdminViewMixin, RetrieveAPIView):
    permission_classes = (IsSidecarAdminUser,)
    serializer_class = FundBaseInfoSerializer
    queryset = Fund.objects.all().select_related('external_onboarding', 'fund_currency', 'fund_profile')
    lookup_field = 'external_id'
    lookup_url_kwarg = 'fund_external_id'


class FundsRetrieveBySlugAPIView(FundViewMixin, AdminViewMixin, RetrieveAPIView):
    permission_classes = (IsSidecarAdminUser,)
    serializer_class = AdminFundDetailSerializer
    queryset = Fund.objects.all()
    lookup_field = 'external_id'
    lookup_url_kwarg = 'fund_external_id'

    def get_queryset(self):
        queryset = super(FundsRetrieveBySlugAPIView, self).get_queryset()
        queryset = queryset.prefetch_related('leverage_options').select_related(
            'fund_profile',
            'fund_currency',
            'external_onboarding',
        )
        return queryset


class FundsApplicationStatus(AdminViewMixin, APIView):
    permission_classes = (IsSidecarAdminUser,)

    def get(self, request, *args, **kwargs):
        fund = Fund.objects.get(
            external_id=self.kwargs['fund_external_id'],
            company=self.company
        )
        application_task_status = FundApplicationsStatusService(
            fund=fund
        ).process()
        return Response(application_task_status)


class FundInterestQuestionBulkCreateAPIView(AdminViewMixin, ListCreateAPIView):
    serializer_class = FundInterestQuestionSerializer

    def get_queryset(self):
        return FundInterestQuestion.objects.all()

    def create(self, request, *args, **kwargs):
        fund_external_id = request.data.get('fund_external_id')
        fund = get_object_or_404(
            Fund,
            external_id=fund_external_id,
        )
        fund_interest_questions = [
            {
                'fund': fund.id,
                'question': v['question'],
                'question_type': v['question_type'],
                'options': v.get('question_type', []),

            } for i, v in enumerate(FUND_INTEREST_QUESTIONS)
        ]
        serializer = self.get_serializer(data=fund_interest_questions, many=True)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response({'status': 'success'}, status=HTTP_201_CREATED)


class ExportIndicationOfInterestAnswers(AdminViewMixin, APIView):
    def get(self, request, fund_external_id):
        fund = get_object_or_404(
            Fund,
            external_id=fund_external_id,
            company=self.company
        )
        csv_data = ProcessIndicationOfInterestAnswer(fund=fund).process()

        return Response(csv_data)


class FundManagerListCreateView(AdminViewMixin, ListCreateAPIView):
    serializer_class = FundManagerSerializer

    def get_queryset(self):
        fund = get_object_or_404(
            Fund,
            external_id=self.kwargs['fund_external_id'],
            company=self.company
        )
        return FundManager.objects.filter(company=fund.company)


class FundTagListCreateAPIView(AdminViewMixin, ListCreateAPIView):
    serializer_class = FundTagSerializer

    def get_queryset(self):
        return FundTag.objects.filter(company=self.company)
