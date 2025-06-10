from django.utils import timezone

from api.agreements.services.application_data import SubscriptionField
from api.agreements.services.application_data.base import ModelBasedOptions
from api.agreements.services.application_data.constants import FUND_ID, TEXT_FIELD_TYPE, SIGNATURE_TYPE, \
    CARRY_DOCUMENT_ID
from api.carry_pools.models import CarryDocument

GP_SIGNATURE_FIELD = 'gp_signer_sign'
GP_SIGNER_FIELD = 'gp_signer_name'
TITLE_FIELD = 'gp_signer_title'
DATE_FIELD = 'gp_signer_date'
TITLE_FIELD_2 = 'gp_signer_title2'
COMPANY_DISPLAY_NAME_FIELD = 'company_display'
SIGNER_DATE_FIELD = 'signer_date'


class CarryDocumentsOptions(ModelBasedOptions):
    PREFIX_ID = CARRY_DOCUMENT_ID
    model = CarryDocument
    custom_fields = (
        GP_SIGNER_FIELD,
        GP_SIGNATURE_FIELD,
        TITLE_FIELD,
        DATE_FIELD,
        TITLE_FIELD_2,
        COMPANY_DISPLAY_NAME_FIELD,
        SIGNER_DATE_FIELD
    )

    def get_document_fields(self):
        fields = super().get_fields()
        fields.append(SubscriptionField(
            id=self.generate_id(field_id=GP_SIGNATURE_FIELD),
            field_name='',
            type=SIGNATURE_TYPE
        ).to_json())
        return fields

    def get_gp_signer_title2_field(self):
        return SubscriptionField(
            id=self.generate_id(field_id=TITLE_FIELD_2),
            field_name='',
            type=TEXT_FIELD_TYPE
        ).to_json()

    def get_gp_signer_name_value(self, instance: CarryDocument):
        field = self.default_text_field(field_id=GP_SIGNER_FIELD)
        field['locked'] = 'false'
        if instance.gp_signer:
            field['value'] = f'{instance.gp_signer.user.first_name} {instance.gp_signer.user.last_name}'.strip()
        else:
            field['value'] = ''
        return field

    def get_gp_signer_title_value(self, instance: CarryDocument):
        field = self.default_text_field(field_id=TITLE_FIELD)
        field['locked'] = 'false'
        if instance.gp_signer:
            field['value'] = f'{instance.gp_signer.title}'.strip()
        else:
            field['value'] = ''
        return field

    def get_gp_signer_date_value(self, instance: CarryDocument):
        field = self.default_text_field(field_id=DATE_FIELD)
        field['value'] = ''
        field['locked'] = 'false'
        return field

    def get_gp_signer_sign_value(self, instance: CarryDocument):
        field = SubscriptionField(
            id=self.generate_id(field_id=GP_SIGNATURE_FIELD),
            field_name='',
            type=SIGNATURE_TYPE
        ).to_json()
        field['value'] = ""
        field['locked'] = 'false'
        return field

    def get_gp_signer_title2_value(self, instance: CarryDocument):
        field = self.default_text_field(field_id=TITLE_FIELD_2)
        field['value'] = ''
        field['locked'] = 'false'
        return field

    def get_company_display_value(self, instance: CarryDocument):
        field = self.default_text_field(field_id=COMPANY_DISPLAY_NAME_FIELD)
        field['value'] = instance.company.name.title()
        return field

    def get_signer_date_value(self, _):
        field = self.default_text_field(field_id=SIGNER_DATE_FIELD)
        field['value'] = timezone.now().date().strftime("%m/%d/%Y")
        field['locked'] = True
        return field
