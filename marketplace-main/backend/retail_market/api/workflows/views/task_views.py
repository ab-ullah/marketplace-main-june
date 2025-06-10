from django.db.models import Q, Prefetch
from django.http import Http404
from rest_framework.generics import RetrieveUpdateDestroyAPIView, ListAPIView, UpdateAPIView, RetrieveAPIView
from rest_framework.response import Response
from rest_framework.views import APIView

from api.admin_users.models import AdminUser
from api.applications.models import Application
from api.eligibility_criteria.services.publish_criteria import PublishCriteria
from api.funds.services.gp_signing_service import GPSigningService
from api.libs.pagination.api_pagination import CustomPagination
from api.mixins.admin_view_mixin import AdminViewMixin
from api.mixins.company_user_mixin import CompanyUserViewMixin
from api.notifications.services.create_application_notification import CreateApplicationNotification
from api.permissions.is_sidecar_admin_permission import IsSidecarAdminUser
from api.workflows.models import Task, WorkFlow
from api.workflows.serializers import ReviewTaskSerializer, AvailableReviewerSerializer, TaskSerializer, \
    TaskDetailSerializer, TaskListSerializer
from api.workflows.serializers import (WorkflowSerializer)
from api.workflows.services.user_on_boarding_workflow import UserOnBoardingWorkFlowService
from django_filters import rest_framework as filters
from api.users.constants import ADMIN_GROUP_NAME


class InvestorFilter(filters.CharFilter):
    def filter(self, qs, value):
        if value:
            return qs.filter(
                (
                        Q(workflow__parent__application__user__email__icontains=value) |
                        Q(workflow__parent__application__user__last_name__icontains=value) |
                        Q(workflow__parent__application__user__first_name__icontains=value)
                )
                &
                (
                        Q(workflow__workflow_type=WorkFlow.WorkFlowTypeChoices.USER_RESPONSE) |
                        Q(workflow__module=WorkFlow.WorkFlowModuleChoices.GP_SIGNING)
                )
            )
        else:
            return qs


class TaskFilter(filters.FilterSet):
    fund_id = filters.BaseInFilter(field_name="workflow__fund_id")
    module = filters.BaseInFilter(field_name="workflow__module")
    status = filters.BaseInFilter(field_name="status")
    investor = InvestorFilter()

    class Meta:
        model = Task
        fields = ['fund_id', 'module', 'status']


class TaskAPIViewMixin(AdminViewMixin):

    def is_full_access_admin(self, groups):
        return groups.filter(name=ADMIN_GROUP_NAME).exists()

    def get_queryset(self):
        groups = self.admin_user.groups.all()
        q_filters = Q()
        if not self.is_full_access_admin(groups=groups):
            q_filters = Q(assigned_to=self.admin_user)
            q_filters |= Q(assigned_to_group__in=[g for g in groups])
        else:
            q_filters |= Q(assigned_to__isnull=False)
            q_filters |= Q(assigned_to_group__isnull=False)

        q_filters &= Q(workflow__company=self.company)
        qs = Task.objects.filter(q_filters)
        return qs


class TasksListAPIView(TaskAPIViewMixin, ListAPIView):
    permission_classes = (IsSidecarAdminUser,)
    serializer_class = TaskSerializer
    pagination_class = CustomPagination
    filter_backends = (filters.DjangoFilterBackend,)
    filterset_class = TaskFilter

    def get_queryset(self):
        # This is a temporary solution to hide the tasks that are no longer active
        # TODO: we will consider that task as hidden and show in completed/hidden tab
        # and show proper message on UI
        super_qs = super().get_queryset()
        qs = super_qs.exclude(
            workflow__module=WorkFlow.WorkFlowModuleChoices.ELIGIBILITY.value,
            workflow__workflow_type=WorkFlow.WorkFlowTypeChoices.USER_RESPONSE.value,
            workflow__parent__isnull=True
        ).exclude(
            workflow__parent__application__status=Application.Status.WITHDRAWN,
        ).order_by(
            '-created_at'
        ).prefetch_related(
            Prefetch('workflow', queryset=WorkFlow.objects.select_related('fund'))
        ).prefetch_related(
            'workflow__workflow_eligibility_criteria'
        ).prefetch_related(
            'workflow__application__user'
        ).select_related('agreement_document') \
         .select_related('applicant_company_document') \
         .select_related('assigned_to__user') \
         .select_related('requestor__user')
        return qs

    def get_serializer_context(self):
        admin_user = self.admin_user
        context = super(TasksListAPIView, self).get_serializer_context()
        context.update({"admin_user": admin_user})
        return context

class RecentTasksCountAPIView(AdminViewMixin, APIView):
    permission_classes = (IsSidecarAdminUser,)

    def get(self, request):
        count = Task.objects.filter(
            assigned_to=self.admin_user,
            completed=False
        ).exclude(
            workflow__module=WorkFlow.WorkFlowModuleChoices.ELIGIBILITY.value,
            workflow__workflow_type=WorkFlow.WorkFlowTypeChoices.USER_RESPONSE.value,
            workflow__parent__isnull=True
        ).count()
        return Response({'count': count})


class RevisedChangesAPIView(AdminViewMixin, UpdateAPIView):
    permission_classes = (IsSidecarAdminUser,)

    def get_queryset(self):
        return WorkFlow.objects.filter(created_by=self.admin_user)

    def patch(self, request, *args, **kwargs):
        workflow = self.get_object()
        workflow.workflow_tasks.filter(
            assigned_to=self.admin_user,
            task_type=Task.TaskTypeChoice.CHANGES_REQUESTED
        ).update(completed=True)
        _tasks = workflow.workflow_tasks.filter(
            requestor=self.admin_user,
            task_type=Task.TaskTypeChoice.REVIEW_REQUEST
        ).exclude(
            status=Task.StatusChoice.APPROVED
        )
        PublishCriteria.set_tasks_status_pending(_tasks)

        return Response({'status': 'success'})


