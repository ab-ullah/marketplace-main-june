from copy import deepcopy

from django.db.models import Prefetch

from api.applications.models import Application, UserApplicationState
from api.applications.selectors.application_started_fund_ids import get_active_application_workflow_ids
from api.applications.services.create_application_company_documents import ApplicationCompanyDocumentsService
from api.funds.constants import TASK_STATUSES, APPROVED_STATUS, PENDING_STATUS, CHANGES_REQUESTED_STATUS
from api.funds.models import FundDocumentResponse, Fund
from api.funds.services.application_fund_documents import ApplicationFundDocuments
from api.libs.utils.urls import get_eligibility_url, get_aml_kyc_url, get_tax_record_url, get_agreements_url, \
    get_bank_detail_url, get_review_docs_url, get_fund_application_url, get_program_docs_url
from api.users.models import RetailUser
from api.workflows.models import WorkFlow, Task
from api.constants.module_choices import ModuleChoices

NOT_STARTED_LABEL = 'Not Started'

ELIGIBILITY_MODULE = 'eligibility'
KYC_MODULE = 'kyc_aml'
TAX_REVIEW_MODULE = 'taxReview'
LEGAL_DOCS_MODULE = 'legalDocs'
INTERNAL_TAX_REVIEW = 'internal_tax'
PRE_DOCUMENT_SIGNING = 'pre_document_signing'


INTERNAL_TAX_MODULE_SEQUENCE = ('kyc_aml', 'taxReview', 'internal_tax', 'legalDocs')
MODULE_SEQUENCE = ('kyc_aml', 'taxReview', 'legalDocs')
PRE_DOCUMENT_SIGNING_SEQUENCE = ('kyc_aml', 'pre_document_signing', 'internal_tax', 'legalDocs')

MODULE_URL_FUNCTION_MAPPING = {
    KYC_MODULE: get_aml_kyc_url,
    TAX_REVIEW_MODULE: get_tax_record_url,
    LEGAL_DOCS_MODULE: get_agreements_url,
    INTERNAL_TAX_REVIEW: get_agreements_url,
    PRE_DOCUMENT_SIGNING: get_bank_detail_url,
}


