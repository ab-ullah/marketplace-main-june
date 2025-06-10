from django.utils import timezone
from rest_framework import serializers

from api.admin_users.models import AdminUser
from api.admin_users.serializers import AdminUserSerializer
from api.capital_calls.models import FundCapitalCall
from api.carry_pools.models import CarryPlan
from api.carry_pools.services.workflow import CarryWorkflowService
from api.distribution_notices.models import DistributionNotice
from api.eligibility_criteria.serializers import \
    FundEligibilityCriteriaDetailSerializer
from api.eligibility_criteria.services.eligibility_criteria_preview import \
    CriteriaPreviewService
from api.libs.utils.user_name import get_display_name
from api.payments.serializers import PaymentDetailSerializer
from api.tax_records.services.tax_documents_approval_service import \
    TaxDocumentsApprovalService
from api.workflows.models import Comment, Task, WorkFlow
from api.workflows.services.approval_service import WorkFlowApprovalService
from api.workflows.services.send_application_changes_requested_email import \
    SendChangesRequestedEmail
from api.workflows.services.send_comments_mention_email import \
    SendCommentMentionEmail
from api.workflows.services.task_comments import TaskCommentService


class CommentSerializer(serializers.ModelSerializer):
    created_by_name = serializers.SerializerMethodField()
    users = serializers.ListField(child=serializers.IntegerField(), write_only=True)

    class Meta:
        model = Comment
        fields = '__all__'
        read_only_fields = ('created_by',)

    def create(self, validated_data):
        validated_data['created_by'] = self.context['admin_user']
        users = validated_data.pop('users', [])
        users = list(map(int, users))
        comment = super().create(validated_data=validated_data)
        SendCommentMentionEmail(
            user_ids=users,
            workflow_id=validated_data['workflow'].id
        ).send_comment_mention_email()
        return comment

    @staticmethod
    def get_created_by_name(obj: Comment):
        if not obj.created_by:
            return ''
        return get_display_name(obj.created_by.user)


class ReviewTaskSerializer(serializers.ModelSerializer):
    reviewer_name = serializers.SerializerMethodField()

    class Meta:
        model = Task
        fields = ('id', 'reviewer_name')

    @staticmethod
    def get_reviewer_name(obj: Task):
        return get_display_name(obj.assigned_to.user)


class AvailableReviewerSerializer(serializers.ModelSerializer):
    label = serializers.SerializerMethodField()
    value = serializers.IntegerField(source='id')

    class Meta:
        model = AdminUser
        fields = ('label', 'value',)

    @staticmethod
    def get_label(obj):
        return get_display_name(obj.user)


