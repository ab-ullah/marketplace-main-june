from api.funds.models import Fund
from api.libs.review_service.base_review_service import BaseReviewService
from api.tax_records.models import TaxRecord
from api.users.constants import EXTERNAL_REVIEWER
from api.users.models import RetailUser
from api.workflows.models import WorkFlow


class TaxReviewService(BaseReviewService):
    def __init__(self, tax_record: TaxRecord, fund: Fund, user: RetailUser):
        self.company = fund.company
        self.user = user
        self.fund = fund
        self.tax_record = tax_record
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
            module=WorkFlow.WorkFlowModuleChoices.TAX_RECORD.value,
        ).first()

    def start_review(self):
        fund_enabled_workflow = self.get_enabled_workflows(fund=self.fund)
        if not fund_enabled_workflow.get(WorkFlow.WorkFlowModuleChoices.TAX_RECORD.value, True):
            return {}

        workflow = self.get_workflow()
        if not workflow:
            return
        self.complete_user_task(workflow=workflow)
        self.create_task(group_name=EXTERNAL_REVIEWER, workflow=workflow, company=self.company)
        return {
            'workflow_id': workflow.id,
            'response_id': self.tax_record.id
        }