# TODO: Merge this with FundApplicationsStatusService
class InvestorApplicationsStatusService:
    def __init__(self, user: RetailUser, application=None):
        self.user = user
        self.application = application

    def get_modules(self):
        modules = [
            WorkFlow.WorkFlowModuleChoices.AML_KYC.value,
            WorkFlow.WorkFlowModuleChoices.TAX_RECORD.value,
            WorkFlow.WorkFlowModuleChoices.AGREEMENTS.value,
            WorkFlow.WorkFlowModuleChoices.ELIGIBILITY.value,
        ]

        if self.application and self.application.fund.skip_tax:
            modules.remove(WorkFlow.WorkFlowModuleChoices.TAX_RECORD.value)

        if self.application and self.application.fund.has_pre_document_signing_approval():
            if WorkFlow.WorkFlowModuleChoices.TAX_RECORD.value in modules:
                modules.remove(WorkFlow.WorkFlowModuleChoices.TAX_RECORD.value)
            modules.remove(WorkFlow.WorkFlowModuleChoices.ELIGIBILITY.value)
            modules.append(WorkFlow.WorkFlowModuleChoices.PRE_DOCUMENT_SIGNING.value)

        if not self.application or self.application.fund.enable_internal_tax_flow:
            modules.append(WorkFlow.WorkFlowModuleChoices.INTERNAL_TAX_REVIEW.value)
            return modules

        return modules

    def get_workflows_tasks(self):
        if self.application:
            workflow_ids = [self.application.workflow_id]
        else:
            workflow_ids = get_active_application_workflow_ids(user=self.user)

        modules = self.get_modules()

        workflows = WorkFlow.objects.filter(
            id__in=workflow_ids
        ).prefetch_related(
            'application__kyc_record',
            'application__tax_record',
            'application__fund',
            'application__eligibility_response',
            Prefetch(
                'child_workflows',
                queryset=WorkFlow.objects.filter(

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
            return APPROVED_STATUS

        has_approved_task = False
        for task in workflow.workflow_tasks.all():
            if task.task_type == Task.TaskTypeChoice.REVIEW_REQUEST.value:
                if task.status != Task.StatusChoice.APPROVED.value:
                    return TASK_STATUSES[task.status]
                else:
                    has_approved_task = True

        if has_approved_task:
            return APPROVED_STATUS

        return NOT_STARTED_LABEL

    def get_eligibility_criteria_status(self, application: Application, workflow):
        if not application.eligibility_response:
            return NOT_STARTED_LABEL

        if application.eligibility_response.is_approved:
            return TASK_STATUSES[Task.StatusChoice.APPROVED.value]

        if workflow:
            return self.get_workflow_task_status(workflow)

        return NOT_STARTED_LABEL

    @staticmethod
    def categorize_workflow_status(status, wait_for_approval):
        if status == NOT_STARTED_LABEL:
            return 'approved', False

        if status == CHANGES_REQUESTED_STATUS:
            return 'changes_requested', False

        if not wait_for_approval:
            return 'approved', True

        if status == APPROVED_STATUS:
            return 'approved', True

        if status == PENDING_STATUS:
            return 'pending', False

        return 'approved', True

    @staticmethod
    def get_fund_module_sequence(fund: Fund):
        if fund.has_pre_document_signing_approval():
            sequence = [module for module in PRE_DOCUMENT_SIGNING_SEQUENCE]
            if not fund.enable_internal_tax_flow:
                sequence.remove('internal_tax')
            return sequence
        sequence = INTERNAL_TAX_MODULE_SEQUENCE if fund.enable_internal_tax_flow else MODULE_SEQUENCE
        sequence = deepcopy(sequence)
        if fund.skip_tax:
            sequence = [x for x in sequence]
            sequence.remove('taxReview')
        return sequence

    @staticmethod
    def any_module_has_changes_requested(fund_status, module_sequence):
        for module in module_sequence:
            if fund_status.get(module, '') == CHANGES_REQUESTED_STATUS:
                return True, module
        return False, None

    @staticmethod
    def has_reviewed_fund_documents(application: Application):
        fund_documents_qs = ApplicationFundDocuments(application=application).get_documents(
            require_signature=False
        )
        fund_document_ids = list(fund_documents_qs.values_list('id', flat=True))
        if not fund_document_ids:
            return True

        try:
            fund_document_response = FundDocumentResponse.objects.get(
                user__user=application.user,
                user__company=application.company,
                fund=application.fund
            )
            response_payload = fund_document_response.response_json
            for document_id in fund_document_ids:
                if not response_payload.get(str(document_id)):
                    return False
            return True
        except FundDocumentResponse.DoesNotExist:
            return False

    def is_application_completed(self, fund_application_statuses):
        modules = ['eligibility_decision', 'kyc_aml', 'taxReview', 'legalDocs', 'allocation']

        if self.application and self.application.fund.skip_tax:
            modules.remove('taxReview')

        if self.application and self.application.fund.has_pre_document_signing_approval():
            modules = ['kyc_aml', 'pre_document_signing', 'legalDocs']

        for module in modules:
            status = fund_application_statuses.get(module, '')
            if status.lower() != 'approved':
                return False

        return True

    @staticmethod
    def has_completed_company_docs(application: Application):
        return ApplicationCompanyDocumentsService(
            application=application
        ).get_documents(get_pending_count_only=True) == 0

    def get_status(self, fund_application_statuses):
        fund_id_status_mapping = {}
        fund_id_next_url_mapping = {}
        fund_id_changes_requested_module = {}
        application_completed = {}
        for fund_external_id, status in fund_application_statuses.items():
            application = status['application']
            fund = application.fund
            has_pre_document_signing_approval = fund.has_pre_document_signing_approval()
            wait_for_approval = application.fund.wait_for_approval
            module_sequence = self.get_fund_module_sequence(fund=application.fund)
            eligibility_decision = status.get('eligibility_decision')
            fund_id_next_url_mapping[fund_external_id] = get_eligibility_url(fund_external_id)

            if has_pre_document_signing_approval:
                kyc_status = status.get('kyc_aml', 'Not Started')
                if kyc_status == 'Not Started':
                    fund_id_status_mapping[fund_external_id] = 'continue'
                    if UserApplicationState.objects.filter(
                        fund=fund,
                        user=application.user,
                        module=ModuleChoices.KYC_RECORD.value
                    ).exists():
                        fund_id_next_url_mapping[fund_external_id] = get_aml_kyc_url(fund_external_id)
                    else:
                        fund_id_next_url_mapping[fund_external_id] = get_eligibility_url(fund_external_id)
                    continue

            if not has_pre_document_signing_approval:
                if not eligibility_decision or eligibility_decision == NOT_STARTED_LABEL:
                    fund_id_status_mapping[fund_external_id] = 'continue'
                    continue

                decision, can_move_forward = self.categorize_workflow_status(
                    status=eligibility_decision,
                    wait_for_approval=wait_for_approval
                )
                fund_id_status_mapping[fund_external_id] = decision
                if not can_move_forward:
                    if eligibility_decision == CHANGES_REQUESTED_STATUS:
                        fund_id_changes_requested_module[fund_external_id] = ELIGIBILITY_MODULE
                    continue

                if status.get('allocation', '') != 'approved' and wait_for_approval:
                    fund_id_status_mapping[fund_external_id] = 'pending'
                    continue

            has_changes_requested, changes_requested_module = self.any_module_has_changes_requested(
                fund_status=status,
                module_sequence=module_sequence
            )
            if has_changes_requested:
                fund_id_status_mapping[fund_external_id] = 'changes_requested'
                fund_id_next_url_mapping[fund_external_id] = get_fund_application_url(fund_external_id)
                fund_id_changes_requested_module[fund_external_id] = changes_requested_module
                continue

            for module in module_sequence:
                module_url_function = MODULE_URL_FUNCTION_MAPPING[module]
                fund_id_next_url_mapping[fund_external_id] = module_url_function(fund_external_id)
                if module in [INTERNAL_TAX_REVIEW, LEGAL_DOCS_MODULE]:
                    if not application.payment_detail:
                        fund_id_next_url_mapping[fund_external_id] = get_bank_detail_url(fund_external_id)
                    elif not self.has_completed_company_docs(application=application):
                        fund_id_next_url_mapping[fund_external_id] = get_program_docs_url(fund_external_id)
                    elif not self.has_reviewed_fund_documents(application=application):
                        fund_id_next_url_mapping[fund_external_id] = get_review_docs_url(fund_external_id)

                if module not in status:
                    break
                decision, can_move_forward = self.categorize_workflow_status(
                    status=status[module],
                    wait_for_approval=wait_for_approval
                )
                fund_id_status_mapping[fund_external_id] = decision
                if not can_move_forward:
                    break

            application_completed[fund_external_id] = self.is_application_completed(status)

        return (fund_id_status_mapping,
                fund_id_next_url_mapping,
                fund_id_changes_requested_module,
                application_completed
                )

    def process(self):
        application_status = {}
        workflows = self.get_workflows_tasks()
        for parent_workflow in workflows:
            if not hasattr(parent_workflow, 'application'):
                continue

            application = parent_workflow.application
            fund = application.fund
            has_pre_document_signing_approval = fund.has_pre_document_signing_approval()
            fund_external_id = application.fund.external_id
            if not has_pre_document_signing_approval:
                application_status[fund_external_id] = {
                    'allocation': 'approved' if application.status == Application.Status.APPROVED.value else 'pending'
                }
            else:
                application_status[fund_external_id] = {}

            kyc_investor_type = self.get_investor_type(application.kyc_record)

            for workflow in parent_workflow.child_workflows.all():
                application_status[fund_external_id]['application'] = application
                if workflow.module == WorkFlow.WorkFlowModuleChoices.AML_KYC.value:
                    # application_status[fund_external_id]['kyc_aml'] = Task.StatusChoice.PENDING.label
                    if workflow.sub_module != kyc_investor_type:
                        continue
                    # if application.kyc_record.is_auto_approved():
                    #     application_status[application.id]['kyc_aml'] = TASK_STATUSES[ Task.StatusChoice.APPROVED.value]
                    # else:
                    application_status[fund_external_id]['kyc_aml'] = self.get_workflow_task_status(workflow=workflow)

                elif workflow.module == WorkFlow.WorkFlowModuleChoices.TAX_RECORD.value:
                    if application.tax_record:
                        if application.tax_record.is_approved:
                            application_status[fund_external_id]['taxReview'] = APPROVED_STATUS
                        else:
                            application_status[fund_external_id]['taxReview'] = self.get_workflow_task_status(
                                workflow=workflow)
                    else:
                        application_status[fund_external_id]['taxReview'] = NOT_STARTED_LABEL
                elif workflow.module == WorkFlow.WorkFlowModuleChoices.PRE_DOCUMENT_SIGNING.value:
                    if fund.has_pre_document_signing_approval():
                        application_status[fund_external_id]['pre_document_signing'] = self.get_workflow_task_status(workflow=workflow)
                elif workflow.module == WorkFlow.WorkFlowModuleChoices.AGREEMENTS.value:
                    application_status[fund_external_id]['legalDocs'] = self.get_workflow_task_status(workflow=workflow)
                elif workflow.module == WorkFlow.WorkFlowModuleChoices.INTERNAL_TAX_REVIEW.value:
                    if not fund.enable_internal_tax_flow:
                        continue
                    application_status[fund_external_id]['internal_tax'] = self.get_workflow_task_status(
                        workflow=workflow)
                elif workflow.module == WorkFlow.WorkFlowModuleChoices.ELIGIBILITY.value:
                    application_status[fund_external_id]['eligibility_decision'] = self.get_eligibility_criteria_status(
                        application=application,
                        workflow=workflow
                    )

            if not application_status[fund_external_id].get('eligibility_decision') and not has_pre_document_signing_approval:
                application_status[fund_external_id]['eligibility_decision'] = self.get_eligibility_criteria_status(
                    application=application,
                    workflow=None
                )

        return self.get_status(fund_application_statuses=application_status)
