from _datetime import datetime
from dateutil.parser import parse as dt_parse

from api.applications.models import Application
from api.funds.services.types import InviteRow
from api.funds.utils.convert_curreny_to_number import \
    convert_currency_to_number
from api.transfers.constants import (INTEREST_BALANCE, INTEREST_DATE,
                                     LOAN_BALANCE, LOAN_DATE)
from api.transfers.models import Transfer


class CreateTransferService:
    def __init__(self, invite_row: InviteRow, application: Application):
        self.invite_row = invite_row
        self.application = application

    def process(self):
        self.create_transfer()

    def get_amount(self, field_name):
        if not self.invite_row.get(field_name):
            return None
        return convert_currency_to_number(self.invite_row.get(field_name))

    def get_date(self, field_name):
        if not self.invite_row.get(field_name):
            return None

        try:
            date = dt_parse(self.invite_row.get(field_name)).date()
        except ValueError:
            return None
        return date

    def create_transfer(self):
        loan_date = self.get_date(LOAN_DATE)

        if loan_date:
            transfer = Transfer.objects.create(
                loan_date=loan_date,
                loan_balance=self.get_amount(LOAN_BALANCE),
                interest_date=self.get_date(INTEREST_DATE),
                interest_balance=self.get_amount(INTEREST_BALANCE)
            )
            self.application.transfer = transfer
            self.application.save()
