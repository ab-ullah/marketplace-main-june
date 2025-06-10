import uuid

from api.admin_users.tests.factories import AdminUserFactory
from api.agreements.models import ApplicantAgreementDocument
from api.applications.tests.factories import ApplicationFactory
from api.documents.models import FundDocument
from api.documents.tests.factories import DocumentFactory
from api.partners.tests.factories import WorkFlowFactory
from api.workflows.services.user_on_boarding_workflow import UserOnBoardingWorkFlowService
from core.base_tests import BaseTestCase


class TestGpSignedComplete(BaseTestCase):
    def setUp(self) -> None:
        self.create_company()
        self.create_user()
        self.setup_fund(company=self.company)
        self.admin_user = AdminUserFactory(company=self.company, user=self.user)
        self.workflow = WorkFlowFactory(company=self.company)
        self.application = self.get_application()

    def get_application(self):
        return ApplicationFactory(company=self.company, user=self.user, fund=self.fund)

    def setup_agreements_workflow(self):
        on_boarding_workflow_service = UserOnBoardingWorkFlowService(
            fund=self.fund,
            company_user=self.application.get_company_user()
        )
        agreements_workflow = on_boarding_workflow_service.get_or_create_agreement_workflow()
        return agreements_workflow

    def create_fund_document(self, require_gp_sign=False, signer=None):
        document = DocumentFactory(
            document_path=self.create_document_path(),
            company=self.company
        )
        fund_document = FundDocument.objects.create(
            document=document,
            fund=self.fund,
            require_signature=True,
            require_gp_signature=require_gp_sign,
            gp_signer=signer
        )
        return fund_document

    def create_applicant_document(self, fund_document):
        return ApplicantAgreementDocument.objects.create(
            agreement_document=fund_document,
            application=self.application,
            envelope_id=uuid.uuid4().hex
        )

    def test_gp_signing_complete_with_no_gp_sign(self):
        admin_user = self.admin_user

        application = self.application
        agreements_workflow = self.setup_agreements_workflow()
        application.workflow = agreements_workflow.parent
        application.save()

        fund_document_1 = self.create_fund_document(require_gp_sign=False)
        # fund_document_2 = self.create_fund_document(require_gp_sign=True, signer=admin_user)
        fund_document_2 = self.create_fund_document(require_gp_sign=False)

        self.assertFalse(self.application.is_gp_signed())

        applicant_document_1 = self.create_applicant_document(fund_document=fund_document_1)
        applicant_document_1.completed = True
        applicant_document_1.save()

        applicant_document_2 = self.create_applicant_document(fund_document=fund_document_2)
        applicant_document_2.completed = True
        applicant_document_2.save()

        self.assertFalse(self.application.is_gp_signed())

        agreements_workflow.is_completed = True
        agreements_workflow.save()

        self.assertTrue(self.application.is_gp_signed())

    def test_gp_signing_complete_with_gp_sign(self):
        admin_user = self.admin_user

        application = self.application
        agreements_workflow = self.setup_agreements_workflow()
        application.workflow = agreements_workflow.parent
        application.save()

        fund_document_1 = self.create_fund_document(require_gp_sign=False)
        fund_document_2 = self.create_fund_document(require_gp_sign=True, signer=admin_user)
        fund_document_3 = self.create_fund_document(require_gp_sign=True, signer=admin_user)

        self.assertFalse(self.application.is_gp_signed())

        applicant_document_1 = self.create_applicant_document(fund_document=fund_document_1)
        applicant_document_1.completed = True
        applicant_document_1.save()

        applicant_document_2 = self.create_applicant_document(fund_document=fund_document_2)
        applicant_document_2.completed = True
        applicant_document_2.save()

        applicant_document_3 = self.create_applicant_document(fund_document=fund_document_3)
        applicant_document_3.completed = True
        applicant_document_3.save()

        self.assertFalse(self.application.is_gp_signed())

        agreements_workflow.is_completed = True
        agreements_workflow.save()

        self.assertFalse(self.application.is_gp_signed())

        applicant_document_2.gp_signing_complete = True
        applicant_document_2.save()

        self.assertFalse(self.application.is_gp_signed())

        applicant_document_2.gp_signing_complete = True
        applicant_document_2.save()

        self.assertFalse(self.application.is_gp_signed())

        applicant_document_3.gp_signing_complete = True
        applicant_document_3.save()

        self.assertTrue(self.application.is_gp_signed())
