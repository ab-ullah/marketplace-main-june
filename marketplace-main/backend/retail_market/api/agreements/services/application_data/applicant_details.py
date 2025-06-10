from django.utils import timezone

from api.agreements.services.application_data.base import ModelBasedOptions
from api.agreements.services.application_data.constants import APPLICANT_ID
from api.applications.models import Application

SIGNER_DATE_FIELD = 'signer_date'
INVESTOR_SIGNING_DATE_FIELD = 'investor_signing_date'


class ApplicantOptions(ModelBasedOptions):
    PREFIX_ID = APPLICANT_ID
    model = Application
    custom_fields = (
        SIGNER_DATE_FIELD,
        INVESTOR_SIGNING_DATE_FIELD
    )

    def get_fields(self, fetch_custom=True):
        if not fetch_custom:
            return []
        return self.process_custom_fields()

    def get_signer_date_value(self, _):
        field = self.default_text_field(field_id=SIGNER_DATE_FIELD)
        field['value'] = timezone.now().date().strftime("%m/%d/%Y")
        field['locked'] = 'false'
        return field

    def get_investor_signing_date_value(self, _):
        field = self.default_text_field(field_id=INVESTOR_SIGNING_DATE_FIELD)
        field['value'] = timezone.now().date().strftime("%m/%d/%Y")
        field['locked'] = 'true'
        return field
