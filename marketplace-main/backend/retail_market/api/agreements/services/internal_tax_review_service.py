from api.agreements.selectors.application_agreements import all_agreements_signed
from api.applications.models import Application
from api.libs.review_service.base_review_service import BaseReviewService
from api.users.constants import INTERNAL_TAX_REVIEWER
from api.workflows.services.user_on_boarding_workflow import UserOnBoardingWorkFlowService


class InternalTaxReviewService(BaseReviewService):
    def __init__(self, application: Application):
        self.application = application

    def start_review(self):
        application = self.application
        if not all_agreements_signed(application=application):
            return

        workflow = UserOnBoardingWorkFlowService(
            fund=application.fund,
            company_user=application.get_company_user(),
            transferred_application_id=application.id if application.is_transferred else None
        ).get_or_create_internal_tax_review_workflow(
            parent_workflow=application.workflow
        )

        self.create_task(
            group_name=INTERNAL_TAX_REVIEWER,
            workflow=workflow,
            company=application.company,
            reopen_existing=True
        )