class TaskSerializer(serializers.ModelSerializer):
    description = serializers.CharField(source='workflow.name')
    fund_slug = serializers.CharField(source='workflow.fund.slug', default=None)
    fund_name = serializers.CharField(source='workflow.fund.name', default=None)
    module = serializers.SerializerMethodField()
    requestor_name = serializers.SerializerMethodField()
    investor_name = serializers.SerializerMethodField()
    status_name = serializers.SerializerMethodField()
    task_type_name = serializers.SerializerMethodField()
    module_id = serializers.SerializerMethodField()
    is_module_creator = serializers.SerializerMethodField()
    workflow_type = serializers.IntegerField(source='workflow.workflow_type')
    document_signing_info = serializers.SerializerMethodField()
    capital_call_id = serializers.SerializerMethodField()
    distribution_notice_id = serializers.SerializerMethodField()
    responsible = serializers.CharField(source='assigned_to.user.get_full_name', default=None)
    belongs_to_me = serializers.SerializerMethodField()
    fund_external_id = serializers.CharField(source='workflow.fund.external_id', default=None)
    carry_plan_id = serializers.IntegerField(source='workflow.workflow_carry_plan.id', default=None, read_only=True)

    class Meta:
        model = Task
        fields = '__all__'

    def get_belongs_to_me(self, obj: Task):
        try:
            return obj.assigned_to.id == self.context['admin_user'].id
        except AttributeError:
            return False

    @staticmethod
    def get_module(obj: Task):
        return obj.workflow.get_module_display()

    @staticmethod
    def get_requestor_name(obj: Task):
        if not obj.requestor:
            return ''
        return get_display_name(obj.requestor.user)

    @staticmethod
    def get_status_name(obj: Task):
        return obj.get_status_display()

    @staticmethod
    def get_task_type_name(obj: Task):
        return obj.get_task_type_display()

    @staticmethod
    def get_investor_name(obj: Task):
        workflow = obj.workflow
        if hasattr(workflow, 'parent') and workflow.workflow_type == WorkFlow.WorkFlowTypeChoices.USER_RESPONSE:
            if hasattr(workflow.parent, 'application'):
                return get_display_name(workflow.parent.application.user)
        elif hasattr(workflow, 'parent') and workflow.module == WorkFlow.WorkFlowModuleChoices.GP_SIGNING:
            if hasattr(workflow.parent, 'application'):
                return get_display_name(workflow.parent.application.user)

        return ''

    @staticmethod
    def get_module_id(obj: Task):
        workflow = obj.workflow
        if workflow.module == WorkFlow.WorkFlowModuleChoices.ELIGIBILITY:
            if workflow.workflow_type == WorkFlow.WorkFlowTypeChoices.USER_RESPONSE:
                if hasattr(workflow.parent, 'application'):
                    return workflow.parent.application.kyc_record_id
            if hasattr(workflow, 'workflow_eligibility_criteria'):
                eligibility_criteria = workflow.workflow_eligibility_criteria
                return eligibility_criteria.id

    def get_is_module_creator(self, obj: Task):
        workflow = obj.workflow
        if workflow.module == WorkFlow.WorkFlowModuleChoices.ELIGIBILITY:
            if workflow.workflow_type == WorkFlow.WorkFlowTypeChoices.USER_RESPONSE:
                return False
            if hasattr(workflow, 'workflow_eligibility_criteria'):
                return obj.workflow.workflow_eligibility_criteria.created_by_id == self.context['admin_user'].id
        return False

    @staticmethod
    def get_document_signing_info(obj: Task):
        if hasattr(obj, 'agreement_document'):
            return {
                'document_type': 'agreement',
                'envelope_id': obj.agreement_document.envelope_id,
                'fund_external_id': obj.agreement_document.application.fund.external_id,
            }
        if hasattr(obj, 'applicant_company_document'):
            return {
                'document_type': 'company_document',
                'envelope_id': obj.applicant_company_document.envelope_id,
                'fund_external_id': obj.applicant_company_document.application.fund.external_id,
            }

    @staticmethod
    def get_capital_call_id(obj: Task):
        if obj.workflow.module == WorkFlow.WorkFlowModuleChoices.CAPITAL_CALL.value:
            try:
                capital_call = FundCapitalCall.objects.get(workflow=obj.workflow)
                return capital_call.id
            except FundCapitalCall.DoesNotExist:
                return None
        return None

    @staticmethod
    def get_distribution_notice_id(obj: Task):
        if obj.workflow.module == WorkFlow.WorkFlowModuleChoices.DISTRIBUTION_NOTICE.value:
            try:
                distribution_notice = DistributionNotice.objects.get(workflow=obj.workflow)
                return distribution_notice.id
            except DistributionNotice.DoesNotExist:
                return None
        return None


