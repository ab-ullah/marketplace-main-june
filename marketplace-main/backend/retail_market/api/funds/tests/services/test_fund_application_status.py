from api.agreements.models import ApplicantAgreementDocument
from api.applications.tests.factories import ApplicationFactory
from api.documents.tests.factories import FundDocumentFactory
from api.funds.constants import TASK_STATUSES
from api.funds.services.fund_application_statuses import \
    FundApplicationsStatusService
from api.partners.tests.factories import WorkFlowFactory
from api.tax_records.tests.factories import TaxRecordFactory
from api.workflows.models import Task, WorkFlow
from api.workflows.tests.factories import CompanyUserTaskFactory
from core.base_tests import BaseTestCase


class LegalDocsStatusTestCase(BaseTestCase):
    def setUp(self):
        self.create_user()
        self.create_fund(company=self.company)
        self.create_eligibility_criteria_for_fund()
        self.create_card_workflow(company=self.company)
        self.client.force_authenticate(self.user)

    def setup_application(self):
        application = ApplicationFactory(
            fund=self.fund,
            company=self.company,
            user=self.user,
            tax_record=TaxRecordFactory(
                user=self.user,
                company=self.company,
            )
        )
        parent_workflow = WorkFlowFactory(
            fund=self.fund,
            company=self.company,
            module=WorkFlow.WorkFlowModuleChoices.USER_ON_BOARDING.value,
            workflow_type=WorkFlow.WorkFlowTypeChoices.USER_RESPONSE.value,
        )
        application.workflow = parent_workflow
        application.save()

        application.eligibility_response = self.create_eligibility_criteria_user_response(
            company_user=self.company_user
        )
        application.save()

        aml_kyc_workflow = WorkFlowFactory(
            company=self.company,
            parent=parent_workflow,
            module=WorkFlow.WorkFlowModuleChoices.AML_KYC.value,
            fund=self.fund,
            workflow_type=WorkFlow.WorkFlowTypeChoices.USER_RESPONSE.value,
        )
        aml_kyc_task = CompanyUserTaskFactory(
            workflow=aml_kyc_workflow,
            task_type=Task.TaskTypeChoice.REVIEW_REQUEST.value
        )

        eligibility_workflow = WorkFlowFactory(
            company=self.company,
            parent=parent_workflow,
            module=WorkFlow.WorkFlowModuleChoices.ELIGIBILITY.value,
            fund=self.fund,
            workflow_type=WorkFlow.WorkFlowTypeChoices.USER_RESPONSE.value,
        )
        eligibility_task = CompanyUserTaskFactory(
            workflow=eligibility_workflow,
            task_type=Task.TaskTypeChoice.REVIEW_REQUEST.value
        )

        tax_workflow = WorkFlowFactory(
            company=self.company,
            parent=parent_workflow,
            module=WorkFlow.WorkFlowModuleChoices.TAX_RECORD.value,
            fund=self.fund,
            workflow_type=WorkFlow.WorkFlowTypeChoices.USER_RESPONSE.value,
        )
        tax_task = CompanyUserTaskFactory(
            workflow=tax_workflow,
            task_type=Task.TaskTypeChoice.REVIEW_REQUEST.value
        )

        agreement_workflow = WorkFlowFactory(
            company=self.company,
            parent=parent_workflow,
            module=WorkFlow.WorkFlowModuleChoices.AGREEMENTS.value,
            fund=self.fund,
            workflow_type=WorkFlow.WorkFlowTypeChoices.USER_RESPONSE.value,
        )
        agreement_task = CompanyUserTaskFactory(
            workflow=agreement_workflow,
            task_type=Task.TaskTypeChoice.REVIEW_REQUEST.value
        )

        return application, parent_workflow

    def test_get_legal_docs_status_approved_rejected_changes_requested(self):
        application, parent_workflow = self.setup_application()

        self.assertEqual(WorkFlow.objects.filter(
            parent=parent_workflow,
            module=WorkFlow.WorkFlowModuleChoices.AGREEMENTS.value).count(), 1)

        agreement_workflow = WorkFlow.objects.filter(
            parent=parent_workflow,
            module=WorkFlow.WorkFlowModuleChoices.AGREEMENTS.value).first()

        self.assertEqual(agreement_workflow.workflow_tasks.count(), 1)
        agreement_task = agreement_workflow.workflow_tasks.first()

        statuses = [(Task.StatusChoice.REJECTED.value, 'Rejected'),
                    (Task.StatusChoice.CHANGES_REQUESTED.value, 'Changes Requested'),
                    (Task.StatusChoice.APPROVED.value, 'Approved')]

        for task_status in statuses:
            agreement_task.status = task_status[0]
            agreement_task.save()
            result = FundApplicationsStatusService(fund=self.fund, application=application).process()

            self.assertEqual(result[application.id]['legalDocs'], task_status[1])

    def test_get_legal_docs_status_pending_gp(self):
        fund_document = FundDocumentFactory(
            fund=self.fund,
            require_signature=True,
            require_gp_signature=True
        )
        application, parent_workflow = self.setup_application()
        applicant_agreement_document = ApplicantAgreementDocument.objects.create(
            agreement_document=fund_document, application=application)

        self.assertEqual(WorkFlow.objects.filter(
            parent=parent_workflow,
            module=WorkFlow.WorkFlowModuleChoices.AGREEMENTS.value).count(), 1)

        agreement_workflow = WorkFlow.objects.filter(
            parent=parent_workflow,
            module=WorkFlow.WorkFlowModuleChoices.AGREEMENTS.value).first()
        self.assertEqual(agreement_workflow.workflow_tasks.count(), 1)

        agreement_task = agreement_workflow.workflow_tasks.first()
        agreement_task.status = Task.StatusChoice.APPROVED.value
        agreement_task.save()

        result = FundApplicationsStatusService(fund=self.fund, application=application).process()
        self.assertEqual(result[application.id]['legalDocs'], 'Pending GP')

        applicant_agreement_document.gp_signing_complete = True
        applicant_agreement_document.save()

        result = FundApplicationsStatusService(fund=self.fund, application=application).process()
        self.assertEqual(result[application.id]['legalDocs'], 'GP Signed')

    def test_tax_workflow_without_tax_record(self):
        application, parent_workflow = self.setup_application()

        result = FundApplicationsStatusService(fund=self.fund, application=application).process()
        self.assertEqual(result[application.id]['taxReview'], TASK_STATUSES[Task.StatusChoice.PENDING.value])

        application.tax_record = None
        application.save()

        result = FundApplicationsStatusService(fund=self.fund, application=application).process()
        self.assertNotIn('taxReview', result[application.id])
