import os
from datetime import timedelta

from django.contrib.auth.models import Group
from django.core.files.uploadedfile import SimpleUploadedFile
from django.urls import reverse
from django.utils import timezone
from rest_framework import status

from api.capital_calls.models import FundCapitalCall
from api.capital_calls.tests.factories import (CapitalCallDetailFactory,
                                               FundCapitalCallFactory)
from api.partners.tests.factories import (AdminUserFactory, CompanyFactory,
                                          CompanyUserFactory)
from api.users.constants import CAPITAL_CALL_REVIEWER
from core.base_tests import BaseTestCase


class TestCapitalCallAdminViews(BaseTestCase):

    def setUp(self):
        self.create_user()
        self.create_fund(self.company)

        self.other_company = CompanyFactory()
        self.other_admin_user = AdminUserFactory(company=self.other_company)

        capital_call_group = Group.objects.get(name=CAPITAL_CALL_REVIEWER)
        self.other_admin_user.groups.add(capital_call_group)
        self.admin_user.groups.add(capital_call_group)

    def test_capital_call_list_view(self):
        capital_call_1 = FundCapitalCallFactory(fund=self.fund, company=self.company)
        capital_call_detail_1 = CapitalCallDetailFactory(capital_call=capital_call_1)
        capital_call_detail_2 = CapitalCallDetailFactory(capital_call=capital_call_1)

        capital_call_2 = FundCapitalCallFactory(fund=self.fund, company=self.company)
        capital_call_detail_3 = CapitalCallDetailFactory(capital_call=capital_call_2)
        capital_call_detail_4 = CapitalCallDetailFactory(capital_call=capital_call_2)

        self.client.force_authenticate(self.admin_user.user)
        url = reverse('admin-capital-call-list', kwargs={'fund_external_id': self.fund.external_id})
        response = self.client.get(url, **self.get_headers(), format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        capital_calls = response.data
        self.assertEqual(len(capital_calls), 2)
        self.assertEqual(
            capital_calls[1]['total_capital_called'],
            capital_call_detail_1.amount + capital_call_detail_2.amount
        )
        self.assertEqual(
            capital_calls[0]['total_capital_called'],
            capital_call_detail_3.amount + capital_call_detail_4.amount
        )

    def test_capital_call_detail_list_view(self):
        capital_call = FundCapitalCallFactory(fund=self.fund, company=self.company)
        CapitalCallDetailFactory(capital_call=capital_call)
        CapitalCallDetailFactory(capital_call=capital_call)
        CapitalCallDetailFactory(capital_call=capital_call)

        self.client.force_authenticate(self.admin_user.user)
        url = reverse(
            'admin-capital-call-detail-list',
            kwargs={'fund_external_id': self.fund.external_id, 'pk': capital_call.id}
        )
        response = self.client.get(url, **self.get_headers())
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 3)

    @staticmethod
    def get_invites_csv(name):
        with open(os.path.join(os.path.dirname(__file__), f'data/{name}.csv')) as _file:
            return SimpleUploadedFile.from_dict({
                "filename": _file.name,
                "content": _file.read().encode('utf-8'),
                "content-type": "text/csv"
            })

    def test_capital_call_create_view(self):
        CompanyUserFactory(user__email='joesmith@example.com', company=self.company)
        CompanyUserFactory(user__email='joesmith2@example.com', company=self.company)

        self.assertEqual(FundCapitalCall.objects.count(), 0)
        self.client.force_authenticate(self.admin_user.user)
        url = reverse(
            'admin-capital-call-list-create',
            kwargs={'fund_external_id': self.fund.external_id}
        )

        payload = {
            'document_file': self.get_invites_csv('capital_calls'),
            'due_date': (timezone.now() + timedelta(days=7)).strftime('%m/%d/%Y')
        }
        response = self.client.post(url, data=payload, format="multipart")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(FundCapitalCall.objects.count(), 1)

        capital_call = FundCapitalCall.objects.first()
        capital_call_details = capital_call.capital_call_details.all()

        self.assertEqual(len(capital_call_details), 2)
        self.assertIsNotNone(capital_call.workflow)
        self.assertIsNotNone(capital_call_details[0].notice)
        self.assertIsNotNone(capital_call_details[1].notice)
        self.assertEqual(capital_call.workflow.workflow_tasks.count(), 1)

        task = capital_call.workflow.workflow_tasks.first()
        self.assertEqual(task.assigned_to.company, self.company)
        self.assertEqual(task.workflow.company, self.company)
