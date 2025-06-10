from api.funds.models import Fund
from api.kyc_records.models import KYCRecord
from api.libs.review_service.base_review_service import BaseReviewService
from api.users.constants import FINANCIAL_ELIGIBILITY_REVIEWER
from api.users.models import RetailUser
from api.workflows.models import WorkFlow


class AmlKycReviewService(BaseReviewService):
    def __init__(self, kyc_record: KYCRecord, fund: Fund, user: RetailUser):
        self.company = fund.company
        self.user = user
        self.fund = fund
        self.kyc_record = kyc_record
        self.company_user = self.get_company_user()

    def get_workflow(self):
        parent_workflow = WorkFlow.objects.filter(
            fund=self.fund,
            associated_user=self.company_user,
            module=WorkFlow.WorkFlowModuleChoices.USER_ON_BOARDING.value,
            workflow_type=WorkFlow.WorkFlowTypeChoices.USER_RESPONSE.value,
            parent__isnull=True,
            company=self.company,
        ).latest('created_at')

        return parent_workflow.child_workflows.filter(
            module=WorkFlow.WorkFlowModuleChoices.AML_KYC.value,
            sub_module=str(self.kyc_record.kyc_investor_type)
        ).first()

    def start_review(self, force_mark_completed=False):
        workflow = self.get_workflow()
        if not workflow:
            return
        self.complete_user_task(workflow=workflow)

        fund_enabled_workflow = self.get_enabled_workflows(fund=self.fund)
        if not fund_enabled_workflow.get(WorkFlow.WorkFlowModuleChoices.AML_KYC.value, True):
            return {}

        if force_mark_completed:
            workflow.is_completed=True
            workflow.save()
            return

        self.create_task(group_name=FINANCIAL_ELIGIBILITY_REVIEWER, workflow=workflow, company=self.company)
        return {
            'workflow_id': workflow.id,
            'response_id': self.kyc_record.id
        }
