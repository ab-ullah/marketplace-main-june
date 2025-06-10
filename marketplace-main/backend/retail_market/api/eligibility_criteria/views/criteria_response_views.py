from django.db.models import Q
from django.http import Http404
from rest_framework.generics import (CreateAPIView, RetrieveAPIView,
                                     UpdateAPIView, get_object_or_404)
from rest_framework.response import Response
from rest_framework.views import APIView

from api.applications.models import Application
from api.applications.selectors.application_started_fund_ids import get_transfer_application_fund_ids
from api.applications.serializers import ApplicationSerializer
from api.applications.utils import get_application_or_404
from api.eligibility_criteria.models import (CriteriaBlock,
                                             CriteriaBlockResponse,
                                             EligibilityCriteriaResponse,
                                             InvestmentAmount,
                                             ResponseBlockDocument)
from api.eligibility_criteria.serializers import (
    CriteriaBlockSerializer, CriteriaResponseBlockDocumentSerializer,
    CriteriaResponseBlockSerializer, CriteriaResponseSerializer,
    CriteriaResponseUpdateSerializer, EligibilityStatusSerializer,
    InvestmentAmountSerializer, UpdateInvestmentAmountSerializer,
    UserResponseFetchSerializer)
from api.eligibility_criteria.services.calculate_eligibility import \
    CalculateEligibilityService
from api.eligibility_criteria.services.eligibility_response_documents import \
    EligibilityResponseDocuments
from api.eligibility_criteria.services.get_eligibility_card import \
    GetEligibilityCriteriaCard
from api.eligibility_criteria.services.get_eligibility_criteria_user_response import \
    FundEligibilityCriteriaPreviewResponse
from api.eligibility_criteria.services.get_investment_amount_card import \
    GetInvestmentAmountCard
from api.eligibility_criteria.services.smart_decision_service import \
    SmartDecisionBlockService
from api.eligibility_criteria.utils.eligibility_criteria import \
    create_eligibility_criteria_response_task
from api.funds.models import Fund
from api.geographics.models import Country
from api.mixins.company_user_mixin import CompanyUserViewMixin
from api.workflows.models import Task, WorkFlow


class CriteriaBlockResponseAPIView(CompanyUserViewMixin,CreateAPIView):
    serializer_class = CriteriaResponseBlockSerializer


class CriteriaBlockResponseGetCreateAPIView(CompanyUserViewMixin, APIView):
    serializer_class = UserResponseFetchSerializer

    def post(self, request, fund_external_id, country_code, vehicle_type):
        active_transfer_funds = get_transfer_application_fund_ids(user=self.requested_user)
        fund_qs = Fund.objects.filter(Q(id__in=active_transfer_funds) | Q(is_finalized=False))
        fund = get_object_or_404(
            fund_qs,
            external_id=fund_external_id
        )
        country = get_object_or_404(
            Country,
            iso_code__iexact=country_code
        )

        applicant_info = request.data
        response_data = FundEligibilityCriteriaPreviewResponse(
            fund=fund,
            user=self.requested_user,
            country=country,
            vehicle_type=vehicle_type,
            applicant_info=applicant_info
        ).process()
        return Response(response_data)


class CriteriaResponseEligibilityStatusView(CompanyUserViewMixin, RetrieveAPIView):
    serializer_class = EligibilityStatusSerializer

    def get_object(self):
        criteria_response = get_object_or_404(
            EligibilityCriteriaResponse,
            pk=self.kwargs['pk']
        )
        if criteria_response.response_by.user_id != self.requested_user.id:
            raise Http404
        eligibility_service = CalculateEligibilityService(user_response=criteria_response)
        return {'is_eligible': eligibility_service.calculate()}


class CriteriaResponseUpdateAPIView(CompanyUserViewMixin, UpdateAPIView):
    serializer_class = CriteriaResponseUpdateSerializer
    queryset = EligibilityCriteriaResponse.objects.all()

    def get_queryset(self):
        return EligibilityCriteriaResponse.objects.filter(response_by__user_id=self.requested_user.id)


class ResponseBlockDocumentCreateAPIView(CompanyUserViewMixin, CreateAPIView):
    serializer_class = CriteriaResponseBlockDocumentSerializer
    queryset = ResponseBlockDocument.objects.all()


class ResponseDocumentsAPIView(CompanyUserViewMixin, APIView):
    queryset = ResponseBlockDocument.objects.all()

    def get(self, request, *args, **kwargs):
        criteria_response = get_object_or_404(
            EligibilityCriteriaResponse,
            pk=self.kwargs['pk']
        )
        if criteria_response.response_by.user_id != self.requested_user.id:
            raise Http404
        criteria_response_documents = EligibilityResponseDocuments(criteria_response=criteria_response)
        data = criteria_response_documents.get_required_documents()
        return Response(data)


class CreateInvestmentAmountAPIView(CompanyUserViewMixin, CreateAPIView, UpdateAPIView):
    serializer_class = InvestmentAmountSerializer
    queryset = InvestmentAmount.objects.all()

    def get_queryset(self):
        return InvestmentAmount.objects.all()

    def get_serializer_context(self):
        response_id = self.kwargs.get('response_id')
        criteria_response = get_object_or_404(
            EligibilityCriteriaResponse,
            pk=response_id,
            criteria__fund__company_id__in=self.company_ids
        )
        context = super().get_serializer_context()
        context['criteria_response'] = criteria_response
        return context


