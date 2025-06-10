import uuid
from unittest import mock

from api.agreements.models import ApplicantAgreementDocument
from api.applications.tests.factories import ApplicationFactory
from api.workflows.serializers import TaskSerializer
from core.base_tests import BaseTestCase

from api.admin_users.tests.factories import AdminUserFactory
from api.documents.tests.factories import DocumentFactory
from api.partners.tests.factories import WorkFlowFactory
from api.workflows.models import Task
from api.documents.models import FundDocument
from api.workflows.services.user_on_boarding_workflow import UserOnBoardingWorkFlowService
from api.funds.services.gp_signing_service import GPSigningService


class TestGpSigningTasks(BaseTestCase):
    def setUp(self) -> None:
        self.create_company()
        self.create_user()
        self.setup_fund(company=self.company)
        self.admin_user = AdminUserFactory(company=self.company, user=self.user)
        self.workflow = WorkFlowFactory(company=self.company)
        self.application = self.get_application()

    def get_application(self):
        return ApplicationFactory(company=self.company, user=self.user, fund=self.fund)

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

    def setup_gp_workflow(self):
        on_boarding_workflow_service = UserOnBoardingWorkFlowService(
            fund=self.fund,
            company_user=None
        )
        gp_signing_workflow = on_boarding_workflow_service.get_or_create_gp_signing_workflow(self.workflow)
        GPSigningService(self.fund, gp_signing_workflow, self.application).start_review()
        return gp_signing_workflow

    def create_applicant_document(self, fund_document):
        ApplicantAgreementDocument.objects.create(
            agreement_document=fund_document,
            application=self.application,
            envelope_id=uuid.uuid4().hex
        )

    @mock.patch('api.funds.services.gp_signing_service.send_socket_notification')
    def test_gp_signer_task(self, mock_send_socket_notification):
        fund_document = self.create_fund_document(require_gp_sign=True, signer=self.admin_user)
        self.create_applicant_document(fund_document=fund_document)
        gp_signing_workflow = self.setup_gp_workflow()

        tasks = Task.objects.filter(
            workflow_id=gp_signing_workflow.id
        )

        self.assertEqual(len(tasks), 1)
        task = tasks.first()
        self.assertEqual(task.assigned_to, fund_document.gp_signer)

        expected_user = task.assigned_to.user
        expected_data = TaskSerializer(task, context={"admin_user": task.assigned_to}).data

        self.assertEqual(mock_send_socket_notification.call_count, 1)
        mock_send_socket_notification.assert_called_once_with(expected_user, {'count': 1, "task": expected_data})

    def test_multiple_gp_signing_tasks(self):
        admin_user_A = self.admin_user
        admin_user_B = AdminUserFactory(company=self.company)

        fund_document_A = self.create_fund_document(require_gp_sign=True, signer=admin_user_A)
        fund_document_B = self.create_fund_document(require_gp_sign=True, signer=admin_user_B)

        self.create_applicant_document(fund_document=fund_document_A)
        self.create_applicant_document(fund_document=fund_document_B)

        gp_signing_workflow = self.setup_gp_workflow()

        admin_user_A_tasks = Task.objects.filter(
            workflow_id=gp_signing_workflow.id,
            assigned_to=admin_user_A
        )

        admin_user_B_tasks = Task.objects.filter(
            workflow_id=gp_signing_workflow.id,
            assigned_to=admin_user_B
        )

        self.assertEqual(len(admin_user_A_tasks), 1)
        self.assertEqual(admin_user_A_tasks[0].assigned_to, fund_document_A.gp_signer)
        self.assertEqual(len(admin_user_B_tasks), 1)
        self.assertEqual(admin_user_B_tasks[0].assigned_to, fund_document_B.gp_signer)

    def test_gp_signing_task_when_no_fund_document(self):
        self.create_fund_document()
        gp_signing_workflow = self.setup_gp_workflow()

        tasks = Task.objects.filter(
            workflow_id=gp_signing_workflow.id
        )

        self.assertEqual(len(tasks), 0)
