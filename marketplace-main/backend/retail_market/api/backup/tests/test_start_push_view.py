import http
from unittest import mock
from unittest.mock import MagicMock

from django.urls import reverse

from api.admin_users.services.admin_user_service import CreateAdminUserService
from api.applications.tests.factories import FundFactory
from api.backup.admin_views.urls import START_PUSH_TO_BOOKS_VIEW
from api.constants.feature_flags import CAN_PUSH_RECORDS_TO_BOOKS
from api.feature_flags.tests.test_full_flow import FeatureFlagManipulationMixin
from api.partners.tests.factories import CompanyFactory, UserFactory
from core.base_tests import BaseTestCase


class StartTestCase(BaseTestCase, FeatureFlagManipulationMixin):

    def setUp(self):
        self.company = CompanyFactory.create()
        self.example_fund = FundFactory.create(company=self.company)
        self.user = UserFactory()
        self.company = CompanyFactory.create()
        CreateAdminUserService(email=self.user.email, company_name=self.company.name).create()
        self.client.force_authenticate(self.user)

    @mock.patch('api.backup.services.dynamo_crm.dynamo_client.DynamoClient')
    @mock.patch('api.backup.services.dynamo_crm.dynamo_client.DynamoClient.sync')
    @mock.patch('api.libs.sendgrid.email.SendEmailService.send_email_with_attachment')
    def test_sync_starts(self, send_email_mock, sync_method, dynamo_client):
        result = MagicMock()
        result.log_short_output.return_value = ''
        sync_method.return_value = result

        company_id = self.company.id
        feature = CAN_PUSH_RECORDS_TO_BOOKS
        self.call_activate_command(feature, company_id)
        url = reverse(START_PUSH_TO_BOOKS_VIEW)
        res = self.client.post(url, data={"fund_id": self.example_fund.id})
        self.assertEqual(res.status_code, http.HTTPStatus.OK)

        self.call_deactivate_command(feature, company_id)
        res = self.client.post(url, data={"fund_id": self.example_fund.id})
        self.assertEqual(res.status_code, http.HTTPStatus.PRECONDITION_FAILED)
        self.assertTrue(sync_method.called)
        self.assertTrue(send_email_mock.called)
