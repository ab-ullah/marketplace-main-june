from django.contrib.auth.models import Group

from api.models import BaseModel
from django.db import models
from django.utils.translation import gettext_lazy as _
from django_fsm import FSMIntegerField, transition

from core.managers.non_deleted_manager import NonDeletedManager


class NestedWorkflowsManager(models.Manager):
    def get_queryset(self):
        return super().get_queryset().filter(parent__isnull=False)


class ParentWorkflowsManager(models.Manager):
    def get_queryset(self):
        return super().get_queryset().filter(parent__isnull=True)


class WorkFlow(BaseModel):
    class WorkFlowTypeChoices(models.IntegerChoices):
        REVIEW = 1, _('Review')
        RESPONSE_REVIEW = 2, _('Response Review')
        USER_RESPONSE = 3, _('User Response')
        APPLICATION_ALLOCATION = 4, _('Application Allocation')
        APPLICATION_DOCUMENTS_SIGNING = 5, _('APPLICATION_DOCUMENTS_SIGNING')

    class WorkFlowModuleChoices(models.IntegerChoices):
        ELIGIBILITY = 1, _('Eligibility')
        INDICATION_OF_INTEREST = 2, _('Indication Of Interest')
        AML_KYC = 3, _('AML/KYC')
        USER_ON_BOARDING = 4, _('User On-boarding')
        TAX_RECORD = 5, _('Tax Record')
        AGREEMENTS = 6, _('Agreements')
        ALLOCATION = 7, _('Allocation')
        GP_SIGNING = 8, _('GP Signing')
        INTERNAL_TAX_REVIEW = 9, _('Internal Tax Review')
        CAPITAL_CALL = 10, _('Capital Call')
        DISTRIBUTION_NOTICE = 11, _('Distribution Notice')
        CARRY_PLAN = 12, _('Carry Plan')
        PRE_DOCUMENT_SIGNING = 13, _('Pre Document Signing')

    """                                                 
    General Partner Signer (GP Signing)                              
    Agreement Reviewer (Agreements)                                 
    Financial Eligibility Reviewer (AML/KYC)                     
    Knowledgeable Employee Eligibility Reviewer          
    External Reviewer (Tax Record)                                 
    Allocation Reviewer (Allocation)                                
    Internal Tax Reviewer (Internal Tax Review)                              
    Capital Call Reviewer (Capital Call)                              
    Distribution Notice Reviewer (Distribution Notice)                
    """

    name = models.CharField(max_length=250)
    company = models.ForeignKey(
        'companies.Company',
        on_delete=models.CASCADE,
        related_name='company_workflows'
    )
    created_by = models.ForeignKey(
        'admin_users.AdminUser',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='created_workflows'
    )
    associated_user = models.ForeignKey(
        'companies.CompanyUser',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='associated_workflows'
    )

    fund = models.ForeignKey(
        'funds.Fund',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='fund_workflows'
    )

    workflow_type = models.PositiveSmallIntegerField(
        choices=WorkFlowTypeChoices.choices
    )
    module = models.PositiveSmallIntegerField(
        choices=WorkFlowModuleChoices.choices,
        db_index=True
    )
    sub_module = models.CharField(
        max_length=120,
        null=True,
        blank=True
    )

    parent = models.ForeignKey(
        'self',
        related_name='child_workflows',
        null=True,
        blank=True,
        on_delete=models.SET_NULL
    )

    step = models.PositiveIntegerField(default=0)
    is_completed = models.BooleanField(default=False)
    deleted = models.BooleanField(default=False)

    def current_workflow(self, parent):
        return WorkFlow.objects.filter(parent=parent, is_completed=False).order_by("step").first()

    def has_review_task_created(self):
        return self.workflow_tasks.filter(task_type=Task.TaskTypeChoice.REVIEW_REQUEST.value).exists()

    objects = NonDeletedManager()
    nested_workflows = NestedWorkflowsManager()
    parent_workflows = ParentWorkflowsManager()


