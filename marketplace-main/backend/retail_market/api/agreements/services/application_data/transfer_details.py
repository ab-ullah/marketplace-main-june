from django.db.models import DateField, DecimalField
from api.libs.utils.format_date import format_date

from api.agreements.services.application_data.base import ModelBasedOptions
from api.agreements.services.application_data.constants import \
    TRANSFER_DETAIL_ID, DATE_TYPE
from api.transfers.models import Transfer

LOAN_DATE_FIELD = 'loan_date'
LOAN_INTEREST_FIELD = 'interest_date'

class TransferDetailOption(ModelBasedOptions):
    PREFIX_ID = TRANSFER_DETAIL_ID
    allowed_types = (DecimalField, DateField)
    model = Transfer
    currency_format_fields = ('equity', 'loan_balance', 'interest_balance')
    custom_fields = (LOAN_DATE_FIELD, LOAN_INTEREST_FIELD)

    def get_loan_date_field(self):
        return {
                'field_name': '',
                'id': self.generate_id(field_id=f'{LOAN_DATE_FIELD}'),
                'type': DATE_TYPE
            }

    def get_loan_date_value(self, instance: Transfer):
        field = self.default_text_field(field_id=LOAN_DATE_FIELD)
        field['value'] = format_date(instance.loan_date)
        return field

    def get_interest_date_field(self):
        return {
            'field_name': '',
            'id': self.generate_id(field_id=f'{LOAN_INTEREST_FIELD}'),
            'type': DATE_TYPE
        }

    def get_interest_date_value(self, instance: Transfer):
        field = self.default_text_field(field_id=LOAN_INTEREST_FIELD)
        field['value'] = format_date(instance.interest_date)
        return field
