import logging
import json

from django.db.models import Prefetch, Q
from django.db.transaction import atomic
from rest_framework import status
from rest_framework.generics import CreateAPIView, ListCreateAPIView, RetrieveAPIView, ListAPIView, UpdateAPIView, \
    RetrieveUpdateDestroyAPIView, get_object_or_404
from rest_framework.response import Response
from rest_framework.views import APIView

from api.applications.constants import NON_APPROVAL_STATUSES
from api.applications.models import Application
from api.documents.models import CriteriaBlockDocument
from api.eligibility_criteria.models import FundEligibilityCriteria, CriteriaBlock, \
    CriteriaBlockConnector, EligibilityCriteriaResponse, InvestmentAmount, CustomSmartBlockTemplate
from api.eligibility_criteria.serializers import FundEligibilityCriteriaSerializer, CriteriaBlockSerializer, \
    FundEligibilityCriteriaDetailSerializer, CriteriaBlockCreateSerializer, FundEligibilityCriteriaDocumentSerializer, \
    CriteriaBlockDocumentSerializer, CriteriaBlockConnectorSerializer, CriteriaBlockPositionUpdateSerializer, \
    BulkPublishSerializer, CriteriaInvestmentAmountSerializer, UpdateInvestmentAmountSerializer, \
    SmartDecisionBlockConnectorSerializer, CustomSmartBlockSerializer, CustomSmartBlockTemplateSerializer, \
    CustomSmartBlockTemplateCreateSerializer
from api.eligibility_criteria.services.admin.add_custom_logic_block import CustomLogicBlockService
from api.eligibility_criteria.services.admin.criteria_block_position import UpdateCriteriaBlockPosition
from api.eligibility_criteria.services.admin.criteria_block_update_mixin import CriteriaBlockPositionUpdateMixin
from api.eligibility_criteria.services.admin.get_eligibility_card import GetEligibilityCriteriaCard
from api.eligibility_criteria.services.admin.get_investment_amount_card import GetInvestmentAmountCard, \
    GetInvestmentAmountCardRiverSide
from api.eligibility_criteria.services.eligibility_criteria_preview import CriteriaPreviewService
from api.eligibility_criteria.services.eval_eligibility_expression import EligibilityParser, LOGICAL_OPERATORS
from api.eligibility_criteria.services.admin.create_smart_block_from_template import \
    CreateCustomBlockFromTemplateService
from api.funds.models import Fund
from api.mixins.admin_view_mixin import AdminViewMixin
from api.permissions.fund_related_object_permission import IsSameCompanyUserAsFund
from api.permissions.is_sidecar_admin_permission import IsSidecarAdminUser
from api.workflows.models import WorkFlow, Task

logger = logging.getLogger(__name__)


class FundEligibilityCriteriaCreateAPIView(AdminViewMixin, ListCreateAPIView):
    serializer_class = FundEligibilityCriteriaSerializer
    permission_classes = (IsSidecarAdminUser,)

    def get_queryset(self):
        fund_id = self.request.GET.get('fund_id')
        queryset = FundEligibilityCriteria.objects.filter(fund__company=self.company)
        if fund_id:
            queryset = queryset.filter(fund_id=int(fund_id))
        return queryset.prefetch_related(
            'created_by'
        ).prefetch_related(
            'created_by__user'
        ).prefetch_related(
            'criteria_regions'
        ).prefetch_related(
            'criteria_regions__region'
        ).prefetch_related(
            'criteria_countries'
        ).prefetch_related(
            'criteria_countries__country'
        )


class CriteriaBlockCreateAPIView(AdminViewMixin, CreateAPIView):
    serializer_class = CriteriaBlockCreateSerializer
    permission_classes = (IsSidecarAdminUser,)
    queryset = CriteriaBlock.objects.all()