class Task(BaseModel):
    class StatusChoice(models.IntegerChoices):
        PENDING = 1, _('Pending')
        APPROVED = 2, _('Approved')
        CHANGES_REQUESTED = 3, _('Changes Requested')
        REJECTED = 4, _('Rejected')

    class TaskTypeChoice(models.IntegerChoices):
        REVIEW_REQUEST = 1, _('Review Request')
        CHANGES_REQUESTED = 2, _('Changes Requested')
        PUBLISH = 3, _('Publish')
        USER_RESPONSE = 4, _('User Response')

    name = models.CharField(
        max_length=250,
        null=True,
        blank=True
    )

    workflow = models.ForeignKey(
        'WorkFlow',
        on_delete=models.CASCADE,
        related_name='workflow_tasks'
    )
    assigned_to = models.ForeignKey(
        'admin_users.AdminUser',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_tasks'
    )

    status = FSMIntegerField(
        default=StatusChoice.PENDING,
        verbose_name='Task Status',
        choices=StatusChoice.choices,
    )

    task_type = FSMIntegerField(
        default=TaskTypeChoice.REVIEW_REQUEST,
        verbose_name='Task Type',
        choices=TaskTypeChoice.choices,
    )
    due_date = models.DateTimeField(null=True, blank=True)
    completed = models.BooleanField(default=False)
    requestor = models.ForeignKey(
        'admin_users.AdminUser',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='requested_tasks'
    )

    assigned_to_group = models.ForeignKey(
        Group,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_tasks')

    assigned_to_user = models.ForeignKey(
        'companies.CompanyUser',
        on_delete=models.DO_NOTHING,
        null=True,
        blank=True
    )

    approver = models.ForeignKey(
        'admin_users.AdminUser',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='approved_tasks'
    )
    approval_date = models.DateTimeField(null=True, blank=True)

    deleted = models.BooleanField(default=False)

    @transition(field=status, source='*', target=StatusChoice.PENDING, conditions=[])
    def status_to_pending(self):
        self.completed = False
        self.status = Task.StatusChoice.PENDING.value
        self.save()

    @transition(field=status, source=[StatusChoice.PENDING], target=StatusChoice.APPROVED, conditions=[],
                on_error=StatusChoice.PENDING)
    def status_to_approved(self):
        self.completed = True
        self.status = Task.StatusChoice.APPROVED.value
        self.save()

    @transition(field=status, source='*', target=StatusChoice.CHANGES_REQUESTED, conditions=[])
    def status_to_changes_requested(self):
        self.completed = False
        self.status = Task.StatusChoice.CHANGES_REQUESTED.value
        self.save()

    @transition(field=status, source='*', target=StatusChoice.REJECTED, conditions=[])
    def status_to_rejected(self):
        self.completed = False
        self.status = Task.StatusChoice.REJECTED.value
        self.save()

    @transition(field=status, source='*', target=TaskTypeChoice.REVIEW_REQUEST, conditions=[])
    def task_type_to_review_requested(self):
        pass

    @transition(field=status, source='*', target=TaskTypeChoice.CHANGES_REQUESTED, conditions=[])
    def task_type_to_changes_requested(self):
        pass

    @transition(field=status, source='*', target=TaskTypeChoice.PUBLISH, conditions=[])
    def task_type_to_publish(self):
        pass

    def complete_task(self):
        self.completed = True
        self.save()


class Comment(BaseModel):
    text = models.TextField()
    created_by = models.ForeignKey(
        'admin_users.AdminUser',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='user_comments'
    )
    workflow = models.ForeignKey(
        'WorkFlow',
        on_delete=models.CASCADE,
        related_name='workflow_comments'
    )


class CompanyWorkFlowConfig(BaseModel):
    company = models.OneToOneField(
        'companies.Company',
        on_delete=models.CASCADE,
        related_name='company_workflow_config'
    )
    require_eligibility_approval = models.BooleanField(default=False)
    require_allocation_approval = models.BooleanField(default=False)
    require_kyc_approval = models.BooleanField(default=True)
    require_tax_approval = models.BooleanField(default=False)
    require_pre_document_signing_approval = models.BooleanField(default=True)
    require_agreement_approval = models.BooleanField(default=True)


