from typing import Optional

from django.db.models import Prefetch

from api.applications.models import Application
from api.documents.models import TaxDocument
from api.funds.constants import TASK_STATUSES
from api.funds.models import Fund
from api.workflows.models import WorkFlow, Task

NOT_STARTED_LABEL = 'Not Started'


class FundApplicationsStatusService:
    def __init__(self, fund: Fund, application: Optional[Application] = None):
        self.fund = fund
        self.application = application

    def get_workflows_tasks(self):
        workflows = WorkFlow.objects.filter(
            fund=self.fund,
            company=self.fund.company,
            module=WorkFlow.WorkFlowModuleChoices.USER_ON_BOARDING.value,
            workflow_type=WorkFlow.WorkFlowTypeChoices.USER_RESPONSE.value,
            parent__isnull=True
        )

        if self.application:
            workflows = workflows.filter(application=self.application)

        modules = [
                        WorkFlow.WorkFlowModuleChoices.AML_KYC.value,
                        WorkFlow.WorkFlowModuleChoices.TAX_RECORD.value,
                        WorkFlow.WorkFlowModuleChoices.AGREEMENTS.value,
                        WorkFlow.WorkFlowModuleChoices.ELIGIBILITY.value,
                        WorkFlow.WorkFlowModuleChoices.ALLOCATION.value,
                        WorkFlow.WorkFlowModuleChoices.PRE_DOCUMENT_SIGNING.value,
                    ]

        if self.fund.skip_tax:
            modules.remove(
                WorkFlow.WorkFlowModuleChoices.TAX_RECORD.value
            )

        if self.fund.enable_internal_tax_flow:
            modules.append(WorkFlow.WorkFlowModuleChoices.INTERNAL_TAX_REVIEW.value)

        workflows = workflows.prefetch_related(
            'application__kyc_record',
            'application__tax_record',
            'application__eligibility_response',
            Prefetch(
                'child_workflows',
                queryset=WorkFlow.objects.filter(
                    fund=self.fund,
                    workflow_type=WorkFlow.WorkFlowTypeChoices.USER_RESPONSE.value,
                    module__in=modules
                ).prefetch_related(
                    Prefetch(
                        'workflow_tasks',
                        queryset=Task.objects.filter(
                            task_type=Task.TaskTypeChoice.REVIEW_REQUEST.value
                        )
                    )
                )
            )
        )
        return workflows

    @staticmethod
    def get_investor_type(kyc_record):
        if not kyc_record:
            return None
        return str(kyc_record.kyc_investor_type)

    @staticmethod
    def get_workflow_task_status(workflow):
        if workflow.is_completed:
            return TASK_STATUSES[Task.StatusChoice.APPROVED.value]

        has_approved_task = False
        for task in workflow.workflow_tasks.all():
            if task.task_type == Task.TaskTypeChoice.REVIEW_REQUEST.value:
                if task.status != Task.StatusChoice.APPROVED.value:
                    return TASK_STATUSES[task.status]
                else:
                    has_approved_task = True

        if has_approved_task:
            return TASK_STATUSES[Task.StatusChoice.APPROVED.value]

        return NOT_STARTED_LABEL

    def get_tax_status(self, application):
        tax_record = application.tax_record
        tax_documents_count = TaxDocument.objects.filter(tax_record=tax_record, deleted=False).count()
        if tax_documents_count == 0:
            return NOT_STARTED_LABEL
        elif tax_record.is_approved:
            return TASK_STATUSES[Task.StatusChoice.APPROVED.value]
        else:
            return TASK_STATUSES[Task.StatusChoice.PENDING]

    def get_allocation_status(self):
        try:
            parent_workflow = WorkFlow.objects.get(
                fund=self.fund,
                module=WorkFlow.WorkFlowModuleChoices.ALLOCATION.value,
                workflow_type=WorkFlow.WorkFlowTypeChoices.APPLICATION_ALLOCATION.value,
                parent__isnull=True,
                company=self.fund.company,
            )
            child_workflow = parent_workflow.child_workflows.get(
                module=WorkFlow.WorkFlowModuleChoices.ALLOCATION.value,
                workflow_type=WorkFlow.WorkFlowTypeChoices.APPLICATION_ALLOCATION.value
            )
            return self.get_workflow_task_status(workflow=child_workflow)
        except:
            return NOT_STARTED_LABEL

    @staticmethod
    def get_marked_application_status(application: Application):
        if application.status == Application.Status.APPROVED:
            return 'Approved'
        if application.status == Application.Status.DENIED:
            return 'Declined'
        if application.status == Application.Status.WITHDRAWN:
            return 'Withdrawn'
        if application.status == Application.Status.FINALIZED:
            return 'Finalized'

        return 'Pending'

    def _get_application_status(self, application, allocation_status):
        if application.status >= Application.Status.DENIED.value:
            return self.get_marked_application_status(application=application)

        if allocation_status in [TASK_STATUSES[Task.StatusChoice.PENDING.value], NOT_STARTED_LABEL]:
            return allocation_status
        return TASK_STATUSES[Task.StatusChoice.PENDING.value]

    def application_is_approved(self):
        processed = self.process()
        approved = False
        if self.application.id in processed:
            approved = all([workflow_state in ['Approved', 'GP Signed'] for _, workflow_state in processed[self.application.id].items()])
        return approved

    def get_eligibility_criteria_status(self, application: Application, workflow):
        if not application.eligibility_response:
            return NOT_STARTED_LABEL

        if application.eligibility_response.is_approved:
            return TASK_STATUSES[Task.StatusChoice.APPROVED.value]

        if workflow:
            return self.get_workflow_task_status(workflow)

        return NOT_STARTED_LABEL

    def get_legal_docs_status(self, application, workflow, internal_tax_status=None):
        status = self.get_workflow_task_status(workflow)

        if status == TASK_STATUSES[Task.StatusChoice.APPROVED.value]:

            if not application.application_agreements.filter(agreement_document__require_gp_signature=True):
                return 'Approved'

            agreements = application.application_agreements.all()
            for agreement in agreements:
                if not agreement.gp_signing_complete and agreement.agreement_document.require_gp_signature:
                    return 'Pending GP'

            return 'GP Signed'

        if (status == TASK_STATUSES[Task.StatusChoice.CHANGES_REQUESTED.value] or
                status == TASK_STATUSES[Task.StatusChoice.REJECTED.value]):
            return status

        if internal_tax_status and internal_tax_status == TASK_STATUSES[Task.StatusChoice.APPROVED.value]:
            return TASK_STATUSES[Task.StatusChoice.PENDING.value]

        return status

    def process(self):
        application_status = {}
        workflows = self.get_workflows_tasks()
        allocation_status = self.get_allocation_status()
        for parent_workflow in workflows:
            if not hasattr(parent_workflow, 'application'):
                continue

            application = parent_workflow.application
            application_status[application.id] = {}

            kyc_investor_type = self.get_investor_type(application.kyc_record)
            agreement_workflow = None

            for workflow in parent_workflow.child_workflows.all():
                if workflow.module == WorkFlow.WorkFlowModuleChoices.AML_KYC.value:
                    # application_status[application.id]['kyc_aml'] = Task.StatusChoice.PENDING.label
                    if workflow.sub_module != kyc_investor_type:
                        continue
                    # if application.kyc_record.is_auto_approved():
                    #     application_status[application.id]['kyc_aml'] = TASK_STATUSES[ Task.StatusChoice.APPROVED.value]
                    # else:
                    application_status[application.id]['kyc_aml'] = self.get_workflow_task_status(workflow=workflow)

                elif workflow.module == WorkFlow.WorkFlowModuleChoices.TAX_RECORD.value:
                    if application.tax_record:
                        if application.tax_record.is_approved:
                            application_status[application.id]['taxReview'] = TASK_STATUSES[Task.StatusChoice.APPROVED.value]
                        else:
                            application_status[application.id]['taxReview'] = self.get_workflow_task_status(workflow=workflow)
                elif workflow.module == WorkFlow.WorkFlowModuleChoices.AGREEMENTS.value:
                    agreement_workflow = workflow
                elif workflow.module == WorkFlow.WorkFlowModuleChoices.INTERNAL_TAX_REVIEW.value:
                    application_status[application.id]['internal_tax'] = self.get_workflow_task_status(workflow=workflow)
                elif workflow.module == WorkFlow.WorkFlowModuleChoices.PRE_DOCUMENT_SIGNING.value:
                    application_status[application.id]['pre_document_stage'] = self.get_workflow_task_status(workflow=workflow)
                elif workflow.module == WorkFlow.WorkFlowModuleChoices.ELIGIBILITY.value:
                    application_status[application.id]['eligibility_decision'] = self.get_eligibility_criteria_status(
                        application=application,
                        workflow=workflow
                    )

            if agreement_workflow:
                application_status[application.id]['legalDocs'] = self.get_legal_docs_status(
                    application=application,
                    workflow=agreement_workflow,
                    internal_tax_status=application_status[application.id].get('internal_tax')
                )

            application_status[application.id]['application_approval'] = self._get_application_status(
                application=application,
                allocation_status=allocation_status
            )

            if not application_status[application.id].get('eligibility_decision'):
                application_status[application.id]['eligibility_decision'] = self.get_eligibility_criteria_status(
                    application=application,
                    workflow=None
                )

        return application_status