class AddCustomLogicCriteriaBlock(AdminViewMixin, APIView):
    def get(self, request, pk):
        criteria = get_object_or_404(
            FundEligibilityCriteria,
            fund__company=self.company,
            id=pk
        )
        custom_logic_block_service = CustomLogicBlockService(criteria=criteria)
        custom_logic_block_service.process()
        return Response({'status': 'success'})


class CriteriaRetrieveAPIView(AdminViewMixin, RetrieveUpdateDestroyAPIView):
    serializer_class = FundEligibilityCriteriaDetailSerializer
    permission_classes = (IsSidecarAdminUser, IsSameCompanyUserAsFund)

    def get_queryset(self):
        return FundEligibilityCriteria.objects.filter(
            fund__company_id=self.company.id
        ).prefetch_related(
            Prefetch(
                'criteria_blocks',
                queryset=CriteriaBlock.objects.filter(is_user_documents_step=False)
            )
        ).prefetch_related(
            'criteria_blocks__block'
        ).prefetch_related(
            'criteria_blocks__criteria_block_documents'
        ).select_related(
            'fund'
        ).prefetch_related(
            'criteria_regions'
        ).prefetch_related(
            'criteria_regions__region'
        ).prefetch_related(
            'criteria_countries'
        ).prefetch_related(
            'criteria_countries__country'
        )

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        response_data = serializer.data
        preview_service = CriteriaPreviewService(data=response_data)
        return Response(preview_service.process(add_intro=False))


class CriteriaUpdateAPIView(AdminViewMixin, UpdateAPIView):
    serializer_class = FundEligibilityCriteriaSerializer
    permission_classes = (IsSidecarAdminUser, IsSameCompanyUserAsFund)

    def get_queryset(self):
        return FundEligibilityCriteria.objects.filter(
            fund__company_id=self.company.id
        ).prefetch_related(
            'created_by'
        ).prefetch_related(
            'created_by__user'
        ).prefetch_related(
            'criteria_regions'
        ).prefetch_related(
            'criteria_regions__region'
        ).prefetch_related(
            'criteria_countries'
        ).prefetch_related(
            'criteria_countries__country'
        )


class CriteriaPreviewRetrieveAPIView(AdminViewMixin, RetrieveAPIView):
    serializer_class = FundEligibilityCriteriaDetailSerializer
    permission_classes = (IsSidecarAdminUser, IsSameCompanyUserAsFund,)

    def get_queryset(self):
        return FundEligibilityCriteria.objects.filter(
            fund__company_id=self.company.id
        ).prefetch_related(
            Prefetch(
                'criteria_blocks',
                queryset=CriteriaBlock.objects.filter(auto_completed=False)
            )
        ).prefetch_related(
            'criteria_blocks__block'
        ).prefetch_related(
            'criteria_blocks__criteria_block_documents'
        ).select_related(
            'fund'
        ).prefetch_related(
            'criteria_regions'
        ).prefetch_related(
            'criteria_regions__region'
        ).prefetch_related(
            'criteria_countries'
        ).prefetch_related(
            'criteria_countries__country'
        )

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        response_data = serializer.data
        preview_service = CriteriaPreviewService(data=response_data)
        return Response(preview_service.process())


class CriteriaDocumentCreateAPIView(AdminViewMixin, CreateAPIView):
    serializer_class = FundEligibilityCriteriaDocumentSerializer
    permission_classes = (IsSidecarAdminUser,)

    def get_queryset(self):
        return FundEligibilityCriteria.objects.filter(
            fund__company_id=self.company.id
        )


class CriteriaDocumentListAPIView(AdminViewMixin, ListAPIView):
    serializer_class = CriteriaBlockDocumentSerializer
    permission_classes = (IsSidecarAdminUser,)

    def get_queryset(self):
        return CriteriaBlockDocument.objects.filter(
            criteria_block_id=int(self.kwargs['criteria_id']),
            document__company_id=self.company.id
        )


