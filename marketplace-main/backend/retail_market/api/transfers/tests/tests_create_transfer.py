import datetime
from decimal import Decimal

from api.transfers.models import Transfer
from api.transfers.services.create_transfer import CreateTransferService
from core.base_tests import BaseTestCase


class TestCreateTransferService(BaseTestCase):

    def setUp(self) -> None:
        self.create_company()
        self.create_user()
        self.client.force_authenticate(self.admin_user.user)
        self.create_currency()
        self.setup_fund(company=self.company)
        self.create_card_workflow(self.company)
        self.application = self.create_application()

    def test_create_transfer_with_transfer_loan_date(self):
        invite_row = {
            'loan_date': '05/20/2023',
            'loan_balance': '$5,000',
            'interest_date': '05/30/2023',
            'interest_balance': '$5,000',
        }
        service = CreateTransferService(invite_row, self.application)
        service.process()

        self.assertEqual(Transfer.objects.filter(transfer_application=self.application).count(), 1)

        transfer = Transfer.objects.filter(transfer_application=self.application).first()
        self.assertEqual(transfer.transfer_application, self.application)
        self.assertEqual(transfer.loan_date, datetime.date(2023, 5, 20))
        self.assertEqual(transfer.loan_balance, Decimal('5000.000'))
        self.assertEqual(transfer.interest_date, datetime.date(2023, 5, 30))
        self.assertEqual(transfer.interest_balance, Decimal('5000.000'))

    def test_create_transfer_without_transfer_loan_date(self):
        invite_row = {
            'loan_balance': '$5,000',
            'interest_date': '05/30/2023',
            'interest_balance': '$5,000',
        }
        service = CreateTransferService(invite_row, self.application)
        service.process()

        self.assertFalse(Transfer.objects.filter(transfer_application=self.application).exists())
