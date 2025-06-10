from rest_framework import status
from rest_framework.generics import get_object_or_404
from rest_framework.response import Response
from rest_framework.views import APIView

from api.admin_users.models import AdminUser
from api.carry_pools.constants import CARRY_PLAN_PUBLISH_FEATURE_FLAG, CARRY_APPROVE_ERROR_MSG
from api.carry_pools.models import CarryPlan, ParticipantCarryDocument, CarryPool
from api.carry_pools.services.participant_document import AdminParticipantDocumentService
from api.mixins.admin_view_mixin import AdminViewMixin
from api.users.constants import CARRY_REVIEWER
from api.workflows.models import WorkFlow, Task


class CarryPlanSubmitForApprovalView(AdminViewMixin, APIView):
    def post(self, request, pk):
        reviewers = AdminUser.objects.filter(
            company=self.company,
            groups__name=CARRY_REVIEWER
        )
        if not reviewers.exists():
            return Response({'msg': CARRY_APPROVE_ERROR_MSG, 'has_errors': True}, status=status.HTTP_200_OK)

        carry_plan = get_object_or_404(CarryPlan, id=self.kwargs['pk'])
        workflow = WorkFlow.objects.create(
            name='carry plan review',
            company=self.company,
            created_by=self.admin_user,
            workflow_type=WorkFlow.WorkFlowTypeChoices.REVIEW.value,
            module=WorkFlow.WorkFlowModuleChoices.CARRY_PLAN.value
        )
        for reviewer in reviewers:
            Task.objects.create(
                workflow_id=workflow.id,
                assigned_to_id=reviewer.id,
                requestor=self.admin_user
            )

        carry_plan.workflow = workflow
        carry_plan.status = CarryPlan.Status.PENDING_APPROVAL.value
        carry_plan.save()

        return Response({'msg': 'Approval Request Has Been Sent to All Users With Carry Approval Permission.'},
                    status=status.HTTP_200_OK)


class CarryPlanPublishView(AdminViewMixin, APIView):
    def post(self, request, pk):
        feature_flag = self.company.is_feature_flag_active(CARRY_PLAN_PUBLISH_FEATURE_FLAG)
        if feature_flag:
            carry_plan = get_object_or_404(CarryPlan, id=self.kwargs['pk'])
            if carry_plan.status == CarryPlan.Status.APPROVED.value:
                carry_plan.status = CarryPlan.Status.PUBLISHED.value
                carry_plan.save()

                carry_pool = CarryPool.objects.filter(
                    carry_plan=carry_plan,
                    company=self.company,
                    status=CarryPool.Status.APPROVED.value
                )
                if carry_pool.exists():
                    carry_pool = carry_pool.latest('created_at')
                    CarryPool.objects.filter(
                        pk=carry_pool.pk,
                        company=self.company
                    ).update(status=CarryPool.Status.PUBLISHED.value)

            release_documents = request.data.get('release_documents')
            if release_documents:
                AdminParticipantDocumentService(self.company).release_documents_in_carry_plan(carry_plan)

            return Response({'msg': 'success'}, status=status.HTTP_200_OK)

        return Response({'msg': 'Feature Flag Disabled'}, status=status.HTTP_400_BAD_REQUEST)