class CriteriaBlockConnectorUpdateAPIView(AdminViewMixin, UpdateAPIView):
    serializer_class = CriteriaBlockConnectorSerializer
    queryset = CriteriaBlockConnector.objects.all()
    permission_classes = (IsSidecarAdminUser,)

    def get_queryset(self):
        return CriteriaBlockConnector.objects.filter(from_block__criteria__fund__company_id=self.company.id)


class CriteriaBlockUpdateAPIView(AdminViewMixin, RetrieveUpdateDestroyAPIView, CriteriaBlockPositionUpdateMixin):
    serializer_class = CriteriaBlockSerializer
    queryset = CriteriaBlock.objects.all()
    permission_classes = (IsSidecarAdminUser,)

    def get_queryset(self):
        return CriteriaBlock.objects.filter(criteria__fund__company_id=self.company.id)

    def perform_destroy(self, instance: CriteriaBlock):
        next_block = self.get_next_block(criteria_block=instance)
        previous_block = self.get_previous_block(criteria_block=instance)
        with atomic():
            self.decrement_later_blocks_position(criteria_block=instance)
            self.delete_block_connectors(criteria_block=previous_block)

            if not instance.criteria.is_smart_criteria:
                # Only connect blocks on delete when not using the smart decision flow
                # this way the UI and backend will stay in sync.
                self.connect_blocks(from_block=previous_block, to_block=next_block)
            if instance.is_custom_logic_block:
                CriteriaBlockConnector.objects.filter(
                    Q(from_block__criteria_id=instance.criteria_id) | Q(
                        to_block__criteria_id=instance.criteria_id
                    )
                ).filter(
                    condition__iexact='custom'
                ).update(condition='AND')

            CustomLogicBlockService(criteria=instance.criteria).handle_block_delete(
                criteria_block=instance
            )
            if instance.custom_block:
                instance.custom_block.delete()
            instance.delete()


class UpdateCriteriaBlockPositionAPIView(AdminViewMixin, UpdateAPIView):
    serializer_class = CriteriaBlockPositionUpdateSerializer
    permission_classes = (IsSidecarAdminUser,)

    def get_queryset(self):
        return CriteriaBlock.objects.filter(
            criteria__fund__company=self.company
        )

    def patch(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data)
        serializer.is_valid(raise_exception=True)
        new_position = serializer.validated_data['new_position']
        UpdateCriteriaBlockPosition(criteria_block=instance, new_position=new_position).process()
        return Response({'status': 'success'})


class EligibilityCardsAPIView(APIView, AdminViewMixin):
    permission_classes = (IsSidecarAdminUser,)

    def get_task(self, workflow: WorkFlow):
        try:
            return workflow.workflow_tasks.filter(
                assigned_to=self.admin_user,
                status=Task.StatusChoice.PENDING,
                task_type=Task.TaskTypeChoice.REVIEW_REQUEST
            ).latest('created_at')
        except Task.DoesNotExist:
            return None

    def get(self, request, pk: int):
        try:
            criteria_response = EligibilityCriteriaResponse.objects.filter(
                pk=pk,
                criteria__fund__company=self.company
            ).latest('created_at')
        except EligibilityCriteriaResponse.DoesNotExist:
            return Response({'eligibility_card': None})

        card_data = GetEligibilityCriteriaCard(eligibility_criteria_response=criteria_response).process()
        riverside_flow = self.company.show_new_commitment_flow
        if riverside_flow:
            investment_card = GetInvestmentAmountCardRiverSide(
                eligibility_criteria_response=criteria_response
            ).process()
        else:
            investment_card = GetInvestmentAmountCard(
                eligibility_criteria_response=criteria_response
            ).process()

        workflow_id = criteria_response.workflow.parent_id if criteria_response.workflow else None
        task = self.get_task(workflow=criteria_response.workflow)
        return Response(
            {
                'eligibility_card': card_data,
                'investment_card': investment_card,
                'workflow_id': workflow_id,
                'task_id': task.id if task else None,
            })


