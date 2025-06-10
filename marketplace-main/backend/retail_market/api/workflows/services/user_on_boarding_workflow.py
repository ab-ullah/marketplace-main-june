from typing import Optional

from api.companies.models import CompanyUser
from api.eligibility_criteria.models import FundEligibilityCriteria
from api.funds.models import Fund
from api.kyc_records.models import KYCRecord
from api.workflows.models import WorkFlow, Task

TASK_OBJ_TYPE = 'task'
WORKFLOW_OBJ_TYPE = 'workflow'


class UserOnBoardingWorkFlowService:
    def __init__(self, fund: Fund, company_user: CompanyUser, transferred_application_id=None):
        self.fund = fund
        self.company_user = company_user
        self.transferred_application_id = transferred_application_id

    def get_parent_workflow_name(self):
        return f'On-boarding-Flow-for-{self.fund.name}'

    @staticmethod
    def get_label_for_eligibility_criteria(eligibility_criteria: FundEligibilityCriteria, obj_type: str):
        return f'Eligibility-{eligibility_criteria.name}-response-{obj_type}'

    @staticmethod
    def get_label_for_aml_kyc(obj_type: str):
        return f'AML/KYC-response-{obj_type}'

    @staticmethod
    def get_label_for_agreements(obj_type: str):
        return f'agreements-response-{obj_type}'

    @staticmethod
    def get_label_for_allocation(obj_type: str):
        return f'Allocation-response-{obj_type}'

    @staticmethod
    def get_label_for_gp_signing(obj_type: str):
        return f'GP-Signing-{obj_type}'

    @staticmethod
    def get_label_for_internal_tax_review(obj_type: str):
        return f'Internal-tax-review-{obj_type}'

    @staticmethod
    def get_label_for_pre_document_review(obj_type: str):
        return f'Pre-document-review-{obj_type}'

    @staticmethod
    def get_label_for_tax(obj_type: str):
        return f'Tax-response-{obj_type}'

    def get_or_create_parent_workflow(self):
        company_user = self.company_user

        params = {
            'fund': self.fund,
            'associated_user': company_user,
            'module': WorkFlow.WorkFlowModuleChoices.USER_ON_BOARDING.value,
            'workflow_type': WorkFlow.WorkFlowTypeChoices.USER_RESPONSE.value,
            'parent__isnull': True,
            'company': company_user.company,
            'defaults': {
                'name': self.get_parent_workflow_name()
            }
        }

        if self.transferred_application_id:
            params['application__id'] = self.transferred_application_id

        parent_workflow, _ = WorkFlow.objects.get_or_create(**params)

        return parent_workflow

    def get_or_create_module_workflow_task(
            self,
            module: int,
            workflow_name: str,
            task_name: str,
            sub_module: Optional[str] = None
    ):
        fund = self.fund
        company_user = self.company_user

        parent_workflow = self.get_or_create_parent_workflow()

        module_workflow, _ = WorkFlow.objects.get_or_create(
            fund=fund,
            associated_user=company_user,
            module=module,
            workflow_type=WorkFlow.WorkFlowTypeChoices.USER_RESPONSE.value,
            parent=parent_workflow,
            company=company_user.company,
            sub_module=sub_module,
            defaults={
                'name': workflow_name
            }
        )

        task, _ = Task.objects.get_or_create(
            workflow=module_workflow,
            assigned_to_user=company_user,
            task_type=Task.TaskTypeChoice.USER_RESPONSE.value,
            defaults={
                'name': task_name
            }
        )

        return module_workflow

    def get_or_create_eligibility_workflow(self, eligibility_criteria: FundEligibilityCriteria):
        return self.get_or_create_module_workflow_task(
            module=WorkFlow.WorkFlowModuleChoices.ELIGIBILITY.value,
            workflow_name=self.get_label_for_eligibility_criteria(
                eligibility_criteria=eligibility_criteria,
                obj_type=WORKFLOW_OBJ_TYPE
            ),
            task_name=self.get_label_for_eligibility_criteria(
                eligibility_criteria=eligibility_criteria,
                obj_type=TASK_OBJ_TYPE
            )
        )

    def get_or_create_kyc_workflow(self, kyc_record: KYCRecord):
        return self.get_or_create_module_workflow_task(
            module=WorkFlow.WorkFlowModuleChoices.AML_KYC.value,
            workflow_name=self.get_label_for_aml_kyc(obj_type=WORKFLOW_OBJ_TYPE),
            task_name=self.get_label_for_aml_kyc(obj_type=TASK_OBJ_TYPE),
            sub_module=str(kyc_record.kyc_investor_type)
        )

    def get_module_workflow(self, module_id, sub_module):
        fund = self.fund
        company_user = self.company_user

        try:
            parent_workflow = WorkFlow.objects.get(
                fund=self.fund,
                associated_user=company_user,
                module=WorkFlow.WorkFlowModuleChoices.USER_ON_BOARDING.value,
                workflow_type=WorkFlow.WorkFlowTypeChoices.USER_RESPONSE.value,
                parent__isnull=True,
                company=company_user.company
            )

            workflow = WorkFlow.objects.get(
                fund=fund,
                associated_user=company_user,
                module=module_id,
                workflow_type=WorkFlow.WorkFlowTypeChoices.USER_RESPONSE.value,
                parent=parent_workflow,
                company=company_user.company,
                sub_module=sub_module
            )
            return workflow
        except WorkFlow.DoesNotExist:
            return None

    def get_or_create_allocation_workflow(self):
        parent_workflow, _ = WorkFlow.objects.get_or_create(
            fund=self.fund,
            module=WorkFlow.WorkFlowModuleChoices.ALLOCATION.value,
            workflow_type=WorkFlow.WorkFlowTypeChoices.APPLICATION_ALLOCATION.value,
            parent__isnull=True,
            company=self.fund.company,
            defaults={
                'name': self.get_parent_workflow_name()
            }
        )
        workflow, _ = WorkFlow.objects.get_or_create(
            fund=self.fund,
            module=WorkFlow.WorkFlowModuleChoices.ALLOCATION.value,
            workflow_type=WorkFlow.WorkFlowTypeChoices.APPLICATION_ALLOCATION.value,
            parent=parent_workflow,
            company=self.fund.company,
            defaults={
                'name': self.get_label_for_allocation(obj_type=WORKFLOW_OBJ_TYPE)
            }
        )
        return workflow

    def get_or_create_tax_workflow(self):
        return self.get_or_create_module_workflow_task(
            module=WorkFlow.WorkFlowModuleChoices.TAX_RECORD.value,
            workflow_name=self.get_label_for_tax(obj_type=WORKFLOW_OBJ_TYPE),
            task_name=self.get_label_for_tax(obj_type=TASK_OBJ_TYPE),
        )

    def get_or_create_agreement_workflow(self):
        return self.get_or_create_module_workflow_task(
            module=WorkFlow.WorkFlowModuleChoices.AGREEMENTS.value,
            workflow_name=self.get_label_for_agreements(obj_type=WORKFLOW_OBJ_TYPE),
            task_name=self.get_label_for_agreements(obj_type=TASK_OBJ_TYPE),
        )

    def get_or_create_gp_signing_workflow(self, parent_workflow):
        workflow, _ = WorkFlow.objects.get_or_create(
            fund=self.fund,
            module=WorkFlow.WorkFlowModuleChoices.GP_SIGNING.value,
            workflow_type=WorkFlow.WorkFlowTypeChoices.APPLICATION_DOCUMENTS_SIGNING.value,
            parent=parent_workflow,
            company=self.fund.company,
            defaults={
                'name': self.get_label_for_gp_signing(obj_type=WORKFLOW_OBJ_TYPE)
            }
        )
        return workflow

    def get_or_create_internal_tax_review_workflow(self, parent_workflow):
        return self.get_or_create_module_workflow_task(
            module=WorkFlow.WorkFlowModuleChoices.INTERNAL_TAX_REVIEW.value,
            workflow_name=self.get_label_for_internal_tax_review(obj_type=WORKFLOW_OBJ_TYPE),
            task_name=self.get_label_for_internal_tax_review(obj_type=TASK_OBJ_TYPE),
        )

    def get_or_create_pre_document_review_workflow(self, parent_workflow):
        return self.get_or_create_module_workflow_task(
            module=WorkFlow.WorkFlowModuleChoices.PRE_DOCUMENT_SIGNING.value,
            workflow_name=self.get_label_for_pre_document_review(obj_type=WORKFLOW_OBJ_TYPE),
            task_name=self.get_label_for_pre_document_review(obj_type=TASK_OBJ_TYPE),
        )
