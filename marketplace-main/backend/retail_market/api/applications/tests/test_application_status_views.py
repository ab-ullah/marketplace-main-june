from django.contrib.auth.models import Group
from django.urls import reverse
from rest_framework import status

from api.applications.models import Application
from api.applications.tests.factories import ApplicationFactory
from api.constants.kyc_investor_types import KYCInvestorType
from api.kyc_records.tests.factories import KYCRecordFactory
from api.partners.tests.factories import WorkFlowFactory
from api.tax_records.tests.factories import TaxRecordFactory
from api.users.constants import FINANCIAL_ELIGIBILITY_REVIEWER, EXTERNAL_REVIEWER, AGREEMENT_REVIEWER, \
    ALLOCATION_REVIEWER
from api.workflows.models import WorkFlow, Task
from api.workflows.tests.factories import CompanyUserTaskFactory
from core.base_tests import BaseTestCase


class TestApplicationStatusAPIView(BaseTestCase):
    def setUp(self) -> None:
        self.create_user()
        self.create_fund(company=self.company)
        self.create_eligibility_criteria_for_fund()
        self.create_card_workflow(company=self.company)
        self.client.force_authenticate(self.user)

    def test_application_status_retrieval(self):
        application = ApplicationFactory(
            fund=self.fund,
            company=self.company,
            user=self.user,
            kyc_record=KYCRecordFactory(
                user=self.user,
                company=self.company,
                company_user=self.company_user,
                kyc_investor_type=KYCInvestorType.INDIVIDUAL.value,
            ),
            tax_record=TaxRecordFactory(
                user=self.user,
                company=self.company,
            ),
            eligibility_response=self.create_eligibility_criteria_user_response(company_user=self.company_user),
        )
        parent_workflow = WorkFlowFactory(company=self.company)
        application.workflow = parent_workflow
        application.save()

        aml_kyc_workflow_actual = WorkFlowFactory(
            company=self.company,
            parent=parent_workflow,
            module=WorkFlow.WorkFlowModuleChoices.AML_KYC.value,
            sub_module=str(application.kyc_record.kyc_investor_type)
        )

        aml_kyc_workflow_new = WorkFlowFactory(
            company=self.company,
            parent=parent_workflow,
            module=WorkFlow.WorkFlowModuleChoices.AML_KYC.value,
            sub_module=str(KYCInvestorType.LIMITED_PARTNERSHIP.value)
        )

        tax_workflow = WorkFlowFactory(
            company=self.company,
            parent=parent_workflow,
            module=WorkFlow.WorkFlowModuleChoices.TAX_RECORD.value
        )

        url = reverse('application-workflow-status', kwargs={'fund_external_id': self.fund.external_id})

        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        record = response.data
        self.assertFalse(record['is_allocation_approved'])
        self.assertFalse(record['is_aml_kyc_approved'])
        self.assertFalse(record['is_tax_info_submitted'])
        self.assertFalse(record['is_application_approved'])

        application.eligibility_response.is_approved = True
        application.eligibility_response.save()

        aml_kyc_workflow_actual.is_completed = True
        aml_kyc_workflow_actual.save()

        tax_workflow.is_completed = True
        tax_workflow.save()

        application.status = Application.Status.APPROVED.value
        application.save()

        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        record = response.data
        self.assertTrue(record['is_allocation_approved'])
        self.assertTrue(record['is_aml_kyc_approved'])
        self.assertTrue(record['is_tax_info_submitted'])
        self.assertTrue(record['is_application_approved'])

    def test_application_module_state_retrieval_api(self):
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

        url = reverse('application-module-states', kwargs={'fund_external_id': self.fund.external_id})

        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        record = response.data
        self.assertEqual(record, {'application_approval': 'Not Started', 'eligibility_decision': 'Not Started'})

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
        aml_kyc_group = Group.objects.filter(name=FINANCIAL_ELIGIBILITY_REVIEWER).first()
        aml_kyc_task = CompanyUserTaskFactory(
            workflow=aml_kyc_workflow,
            assigned_to_group=aml_kyc_group,
            task_type=Task.TaskTypeChoice.REVIEW_REQUEST.value
        )

        eligibility_workflow = WorkFlowFactory(
            company=self.company,
            parent=parent_workflow,
            module=WorkFlow.WorkFlowModuleChoices.ELIGIBILITY.value,
            fund=self.fund,
            workflow_type=WorkFlow.WorkFlowTypeChoices.USER_RESPONSE.value,
        )

        aml_kyc_group = Group.objects.filter(name=FINANCIAL_ELIGIBILITY_REVIEWER).first()
        eligibility_task = CompanyUserTaskFactory(
            workflow=eligibility_workflow,
            assigned_to_group=aml_kyc_group,
            task_type=Task.TaskTypeChoice.REVIEW_REQUEST.value
        )

        tax_workflow = WorkFlowFactory(
            company=self.company,
            parent=parent_workflow,
            module=WorkFlow.WorkFlowModuleChoices.TAX_RECORD.value,
            fund=self.fund,
            workflow_type=WorkFlow.WorkFlowTypeChoices.USER_RESPONSE.value,
        )
        tax_record_group = Group.objects.filter(name=EXTERNAL_REVIEWER).first()
        tax_task = CompanyUserTaskFactory(
            workflow=tax_workflow,
            assigned_to_group=tax_record_group,
            task_type=Task.TaskTypeChoice.REVIEW_REQUEST.value
        )

        agreement_workflow = WorkFlowFactory(
            company=self.company,
            parent=parent_workflow,
            module=WorkFlow.WorkFlowModuleChoices.AGREEMENTS.value,
            fund=self.fund,
            workflow_type=WorkFlow.WorkFlowTypeChoices.USER_RESPONSE.value,
        )
        agreements_group = Group.objects.filter(name=AGREEMENT_REVIEWER).first()
        agreement_task = CompanyUserTaskFactory(
            workflow=agreement_workflow,
            assigned_to_group=agreements_group,
            task_type=Task.TaskTypeChoice.REVIEW_REQUEST.value
        )

        allocation_parent_workflow = WorkFlowFactory(
            company=self.company,
            fund=self.fund,
            module=WorkFlow.WorkFlowModuleChoices.ALLOCATION.value,
            workflow_type=WorkFlow.WorkFlowTypeChoices.APPLICATION_ALLOCATION.value,
        )

        allocation_workflow = WorkFlowFactory(
            company=self.company,
            parent=allocation_parent_workflow,
            fund=self.fund,
            module=WorkFlow.WorkFlowModuleChoices.ALLOCATION.value,
            workflow_type=WorkFlow.WorkFlowTypeChoices.APPLICATION_ALLOCATION.value,
        )
        allocation_group = Group.objects.filter(name=ALLOCATION_REVIEWER).first()
        allocation_task = CompanyUserTaskFactory(
            workflow=allocation_workflow,
            assigned_to_group=allocation_group,
            task_type=Task.TaskTypeChoice.REVIEW_REQUEST.value
        )

        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        record = response.data
        self.assertEqual(record['eligibility_decision'], 'Pending')
        self.assertEqual(record['kyc_aml'], 'Pending')
        self.assertEqual(record['taxReview'], 'Pending')
        self.assertEqual(record['legalDocs'], 'Pending')
        self.assertEqual(record['application_approval'], 'Pending')

        application.eligibility_response.is_approved = True
        application.eligibility_response.save()

        aml_kyc_workflow.is_completed = True
        aml_kyc_workflow.save()

        tax_workflow.is_completed = True
        tax_workflow.save()

        agreement_workflow.is_completed = True
        agreement_workflow.save()

        application.status = Application.Status.APPROVED.value
        application.save()

        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        record = response.data
        self.assertEqual(record['eligibility_decision'], 'Approved')
        self.assertEqual(record['kyc_aml'], 'Approved')
        self.assertEqual(record['taxReview'], 'Approved')
        self.assertEqual(record['legalDocs'], 'Approved')
        self.assertEqual(record['application_approval'], 'Approved')
