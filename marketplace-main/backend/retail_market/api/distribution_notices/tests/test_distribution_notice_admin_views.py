import os
from datetime import timedelta

from django.contrib.auth.models import Group
from django.core.files.uploadedfile import SimpleUploadedFile
from django.urls import reverse
from django.utils import timezone
from rest_framework import status

from api.distribution_notices.models import DistributionNotice
from api.distribution_notices.tests.factories import (
    DistributionNoticeDetailFactory, DistributionNoticeFactory)
from api.partners.tests.factories import (AdminUserFactory, CompanyFactory,
                                          CompanyUserFactory)
from api.users.constants import DISTRIBUTION_NOTICE_REVIEWER
from core.base_tests import BaseTestCase


class TestCapitalCallAdminViews(BaseTestCase):

    def setUp(self):
        self.create_user()
        self.create_fund(self.company)

        self.other_company = CompanyFactory()
        self.other_admin_user = AdminUserFactory(company=self.other_company)

        capital_call_group = Group.objects.get(name=DISTRIBUTION_NOTICE_REVIEWER)
        self.other_admin_user.groups.add(capital_call_group)
        self.admin_user.groups.add(capital_call_group)

    def test_distribution_notice_list_view(self):
        distribution_notice_1 = DistributionNoticeFactory(fund=self.fund, company=self.company)
        distribution_notice_detail_1 = DistributionNoticeDetailFactory(distribution_notice=distribution_notice_1)
        distribution_notice_detail_2 = DistributionNoticeDetailFactory(distribution_notice=distribution_notice_1)

        distribution_notice_2 = DistributionNoticeFactory(fund=self.fund, company=self.company)
        distribution_notice_detail_3 = DistributionNoticeDetailFactory(distribution_notice=distribution_notice_2)
        distribution_notice_detail_4 = DistributionNoticeDetailFactory(distribution_notice=distribution_notice_2)

        self.client.force_authenticate(self.admin_user.user)
        url = reverse('admin-distribution-notice-list', kwargs={'fund_external_id': self.fund.external_id})
        response = self.client.get(url, **self.get_headers(), format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        capital_calls = response.data
        self.assertEqual(len(capital_calls), 2)
        self.assertEqual(
            capital_calls[1]['total_distributed'],
            distribution_notice_detail_1.amount + distribution_notice_detail_2.amount
        )
        self.assertEqual(
            capital_calls[0]['total_distributed'],
            distribution_notice_detail_3.amount + distribution_notice_detail_4.amount
        )

    def test_distribution_notice_detail_list_view(self):
        distribution_notice = DistributionNoticeFactory(fund=self.fund, company=self.company)
        DistributionNoticeDetailFactory(distribution_notice=distribution_notice)
        DistributionNoticeDetailFactory(distribution_notice=distribution_notice)
        DistributionNoticeDetailFactory(distribution_notice=distribution_notice)

        self.client.force_authenticate(self.admin_user.user)
        url = reverse(
            'admin-distribution-notice-detail-list',
            kwargs={'fund_external_id': self.fund.external_id, 'pk': distribution_notice.id}
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

    def test_distribution_notice_create_view(self):
        CompanyUserFactory(user__email='joesmith@example.com', company=self.company)
        CompanyUserFactory(user__email='joesmith2@example.com', company=self.company)

        self.assertEqual(DistributionNotice.objects.count(), 0)
        self.client.force_authenticate(self.admin_user.user)
        url = reverse(
            'admin-distribution-notice-list-create',
            kwargs={'fund_external_id': self.fund.external_id}
        )

        payload = {
            'document_file': self.get_invites_csv('distribution_notice'),
            'distribution_date': (timezone.now() + timedelta(days=7)).strftime('%m/%d/%Y')
        }
        response = self.client.post(url, data=payload, format="multipart")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(DistributionNotice.objects.count(), 1)

        distribution_notice = DistributionNotice.objects.first()
        distribution_notice_details = distribution_notice.distribution_notice_details.all()

        self.assertIsNotNone(distribution_notice.workflow)
        self.assertEqual(distribution_notice.workflow.workflow_tasks.count(), 1)

        self.assertEqual(len(distribution_notice_details), 2)
        self.assertIsNotNone(distribution_notice_details[0].document)
        self.assertIsNotNone(distribution_notice_details[1].document)

        task = distribution_notice.workflow.workflow_tasks.first()
        self.assertEqual(task.assigned_to.company, self.company)
        self.assertEqual(task.workflow.company, self.company)