class TaskDetailSerializer(serializers.ModelSerializer):
    fund_slug = serializers.CharField(source='workflow.fund.slug', default=None)
    fund_external_id = serializers.CharField(source='workflow.fund.external_id', default=None)
    module = serializers.IntegerField(source='workflow.module', default=None)
    eligibility_criteria = serializers.SerializerMethodField()
    kyc_record_id = serializers.SerializerMethodField()
    kyc_wf_slug = serializers.SerializerMethodField()

    eligibility_response_id = serializers.SerializerMethodField()
    application_id = serializers.IntegerField(source='workflow.parent.application.id', default=None)
    tax_record_id = serializers.IntegerField(source='workflow.parent.application.tax_record_id', default=None)
    payment_detail = PaymentDetailSerializer(
        read_only=True,
        source='workflow.parent.application.payment_detail',
        default=None
    )
    workflow_type = serializers.IntegerField(source='workflow.workflow_type')
    has_pending_comment = serializers.SerializerMethodField()
    capital_call_id = serializers.SerializerMethodField()
    distribution_notice_id = serializers.SerializerMethodField()
    responsible = serializers.CharField(source='assigned_to.user.get_full_name', default=None, read_only=True)
    approver = serializers.CharField(source='approver.user.get_full_name', default=None, read_only=True)
    approver_user_id = serializers.IntegerField(default=None)
    carry_plan_id = serializers.IntegerField(source='workflow.workflow_carry_plan.id', default=None, read_only=True)

    class Meta:
        model = Task
        fields = '__all__'

    def get_eligibility_criteria(self, obj: Task):
        if not obj.workflow.module == WorkFlow.WorkFlowModuleChoices.ELIGIBILITY:
            return None

        if hasattr(obj.workflow, 'workflow_eligibility_criteria'):
            eligibility_criteria = obj.workflow.workflow_eligibility_criteria
            serialized_data = FundEligibilityCriteriaDetailSerializer(eligibility_criteria, context=self.context).data
            preview_service = CriteriaPreviewService(data=serialized_data)
            return preview_service.process(add_intro=False)

        return {}

    @staticmethod
    def get_eligibility_response_id(obj: Task):
        workflow = obj.workflow
        if workflow.parent and workflow.workflow_type == WorkFlow.WorkFlowTypeChoices.USER_RESPONSE:
            return workflow.parent.application.eligibility_response_id

    @staticmethod
    def get_kyc_record_id(obj: Task):
        workflow = obj.workflow
        if workflow.parent and workflow.workflow_type == WorkFlow.WorkFlowTypeChoices.USER_RESPONSE or workflow.workflow_type == WorkFlow.WorkFlowTypeChoices.APPLICATION_DOCUMENTS_SIGNING:
            return workflow.parent.application.kyc_record_id

    @staticmethod
    def get_kyc_wf_slug(obj: Task):
        workflow = obj.workflow
        if workflow.parent and workflow.workflow_type == WorkFlow.WorkFlowTypeChoices.USER_RESPONSE:
            return workflow.parent.application.kyc_record.workflow.slug

    def update(self, instance: Task, validated_data):
        updated_task = super().update(instance=instance, validated_data=validated_data)
        if validated_data.get('status'):
            status = validated_data['status']
            if status == Task.StatusChoice.CHANGES_REQUESTED.value:
                _task, _ = Task.objects.update_or_create(
                    workflow=instance.workflow,
                    assigned_to=instance.workflow.created_by,
                    assigned_to_user=instance.workflow.associated_user,
                    requestor=self.context['admin_user'],
                    task_type=Task.TaskTypeChoice.CHANGES_REQUESTED.value,
                    defaults={
                        'name': 'Changes Requested'
                    }
                )
                _task.status_to_changes_requested()
                parent_workflow = instance.workflow.parent  # type: WorkFlow
                if parent_workflow and parent_workflow.workflow_type == WorkFlow.WorkFlowTypeChoices.USER_RESPONSE and parent_workflow.fund:
                    SendChangesRequestedEmail(
                        requested_by=self.context['admin_user'],
                        subject_user=instance.workflow.associated_user.user,
                        fund_external_id=instance.workflow.parent.fund.external_id,
                        fund_name=instance.workflow.parent.fund.name,
                        module_name=instance.workflow.get_module_display()
                    ).send_changes_requested_email()
            elif status == Task.StatusChoice.APPROVED.value:
                if instance.workflow.module == WorkFlow.WorkFlowModuleChoices.TAX_RECORD.value:
                    TaxDocumentsApprovalService(instance.workflow).process()
                WorkFlowApprovalService().process(workflow=instance.workflow)
                updated_task.approver_id = validated_data['approver_user_id']
                updated_task.approval_date = timezone.now()
                updated_task.save()
            elif status == Task.StatusChoice.REJECTED.value:
                if instance.workflow.module == WorkFlow.WorkFlowModuleChoices.ELIGIBILITY.value:
                    WorkFlowApprovalService().start_allocation_review(workflow=instance.workflow)

                if instance.workflow.module == WorkFlow.WorkFlowModuleChoices.CARRY_PLAN.value:
                    carry_plan = CarryPlan.objects.get(workflow=instance.workflow)
                    CarryWorkflowService(carry_plan=carry_plan).reject_carry_plan()

        return updated_task

    @staticmethod
    def get_has_pending_comment(obj: Task):
        return TaskCommentService(task=obj).process()

    @staticmethod
    def get_capital_call_id(obj: Task):
        if obj.workflow.module == WorkFlow.WorkFlowModuleChoices.CAPITAL_CALL.value:
            try:
                capital_call = FundCapitalCall.objects.get(workflow=obj.workflow)
                return capital_call.id
            except FundCapitalCall.DoesNotExist:
                return None
        return None

    @staticmethod
    def get_distribution_notice_id(obj: Task):
        if obj.workflow.module == WorkFlow.WorkFlowModuleChoices.DISTRIBUTION_NOTICE.value:
            try:
                distribution_notice = DistributionNotice.objects.get(workflow=obj.workflow)
                return distribution_notice.id
            except DistributionNotice.DoesNotExist:
                return None
        return None


class TaskListSerializer(serializers.ModelSerializer):
    fund_name = serializers.CharField(source='workflow.fund.name', default=None)
    fund_slug = serializers.CharField(source='workflow.fund.slug', default=None)
    fund_external_id = serializers.CharField(source='workflow.fund.external_id', default=None)
    workflow_module = serializers.IntegerField(source='workflow.module', default=None)

    class Meta:
        model = Task
        fields = '__all__'


class WorkflowSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkFlow
        fields = "__all__"