class SubmitChangesForTaskAPIView(UpdateAPIView):
    def get_queryset(self):
        return Task.objects.filter(assigned_to_user__user=self.request.user)

    def patch(self, request, *args, **kwargs):
        task = self.get_object()
        workflow = task.workflow
        workflow.workflow_tasks.filter(
            assigned_to_user__user=self.request.user,
            task_type=Task.TaskTypeChoice.CHANGES_REQUESTED
        ).update(completed=True)
        _tasks = workflow.workflow_tasks.filter(
            task_type=Task.TaskTypeChoice.REVIEW_REQUEST
        ).exclude(
            status=Task.StatusChoice.APPROVED
        )
        PublishCriteria.set_tasks_status_pending(_tasks)

        return Response({'status': 'success'})


class TaskReviewersAPIView(AdminViewMixin, APIView):
    permission_classes = (IsSidecarAdminUser,)

    def get_criteria_reviewers_response(self):
        workflow_id = self.kwargs.get('workflow_id')
        current_tasks = Task.objects.filter(workflow_id=workflow_id)
        current_reviewer_ids = list(current_tasks.values_list('assigned_to_id', flat=True))
        not_invited_reviewers = AdminUser.objects.filter(
            company=self.company
        ).exclude(
            id__in=current_reviewer_ids
        )
        return Response(
            {
                'reviewers': ReviewTaskSerializer(current_tasks, many=True).data,
                'available_reviewers': AvailableReviewerSerializer(not_invited_reviewers, many=True).data
            }
        )

    def get(self, request, *args, **kwargs):
        return self.get_criteria_reviewers_response()

    def post(self, request, *args, **kwargs):
        workflow_id = self.kwargs.get('workflow_id')
        for user_id in request.data.get('users'):
            Task.objects.create(
                workflow_id=workflow_id,
                assigned_to_id=user_id,
                requestor=self.admin_user
            )

        return self.get_criteria_reviewers_response()


class TaskRetrieveUpdateDestroyAPIView(TaskAPIViewMixin, RetrieveUpdateDestroyAPIView):
    permission_classes = (IsSidecarAdminUser,)
    queryset = Task.objects.all()
    serializer_class = TaskDetailSerializer

    def patch(self, request, *args, **kwargs):
        request.data['approver_user_id'] = self.admin_user.id
        return self.partial_update(request, *args, **kwargs)


class WorkFlowCurrentStepView(AdminViewMixin, RetrieveAPIView):
    permission_classes = (IsSidecarAdminUser,)
    serializer_class = WorkflowSerializer

    def get_object(self):
        current_workflow_id = self.kwargs['parent_workflow_id']

        return WorkFlow.objects.filter(
            parent=current_workflow_id,
            is_completed=False,
        ).order_by('step').first()


class CompanyUserTaskListAPIView(CompanyUserViewMixin, ListAPIView):
    serializer_class = TaskListSerializer
    queryset = Task.objects.all()

    def get_queryset(self):
        return self.queryset.filter(
            workflow__company__in=self.company_ids,
            assigned_to_user__user=self.request.user,
            task_type=Task.TaskTypeChoice.CHANGES_REQUESTED.value,
            completed=False
        )


class CompanyUserInProgressTaskAPIView(CompanyUserViewMixin, APIView):
    def get(self, request, *args, **kwargs):
        try:
            latest_pending_task = Task.objects.filter(
                assigned_to_user__user=self.requested_user,
                completed=False,
                task_type=Task.TaskTypeChoice.USER_RESPONSE,
                workflow__parent__isnull=False
            ).latest('created_at')
        except Task.DoesNotExist:
            raise Http404

        parent_workflow = latest_pending_task.workflow.parent
        total_count = 0
        completed_count = 0
        for child_workflow in parent_workflow.child_workflows.all():
            total_count += 1
            has_pending_task = child_workflow.workflow_tasks.filter(
                assigned_to_user__user=self.requested_user,
                completed=False,
                task_type=Task.TaskTypeChoice.USER_RESPONSE
            ).exists()
            if not has_pending_task:
                completed_count += 1

        percent_completed = 0
        if total_count:
            percent_completed = 100 * completed_count / total_count
            percent_completed = round(percent_completed, 2)
        return Response({
            'fund_slug': parent_workflow.fund.slug,
            'fund_external_id': parent_workflow.fund.external_id,
            'fund_name': parent_workflow.fund.name,
            'percent_completed': percent_completed,
            'module': parent_workflow.module
        })


class CreateGPSigningTaskView(AdminViewMixin, APIView):

    def post(self, request):
        application = Application.objects.get(id=self.request.data['application_id'])
        on_boarding_workflow_service = UserOnBoardingWorkFlowService(
            fund=application.fund,
            company_user=None,
            transferred_application_id=application.id if application.is_transferred else None
        )
        if application.is_gp_signed():
            CreateApplicationNotification(application=application).create()
        gp_signing_workflow = on_boarding_workflow_service.get_or_create_gp_signing_workflow(application.workflow)
        GPSigningService(fund=application.fund, workflow=gp_signing_workflow, application=application).start_review()
        return Response({'status': 'success'})
