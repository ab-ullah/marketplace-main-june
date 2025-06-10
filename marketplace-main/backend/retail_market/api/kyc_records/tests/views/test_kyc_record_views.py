import json

from django.urls import reverse
from slugify import slugify

from api.cards.default.workflow_types import WorkflowTypes
from api.cards.models import Workflow as CardWorkFlow
from api.kyc_records.tests.factories import KYCRecordFactory, CardWorkFlowFactory
from api.partners.tests.factories import UserFactory
from core.base_tests import BaseTestCase


class KYCRecordAPITestCase(BaseTestCase):
    def setUp(self) -> None:
        self.create_company()
        self.create_user()
        self.client.force_authenticate(self.admin_user.user)
        self.setup_fund(company=self.company)

    def test_kyc_record_update(self):
        user = UserFactory()
        name = "{} {}".format(WorkflowTypes.PRIVATE_COMPANY.value, self.company.name)
        workflow = CardWorkFlowFactory(
            name=name,
            slug=slugify(name),
            company=self.company,
            type=CardWorkFlow.FLOW_TYPES.KYC.value,
        )
        kyc_record = KYCRecordFactory(company=self.company, user=user, workflow=workflow)
        url = reverse('admin-kyc-record-get-update-view', kwargs={
            'wf_slug': kyc_record.workflow.slug,
            'pk': kyc_record.pk
        })
        payload = {'source_of_wealth': 'updated source of wealth'}
        response = self.client.patch(
            url,
            data=json.dumps(payload),
            content_type='application/json',
            **self.get_headers()
        )
        self.assertEqual(response.status_code, 200)
        kyc_record.refresh_from_db()
        self.assertEqual(kyc_record.user_id, user.id)
