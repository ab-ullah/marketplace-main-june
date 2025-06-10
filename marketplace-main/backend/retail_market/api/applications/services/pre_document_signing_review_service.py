from api.applications.models import Application
from api.libs.review_service.base_review_service import BaseReviewService
from api.users.constants import ALLOCATION_REVIEWER
from api.workflows.services.user_on_boarding_workflow import UserOnBoardingWorkFlowService


class PreDocumentSigningReviewService(BaseReviewService):
    def __init__(self, application: Application):
        self.company = application.fund.company
        self.user = application.user
        self.fund = application.fund
        self.application = application
        self.company_user = self.get_company_user()

    def start_review(self):
        application = self.application

        workflow = UserOnBoardingWorkFlowService(
            fund=application.fund,
            company_user=application.get_company_user(),
            transferred_application_id=application.id if application.is_transferred else None
        ).get_or_create_pre_document_review_workflow(
            parent_workflow=application.workflow
        )
        self.create_task(group_name=ALLOCATION_REVIEWER, workflow=workflow, company=self.company)
