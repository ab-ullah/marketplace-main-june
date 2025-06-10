from unittest import mock

from django.contrib.auth.models import AnonymousUser
from django.test import TestCase
from channels.testing import WebsocketCommunicator

from api.admin_users.services.admin_user_service import CreateAdminUserService
from api.partners.tests.factories import UserFactory, CompanyFactory, WorkFlowFactory
from api.workflows.models import Task, Comment
from config.asgi import application


class UserTaskCountTests(TestCase):
    def setUp(self) -> None:
        self.user = UserFactory()
        self.company = CompanyFactory()
        self.admin_user = CreateAdminUserService(email=self.user.email, company_name=self.company.name).create()
        self.workflow = WorkFlowFactory(company=self.company)

    @mock.patch('api.libs.middlewares.websock_auth_middleware.get_user')
    async def test_workflow_comments_unauthorized(self, _get_user):

        async def mock_get_user(_self):
            return AnonymousUser()

        _get_user.side_effect = mock_get_user

        communicator = WebsocketCommunicator(
            application=application, path=f"/ws/workflows/{self.workflow.id}/comments?token=test"
        )
        connected, _ = await communicator.connect()
        self.assertFalse(connected)

    @staticmethod
    def create_comment(workflow_id, user_id):
        Comment.objects.create(
            workflow_id=workflow_id,
            created_by_id=user_id,
            text='test comment'
        )


    @mock.patch('api.libs.middlewares.websock_auth_middleware.get_user')
    async def test_workflow_comments_success(self, _get_user):
        user = self.user

        async def mock_get_user(_self):
            return user

        _get_user.side_effect = mock_get_user

        communicator = WebsocketCommunicator(
            application=application, path=f"/ws/workflows/{self.workflow.id}/comments?token=test"
        )

        connected, _ = await communicator.connect()
        self.assertTrue(connected)

        response = await communicator.receive_json_from()
        self.assertFalse(bool(response))