class SubmitEligibilityResponseAPIView(CompanyUserViewMixin, APIView):
    def get(self, request, response_id):
        criteria_response = get_object_or_404(
            EligibilityCriteriaResponse,
            pk=response_id,
            criteria__fund__company_id__in=self.company_ids
        )
        workflow = criteria_response.workflow  # type: WorkFlow
        workflow.workflow_tasks.filter(
            status=Task.StatusChoice.CHANGES_REQUESTED.value,
            task_type=Task.TaskTypeChoice.REVIEW_REQUEST.value,
        ).update(
            completed=False,
            status=Task.StatusChoice.PENDING.value
        )
        return Response({'status': 'success'})


class UpdateInvestmentAmountAPIView(CompanyUserViewMixin, UpdateAPIView):
    serializer_class = UpdateInvestmentAmountSerializer
    queryset = InvestmentAmount.objects.all()

    def get_queryset(self):
        return InvestmentAmount.objects.all()


class KYCEligibilityCardsAPIView(CompanyUserViewMixin, APIView):
    def get(self, request, application_id: int):
        application = get_object_or_404(
            Application,
            id=application_id,
            user=self.requested_user
        )

        criteria_response = application.eligibility_response
        if not criteria_response:
            return Response({'eligibility_card': None, 'investment_card': None, 'response_id': None})

        card_data = GetEligibilityCriteriaCard(eligibility_criteria_response=criteria_response).process()
        investment_card = GetInvestmentAmountCard(eligibility_criteria_response=criteria_response).process()
        fund = criteria_response.criteria.fund
        kyc_record = criteria_response.kyc_record

        return Response(
            {
                'eligibility_card': card_data,
                'investment_card': investment_card,
                'response_id': criteria_response.id,
                'max_leverage_ratio': kyc_record.max_leverage_ratio,
                'minimum_investment': fund.minimum_investment,
                'offer_leverage': fund.offer_leverage
            }
        )


class GetFundCriteriaResponse(CompanyUserViewMixin, APIView):
    def get(self, request, fund_external_id: str):
        application = get_application_or_404({
            'fund__external_id': fund_external_id,
            'user_id': self.requested_user.id,
            'company_id__in': self.company_ids,
        })

        if not application.eligibility_response:
            raise Http404

        parsed_response_data = CriteriaResponseSerializer(application.eligibility_response).data
        return Response({
            'criteria_preview': FundEligibilityCriteriaPreviewResponse.get_criteria_preview(
                eligibility_criteria=application.eligibility_response.criteria
            ),
            'user_response': parsed_response_data,
            'application': ApplicationSerializer(application).data
        })


class EligibilityCriteriaResponseTaskAPIView(CompanyUserViewMixin, APIView):

    def post(self, request, response_id):
        criteria_response = get_object_or_404(
            EligibilityCriteriaResponse,
            id=response_id,
        )
        if criteria_response.is_eligible:
            create_eligibility_criteria_response_task(user=self.requested_user, criteria_response=criteria_response)
        return Response({"status": "created"})


class SmartDecisionNavigationView(CompanyUserViewMixin, RetrieveAPIView):
    serializer_class = CriteriaBlockSerializer

    @staticmethod
    def update_last_position(response: EligibilityCriteriaResponse, block: CriteriaBlock):
        response.last_position = block.id
        response.save(update_fields=['last_position'])

    def get_object(self):
        fund_external_id = self.kwargs['fund_external_id']

        application = get_application_or_404({
            'user_id': self.requested_user.id,
            'fund__external_id': fund_external_id
        })

        try:
            criteria_block = CriteriaBlock.objects.get(pk=self.kwargs['pk'],criteria__fund__external_id=fund_external_id)
        except CriteriaBlock.DoesNotExist:
            if not application.eligibility_response:
                return None

            return application.eligibility_response.criteria.criteria_blocks.filter(
                is_country_selector=False
            ).order_by('position').first()

        criteria_response = application.eligibility_response
        is_current = self.kwargs['navigation_point'] == 'current'
        is_next = self.kwargs['navigation_point'] == 'next'

        if is_current:
            return criteria_block

        if is_next:
            try:
                response_block = criteria_block.user_responses.get(criteria_response=criteria_response)
                response_json = response_block.response_json
            except CriteriaBlockResponse.DoesNotExist:
                response_json = {}

            initial_data = {
                'block_id': criteria_block.id,
                'response_json': response_json,
                'eligibility_criteria_id': criteria_block.criteria.id
            }

            block = SmartDecisionBlockService(initial_data=initial_data).next_block()
        else:
            block = SmartDecisionBlockService.previous_block(
                criteria_block=criteria_block, criteria_response=criteria_response
            )

        if not block:
            if is_next:
                return criteria_block.criteria.criteria_blocks.get(is_final_step=True)
            else:
                return criteria_block.criteria.criteria_blocks.get(is_country_selector=True)

        self.update_last_position(
            response=criteria_response,
            block=block
        )
        return block
