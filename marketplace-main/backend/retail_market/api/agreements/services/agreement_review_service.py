import logging

from api.agreements.models import ApplicantAgreementDocument
from api.agreements.selectors.application_agreements import all_agreements_signed
from api.agreements.services.investor_email import InvestorEmailService
from api.companies.models import CompanyUser
from api.funds.models import Fund
from api.libs.review_service.base_review_service import BaseReviewService
from api.users.constants import AGREEMENT_REVIEWER
from api.users.models import RetailUser
from api.workflows.models import WorkFlow

logger = logging.getLogger(__name__)


class AgreementReviewService(BaseReviewService):
    def __init__(self, fund: Fund, user: RetailUser):
        self.company = fund.company
        self.user = user
        self.fund = fund
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
            module=WorkFlow.WorkFlowModuleChoices.AGREEMENTS.value,
        ).first()

    def start_review(self):
        workflow = self.get_workflow()
        if not workflow:
            return
        self.complete_user_task(workflow=workflow)
        self.create_task(group_name=AGREEMENT_REVIEWER, workflow=workflow, company=self.company, reopen_existing=True)
        return {
            'workflow_id': workflow.id,
        }


class AgreementReview:
    def __init__(self, application):
        self.application = application

    @staticmethod
    def get_company_user(application):
        return CompanyUser.objects.get(
            company=application.company,
            user=application.user
        )

    def all_documents_signed(self):
        return all_agreements_signed(application=self.application)

    def send_signing_completion_email(self):
        all_documents_signed = self.all_documents_signed()
        if all_documents_signed:
            InvestorEmailService().send_email(application_id=self.application.id)
            logger.info("All documents signed, triggered review")

    def process(self):
        all_documents_signed = self.all_documents_signed()
        if all_documents_signed is True:
            AgreementReviewService(fund=self.application.fund, user=self.application.user).start_review()
            logger.info("All documents signed, triggered review")