class BulkPublishAPIView(AdminViewMixin, APIView):
    permission_classes = (IsSidecarAdminUser,)
    serializer_class = BulkPublishSerializer

    def post(self, request):
        data = request.data
        serializer = self.serializer_class(data=data)
        serializer.is_valid(raise_exception=True)
        FundEligibilityCriteria.objects.filter(
            fund__company=self.company,
            id__in=request.data['criteria_ids'],
            status=FundEligibilityCriteria.CriteriaStatusChoice.APPROVED.value
        ).update(status=FundEligibilityCriteria.CriteriaStatusChoice.PUBLISHED.value)
        return Response({'status': 'success'})


class GetInvestmentAmountAPIView(AdminViewMixin, APIView):
    serializer_class = CriteriaInvestmentAmountSerializer
    permission_classes = (IsSidecarAdminUser,)

    def get(self, request, fund_external_id):

        fund = get_object_or_404(
            Fund,
            external_id=fund_external_id
        )

        context = {
            'fund': fund,
            'amount': 0,
            'leverage': 0,
            'total_investment': 0,
        }

        applications = Application.active_applications.filter(
            fund=fund,
        ).exclude(
            status__in=NON_APPROVAL_STATUSES
        ).select_related(
            'investment_amount',
            'eligibility_response__investment_amount'
        )

        for application in applications:
            eligibility_response = application.eligibility_response
            application_investment_amount = application.investment_amount
            investment_amount = None
            if eligibility_response:
                investment_amount = eligibility_response.investment_amount
            elif application_investment_amount:
                investment_amount = application_investment_amount
            if investment_amount:
                amount = investment_amount.get_final_amount()
                context['amount'] += amount
                context['leverage'] += investment_amount.get_total_leverage()
                context['total_investment'] += investment_amount.get_total_investment()

        serializer = self.serializer_class(data={}, context=context)
        serializer.is_valid()
        return Response(serializer.data)


class UpdateInvestmentAmountAPIView(AdminViewMixin, UpdateAPIView):
    serializer_class = UpdateInvestmentAmountSerializer
    permission_classes = (IsSidecarAdminUser,)

    def get_queryset(self):
        return InvestmentAmount.objects.all()


class CalculateCustomLogicDecision(AdminViewMixin, APIView):
    serializer_class = FundEligibilityCriteriaDetailSerializer
    permission_classes = (IsSidecarAdminUser, IsSameCompanyUserAsFund)

    def post(self, request, pk, *args, **kwargs):
        criteria = FundEligibilityCriteria.objects.get(
            fund__company_id=self.company.id,
            id=pk
        )
        decision = EligibilityParser(values=request.data).evaluate(criteria.expression_override)
        return Response({'is_eligible': decision})


class CalculateCustomExpressionLogicDecision(AdminViewMixin, APIView):
    serializer_class = FundEligibilityCriteriaDetailSerializer
    permission_classes = (IsSidecarAdminUser, IsSameCompanyUserAsFund)

    def post(self, request, pk, *args, **kwargs):
        criteria = FundEligibilityCriteria.objects.get(
            fund__company_id=self.company.id,
            id=pk
        )
        custom_expression = criteria.parse_custom_expression()
        if not custom_expression:
            return Response({'is_eligible': False})
        decision = EligibilityParser(values=request.data, skip_unvisited=criteria.is_smart_criteria).evaluate(
            custom_expression)
        return Response({'is_eligible': decision, 'skip_unvistied': criteria.is_smart_criteria})


