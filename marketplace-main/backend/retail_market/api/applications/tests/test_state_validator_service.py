import uuid

from rest_framework.test import APITestCase

from api.admin_users.services.create_reviewers import CreateReviewerService
from api.applications.models import Application
from api.applications.services.validators.validate_application_state import ApplicationStateValidationService
from api.applications.tests.factories import ApplicationFactory
from api.partners.tests.factories import CompanyFactory, UserFactory, CompanyUserFactory, FundFactory, AdminUserFactory
from api.tax_records.tests.factories import TaxRecordFactory, TaxDocumentFactory
from api.workflows.models import WorkFlow, Task
from api.workflows.services.user_on_boarding_workflow import UserOnBoardingWorkFlowService


class ApplicationStateValidatorTestCase(APITestCase):

    def setUp(self):
        self.company = CompanyFactory()
        self.user = UserFactory()
        self.company_user = CompanyUserFactory(company=self.company, user=self.user)
        self.fund = FundFactory(company=self.company)
        self.admin_user = AdminUserFactory(company=self.company)

    def test_application_with_no_tax_document(self):
        application = ApplicationFactory(
            company=self.company,
            user=self.user,
            fund=self.fund,
            status=Application.Status.APPROVED.value
        )

        application_validator_service = ApplicationStateValidationService(
            application=application
        )
        response = application_validator_service.validate()
        self.assertIn('No Tax Record Found for Application with', response['message'])

    def test_application_with_no_tax_review_task(self):
        application = ApplicationFactory(
            company=self.company,
            user=self.user,
            fund=self.fund,
            status=Application.Status.APPROVED.value
        )
        tax_record = TaxRecordFactory(user=application.user, company=application.company)
        application.tax_record = tax_record
        application.save()

        application_validator_service = ApplicationStateValidationService(
            application=application
        )
        response = application_validator_service.validate()
        self.assertIn('No Tax Form Added in Application with id', response['message'])

    def test_application_with_tax_signed_but_no_task(self):
        CreateReviewerService(
            email=self.admin_user.user.email,
            company_name=self.company.name
        ).create_external_reviewer()
        workflow = UserOnBoardingWorkFlowService(
            fund=self.fund,
            company_user=self.company_user
        ).get_or_create_parent_workflow()

        application = ApplicationFactory(
            company=self.company,
            user=self.user,
            fund=self.fund,
            status=Application.Status.APPROVED.value
        )

        tax_record = TaxRecordFactory(user=application.user, company=application.company)
        application.tax_record = tax_record
        application.save()

        application_validator_service = ApplicationStateValidationService(
            application=application
        )

        TaxDocumentFactory(
            envelope_id=uuid.uuid4().hex,
            tax_record=tax_record,
            owner=self.user,
            completed=True
        )
        response = application_validator_service.validate()
        self.assertIn('Missing Tax Review Task for Application with id', response['message'])

        tax_workflow_exists = workflow.child_workflows.filter(
            module=WorkFlow.WorkFlowModuleChoices.TAX_RECORD.value,
        ).exists()

        self.assertFalse(tax_workflow_exists)

        application_validator_service = ApplicationStateValidationService(
            application=application,
            perform_fix=True
        )
        response = application_validator_service.validate()
        self.assertEqual(
            f'Missing Tax Review Task for Application with id: {application.id}, Task Created',
            response['message']
        )

        tax_workflow = workflow.child_workflows.filter(
            module=WorkFlow.WorkFlowModuleChoices.TAX_RECORD.value,
        ).get()

        task_created = tax_workflow.workflow_tasks.filter(
            task_type=Task.TaskTypeChoice.REVIEW_REQUEST,
            assigned_to__isnull=False
        ).exists()

        self.assertEqual(task_created, True)
