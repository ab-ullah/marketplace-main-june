import csv
import http
import uuid

from django.core.files.uploadedfile import SimpleUploadedFile
from django.urls import reverse

from api.applications.admin_views.urls import ADMIN_INVESTOR_ACCOUNT_CODE_BULK_UPDATE
from api.applications.models import Application
from api.applications.tests.factories import ApplicationFactory
from api.documents.models import InvestorAccountCodeBulkUpdateDocument
from api.partners.tests.factories import WorkFlowFactory, CompanyProfileFactory, UserFactory, InvestorFactory
from api.workflows.models import WorkFlow
from core.base_tests import BaseTestCase


class TestBulkUpdateInvestorAccountCodes(BaseTestCase):
    def setUp(self) -> None:
        self.create_user()
        self.create_fund(company=self.company)
        self.create_eligibility_criteria_for_fund()
        self.create_card_workflow(company=self.company)
        self.client.force_authenticate(self.admin_user.user)
        CompanyProfileFactory(company=self.company)

    def test_application_bulk_status_update(self):
        applications = []
        for i in range(10):
            user = UserFactory()
            parent_workflow = WorkFlowFactory(
                fund=self.fund,
                company=self.company,
                module=WorkFlow.WorkFlowModuleChoices.USER_ON_BOARDING.value,
                workflow_type=WorkFlow.WorkFlowTypeChoices.USER_RESPONSE.value,
            )
            applications.append(ApplicationFactory(
                fund=self.fund,
                company=self.company,
                user=user,
                workflow=parent_workflow
            ))

        new_investor_account_codes = {}
        with open('bulk_update_investor_account_codes.csv', 'w', newline='') as csvfile:
            fieldnames = ['Application UUID', 'Investor Account Code']
            writer = csv.DictWriter(csvfile, fieldnames=fieldnames)

            writer.writeheader()
            for application in applications:
                new_investor_account_codes[application.uuid] = uuid.uuid4().hex
                writer.writerow({
                    'Application UUID': application.uuid,
                    'Investor Account Code': new_investor_account_codes[application.uuid]
                })

        for i, e in enumerate(applications):
            e.investor = InvestorFactory()
            e.save()

        url = reverse(ADMIN_INVESTOR_ACCOUNT_CODE_BULK_UPDATE, kwargs={'fund_external_id': self.fund.external_id})
        with open('bulk_update_investor_account_codes.csv') as _file:
            file = SimpleUploadedFile.from_dict({
                "filename": _file.name,
                "content": _file.read().encode('utf-8'),
                "content-type": "text/csv"
            })

        payload = {
            "bulk_update_file": file,
        }
        response = self.client.patch(
            url, data=payload,
            format="multipart"
        )
        self.assertEqual(http.HTTPStatus.OK, response.status_code)
        data = response.json()
        self.assertEqual(data['successes'], 10)
        self.assertEqual(len(data['errors']), 0)
        applications = Application.objects.filter(company=self.company, uuid__in=new_investor_account_codes.keys()).select_related('investor')
        for application in applications.all():
            self.assertEqual(application.investor.investor_account_code, new_investor_account_codes[application.uuid])
        self.assertEqual(InvestorAccountCodeBulkUpdateDocument.objects.count(), 1)
