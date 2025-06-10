from api.funds.models import Fund
from api.libs.review_service.base_review_service import BaseReviewService
from api.users.constants import ALLOCATION_REVIEWER
from api.workflows.models import WorkFlow
from api.workflows.services.user_on_boarding_workflow import UserOnBoardingWorkFlowService


class AllocationReviewService(BaseReviewService):
    def __init__(self, fund: Fund):
        self.company = fund.company
        self.fund = fund

    def start_review(self):
        on_boarding_service = UserOnBoardingWorkFlowService(fund=self.fund, company_user=None)
        fund_enabled_workflow = self.get_enabled_workflows(fund=self.fund)

        if not fund_enabled_workflow.get(WorkFlow.WorkFlowModuleChoices.ALLOCATION.value, True):
            return {}

        workflow = on_boarding_service.get_or_create_allocation_workflow()
        if not workflow:
            return
        workflow.is_completed = False
        workflow.save(update_fields=['is_completed'])
        self.create_task(group_name=ALLOCATION_REVIEWER, workflow=workflow, company=self.company, reopen_existing=True)
        return {
            'workflow_id': workflow.id,
        }
