from django.contrib.auth.models import Group
from django.urls import reverse
from rest_framework import status

from api.applications.models import Application
from api.applications.tests.factories import ApplicationFactory
from api.partners.tests.factories import WorkFlowFactory, CompanyProfileFactory
from api.users.constants import ALLOCATION_REVIEWER
from api.workflows.models import WorkFlow, Task
from api.workflows.tests.factories import CompanyUserTaskFactory
from core.base_tests import BaseTestCase


class TestBulkUpdateApplicationStatus(BaseTestCase):
    def setUp(self) -> None:
        self.create_user()
        self.create_fund(company=self.company)
        self.create_eligibility_criteria_for_fund()
        self.create_card_workflow(company=self.company)
        self.client.force_authenticate(self.admin_user.user)
        CompanyProfileFactory(company=self.company)

    def test_application_bulk_status_update(self):
        parent_workflow = WorkFlowFactory(
            fund=self.fund,
            company=self.company,
            module=WorkFlow.WorkFlowModuleChoices.USER_ON_BOARDING.value,
            workflow_type=WorkFlow.WorkFlowTypeChoices.USER_RESPONSE.value,
        )
        application = ApplicationFactory(
            fund=self.fund,
            company=self.company,
            user=self.user,
            workflow=parent_workflow
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

        self.assertEqual(application.status, Application.Status.CREATED)
        self.assertEqual(allocation_workflow.is_completed, False)
        self.assertEqual(allocation_task.completed, False)
        self.assertEqual(allocation_task.status, Task.StatusChoice.PENDING.value)

        url = reverse('applications-actions-view')
        payload = {
            'status': Application.Status.APPROVED,
            'withdrawn_comment': 'This is a test comment.',
            'ids': [application.id]
        }
        response = self.client.post(url, payload, format='json')

        application.refresh_from_db()
        allocation_workflow.refresh_from_db()
        allocation_task.refresh_from_db()

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(application.status, Application.Status.APPROVED)
        self.assertEqual(application.withdrawn_comment, 'This is a test comment.')
        self.assertEqual(allocation_workflow.is_completed, True)
        self.assertEqual(allocation_task.completed, True)
        self.assertEqual(allocation_task.status, Task.StatusChoice.APPROVED.value)
        self.assertEqual(application.status_updated_by_id, self.admin_user.user_id)
        self.assertTrue(
            application.history.filter(status_updated_by_id=self.admin_user.user_id).exists()
        )