class UpdateAndValidateExpression(AdminViewMixin, APIView):
    @staticmethod
    def validate_expression(expression, answers, should_return):
        answer = EligibilityParser(answers).evaluate(expression)
        return answer

    def post(self, request, *args, **kwargs):
        eligibility_criteria_id = request.data.get('criteria_id')
        criteria = get_object_or_404(
            FundEligibilityCriteria,
            fund__company=self.company,
            id=eligibility_criteria_id
        )

        custom_expression = request.data.get('custom_expression')
        criteria.custom_expression = custom_expression
        criteria.save(update_fields=['custom_expression'])
        invalid_response = {'is_valid': False, 'custom_expression': custom_expression}

        if not custom_expression:
            return Response(invalid_response)

        answer_ids = []
        for component in custom_expression:
            component_id = component['id']
            if str(component_id).lower() in LOGICAL_OPERATORS:
                continue
            answer_ids.append(str(component_id))

        expression = criteria.parse_custom_expression()
        try:
            return_false_for_all_false = self.validate_expression(
                expression=expression,
                answers={k: False for k in answer_ids},
                should_return=False
            )
        except:
            return Response(invalid_response)

        if return_false_for_all_false != False:
            return Response(invalid_response)

        try:
            answers = {k: True for k in answer_ids}
            return_true_for_all_true = self.validate_expression(
                expression=expression,
                answers=answers,
                should_return=True
            )
        except:
            return Response(invalid_response)

        if return_true_for_all_true != True:
            return Response(invalid_response)

        criteria.custom_expression = custom_expression
        criteria.save(update_fields=['custom_expression'])

        return Response({'is_valid': True, 'custom_expression': custom_expression})


class SmartDecisionBlockConnectorCreateAPIView(AdminViewMixin, CreateAPIView):
    serializer_class = SmartDecisionBlockConnectorSerializer
    permission_classes = (IsSidecarAdminUser,)

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['criteria'] = get_object_or_404(FundEligibilityCriteria, pk=self.kwargs['criteria_id'])
        return context


class SmartDecisionCriteriaBlockConnectorDelete(AdminViewMixin, APIView):

    def post(self, request, *args, **kwargs):
        serializer = SmartDecisionBlockConnectorSerializer(data=request.POST or request.data)
        if serializer.is_valid():
            data = serializer.validated_data
            to_block = data.get('to_block')
            from_option = data.get('from_option')
            if to_block.is_final_step:
                try:
                    block_connector = to_block.block_connected_from.get(from_block__is_user_documents_step=True)
                    to_block = block_connector.from_block
                except CriteriaBlockConnector.DoesNotExist:
                    pass

            query_data = {
                'from_block': data.get('from_block'),
                'to_block': to_block
            }

            if from_option:
                query_data['from_option'] = from_option

            connector = get_object_or_404(CriteriaBlockConnector, **query_data)
            connector.delete()

            return Response(status=status.HTTP_204_NO_CONTENT)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CustomSmartBlockTemplatesListCreateView(AdminViewMixin, ListCreateAPIView):
    queryset = CustomSmartBlockTemplate.objects.all()
    serializer_class = CustomSmartBlockTemplateSerializer

    def create(self, request, *args, **kwargs):
        data = request.data
        data['company'] = self.company.id
        serializer = CustomSmartBlockTemplateCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['company'] = self.company
        return context


class CustomSmartBlockTemplatesUpdateView(AdminViewMixin, RetrieveUpdateDestroyAPIView):
    queryset = CustomSmartBlockTemplate.objects.all()
    serializer_class = CustomSmartBlockTemplateSerializer

    def perform_destroy(self, instance):
        instance.deleted = True
        instance.save()


class CreateSmartBlockFromTemplateView(AdminViewMixin, APIView):
    def post(self, request, criteria_id, template_id):
        fund_eligibility_criteria = get_object_or_404(FundEligibilityCriteria, id=criteria_id)
        template = get_object_or_404(CustomSmartBlockTemplate, id=template_id)
        CreateCustomBlockFromTemplateService(
            eligibility_criteria=fund_eligibility_criteria,
            template=template,
            company=self.company
        ).process()
        return Response({'status': 'success'})
