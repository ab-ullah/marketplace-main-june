from decimal import Decimal
from django.urls import reverse
from rest_framework import status

from api.admin_users.tests.factories import AdminUserFactory
from api.documents.models import FundDocument
from api.funds.services.fund_application_statuses import NOT_STARTED_LABEL
from api.workflows.models import Task
from api.kyc_records.models import KYCRecord
from api.documents.tests.factories import DocumentFactory
from core.base_tests import BaseTestCase
from api.agreements.services.application_data.get_application_values import GetApplicationValuesService
from api.workflows.services.user_on_boarding_workflow import UserOnBoardingWorkFlowService


class TestApplicationRetrievalAPIView(BaseTestCase):
    def setUp(self) -> None:
        self.create_company()
        self.create_user()
        self.create_card_workflow(company=self.company)
        self.setup_fund(company=self.company)
        self.client.force_authenticate(self.user)
        self.create_currency()
        self.admin_user = AdminUserFactory(company=self.company, user=self.user)

    def setup_application(self, kyc_record=None):
        document = DocumentFactory(
            document_path=self.create_document_path(),
            company=self.company
        )
        self.fund_document = FundDocument.objects.create(
            document=document,
            fund=self.fund
        )
        application = self.create_application(
            fund=self.fund,
            company_user=self.company_user,
            kyc_record=kyc_record
        )
        return application

    def test_application_retrieval(self):
        application = self.setup_application()
        url = reverse('application-retrieve', kwargs={'fund_external_id': self.fund.external_id})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        record = response.data[0]
        self.assertEqual(record['id'], application.id)
        self.assertEqual(len(record['fund_documents']), 1)

    def test_application_status_update(self):
        application = self.setup_application()
        url = reverse('application-base-update', kwargs={'uuid': application.uuid})
        response = self.client.patch(url, data={'status': 5})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        application.refresh_from_db()
        self.assertEqual(application.status, 5)
        self.assertEqual(application.status_updated_by, self.company_user.user)
        self.assertTrue(
            application.history.filter(status_updated_by_id=self.company_user.user_id).exists()
        )

    def test_applicants_list_retrieval(self):
        application = self.setup_application()
        url = reverse('applicant-management-list-view', kwargs={'fund_external_id': self.fund.external_id})
        response = self.client.get(url)
        record = response.data[0]
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(record['id'], application.id)
        self.assertEqual(len(response.data), 1)

    def test_application_statuses_retrieval(self):
        application = self.setup_application()
        workflow = UserOnBoardingWorkFlowService(
            fund=self.fund,
            company_user=self.company_user
        ).get_or_create_parent_workflow()
        application.workflow = workflow
        application.save()

        url = reverse('admin-fund-applicants-status', kwargs={'fund_external_id': self.fund.external_id})
        response = self.client.get(url)
        statuses = response.data[application.id]
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(statuses['application_approval'], NOT_STARTED_LABEL)
        self.assertEqual(statuses['eligibility_decision'], NOT_STARTED_LABEL)

    def test_applications_with_various_networth_values(self):
        application = self.setup_application()
        kyc_record = KYCRecord.objects.get(
            user=self.user,
            company=self.company,
            workflow=self.workflow,
        )
        application.kyc_record = kyc_record
        document = self.fund_document

        net_worth_tests = [
            {"raw": "10 times", "expected": "10 times"},
            {"raw": "1000", "expected": "1,000.00"},
            {"raw": "1000000", "expected": "1,000,000.00"},
            {"raw": "100000000000000000000000000000000000000000000000000000000", "expected": Decimal("100000000000000000000000000000000000000000000000000000000")},
        ]

        for test_case in net_worth_tests:
            application.kyc_record.net_worth = test_case['raw']
            application.kyc_record.save()

            fields = GetApplicationValuesService(application=application, document=document).get()
            aml_kyc_values = fields['aml_kyc_details']

            for value in aml_kyc_values:
                if value['id'] == 'aml-kyc-net_worth':
                    net_worth = value['value']
                    self.assertEqual(net_worth, test_case["expected"])
