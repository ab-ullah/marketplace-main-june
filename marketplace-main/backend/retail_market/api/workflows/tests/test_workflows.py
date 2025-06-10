from django.urls import reverse
from rest_framework import status

from api.admin_users.tests.factories import AdminUserFactory
from api.partners.tests.factories import WorkFlowFactory

from core.base_tests import BaseTestCase


class WorkflowTestCase(BaseTestCase):

    def setUp(self):
        self.create_company()
        self.create_user()
        self.admin_user = AdminUserFactory(user=self.user, company=self.company)
        self.workflow = WorkFlowFactory(company=self.company, created_by=self.admin_user)
        self.nested_workflow_1 = WorkFlowFactory(company=self.company, parent=self.workflow, is_completed=True, created_by=self.admin_user)
        self.nested_workflow_2 = WorkFlowFactory(company=self.company, parent=self.workflow, step=1, created_by=self.admin_user)

    def test_get_current_workflow_unauthenticated(self):
        url = reverse('workflow-current-step', kwargs={'parent_workflow_id': self.workflow.id})
        response = self.client.get(
            url,
            **self.get_headers()
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_get_current_workflow_authenticated(self):
        self.client.force_authenticate(self.user)
        url = reverse('workflow-current-step', kwargs={'parent_workflow_id': self.workflow.id})
        response = self.client.get(
            url,
            **self.get_headers()
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(self.nested_workflow_2.id, response.data['id'])

        self.assertFalse(self.workflow.is_completed)
        # self.assert_workflow_completion_by_child_update()
        # self.assert_workflow_completion_by_parent_itself()

    def assert_workflow_completion_by_child_update(self):
        self.nested_workflow_2.is_completed = True
        self.nested_workflow_2.save()
        self.assertTrue(self.workflow.is_completed)

    def assert_workflow_completion_by_parent_itself(self):
        self.workflow.name = 'test-updated-name'
        self.workflow.save()
        self.assertFalse(self.workflow.is_completed)

        self.nested_workflow_2.is_completed = True
        self.nested_workflow_2.save()

        self.assertTrue(self.workflow.is_completed)