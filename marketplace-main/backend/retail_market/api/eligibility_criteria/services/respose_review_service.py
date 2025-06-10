from api.eligibility_criteria.models import EligibilityCriteriaResponse
from api.eligibility_criteria.services.get_eligibility_criteria_user_response import \
    FundEligibilityCriteriaPreviewResponse
from api.libs.review_service.base_review_service import BaseReviewService
from api.users.constants import FINANCIAL_ELIGIBILITY_REVIEWER, KNOWLEDGEABLE_ELIGIBILITY_REVIEWER
from api.users.models import RetailUser
from api.workflows.models import WorkFlow


class EligibilityCriteriaReviewService(BaseReviewService):
    def __init__(self, eligibility_response_id: int, user: RetailUser):
        self.eligibility_response_id = eligibility_response_id
        self.eligibility_response = self.get_eligibility_criteria()
        self.user = user
        self.company = self.eligibility_response.criteria.fund.company
        self.company_user = self.get_company_user()
        self.fund = self.eligibility_response.criteria.fund

    def get_eligibility_criteria(self):
        return EligibilityCriteriaResponse.objects.select_related(
            'criteria'
        ).select_related(
            'criteria__fund'
        ).get(
            id=self.eligibility_response_id
        )

    def create_tasks(self, workflow: WorkFlow):
        is_knowledgeable = self.eligibility_response.is_knowledgeable
        is_financial = self.eligibility_response.is_financial
        if is_knowledgeable:
            self.create_task(group_name=KNOWLEDGEABLE_ELIGIBILITY_REVIEWER, workflow=workflow, company=self.company)
        if not is_knowledgeable or is_financial:
            self.create_task(group_name=FINANCIAL_ELIGIBILITY_REVIEWER, workflow=workflow, company=self.company)

    def start_review(self):
        if not self.company_user:
            return {}

        fund_enabled_workflow = self.get_enabled_workflows(fund=self.fund)
        if not fund_enabled_workflow.get(WorkFlow.WorkFlowModuleChoices.ELIGIBILITY.value, True):
            return {}

        if not self.eligibility_response.workflow:
            workflow = FundEligibilityCriteriaPreviewResponse.create_criteria_response_workflow(
                fund=self.eligibility_response.criteria.fund,
                company_user=self.company_user,
                eligibility_criteria=self.eligibility_response.criteria
            )
            self.eligibility_response.workflow = workflow
            self.eligibility_response.save(update_fields=['workflow'])

        workflow = self.eligibility_response.workflow
        self.create_tasks(workflow=workflow)
        return {
            'workflow_id': workflow.id,
            'response_id': self.eligibility_response_id
        }
