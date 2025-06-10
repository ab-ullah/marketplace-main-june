from django.urls import reverse
from rest_framework import status

from api.eligibility_criteria.tests.factories import InvestmentAmountFactory
from api.transfers.tests.factories import TransferFactory
from core.base_tests import BaseTestCase


class TestTransferAdminViews(BaseTestCase):

    def setUp(self):
        self.create_company()
        self.create_user()
        self.client.force_authenticate(self.admin_user.user)
        self.create_currency()
        self.setup_fund(company=self.company)
        self.create_card_workflow(self.company)
        self.application = self.create_application()
        self.application.investment_amount = InvestmentAmountFactory()
        self.application.transfer = TransferFactory()
        self.application.save()

    def test_transfer_list_view(self):
        self.client.force_authenticate(self.admin_user.user)
        url = reverse('admin-transfer-list')
        response = self.client.get(url, **self.get_headers(), format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_transfer_retrieve_update_list_view(self):
        self.client.force_authenticate(self.admin_user.user)
        url = reverse('admin-transfer-retrieve-update', kwargs={'pk': self.application.transfer.id})

        response = self.client.get(url, **self.get_headers())
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(self.application.transfer.loan_date.strftime('%Y-%m-%d'), response.data['loan_date'])

        payload = {
            'loan_date': '2023-05-20',
            'loan_balance': 1000.00,
            'transfer_balance': 1000.00
        }
        response = self.client.patch(url, data=payload)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.application.transfer.refresh_from_db()
        self.assertEqual(self.application.transfer.loan_date.strftime('%Y-%m-%d'), payload['loan_date'])
