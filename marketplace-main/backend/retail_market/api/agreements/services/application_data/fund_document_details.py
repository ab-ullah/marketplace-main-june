from api.agreements.services.application_data import SubscriptionField
from api.agreements.services.application_data.base import ModelBasedOptions
from api.agreements.services.application_data.constants import FUND_ID, TEXT_FIELD_TYPE, SIGNATURE_TYPE
from api.companies.models import CompanyDocument
from api.documents.models import FundDocument
from api.libs.utils.format_currency import format_currency

GP_SIGNATURE_FIELD = 'gp_signer_sign'

GP_SIGNER_FIELD = 'gp_signer_name'
TITLE_FIELD = 'gp_signer_title'
DATE_FIELD = 'gp_signer_date'
GP_SIGNER_INVESTMENT_AMOUNT = 'gp_signer_investment_amount'
TITLE_FIELD_2 = 'gp_signer_title2'


class FundDocumentsDetails(ModelBasedOptions):
    PREFIX_ID = FUND_ID
    model = FundDocument
    custom_fields = (
        GP_SIGNER_FIELD,
        GP_SIGNATURE_FIELD,
        TITLE_FIELD,
        DATE_FIELD,
        TITLE_FIELD_2
    )

    def get_document_fields(self):
        fields = super().get_fields()
        fields.append(SubscriptionField(
            id=self.generate_id(field_id=GP_SIGNATURE_FIELD),
            field_name='',
            type=SIGNATURE_TYPE
        ).to_json())
        fields.append(self.get_investment_amount_field())

        return fields

    def get_investment_amount_field(self):
        return SubscriptionField(
            id=self.generate_id(field_id=GP_SIGNER_INVESTMENT_AMOUNT),
            field_name='',
            type=TEXT_FIELD_TYPE
        ).to_json()

    def get_gp_signer_title2_field(self):
        return SubscriptionField(
            id=self.generate_id(field_id=TITLE_FIELD_2),
            field_name='',
            type=TEXT_FIELD_TYPE
        ).to_json()

    def get_gp_signer_name_value(self, instance: FundDocument):
        field = self.default_text_field(field_id=GP_SIGNER_FIELD)
        field['locked'] = 'false'
        if instance.gp_signer:
            field['value'] = f'{instance.gp_signer.user.first_name} {instance.gp_signer.user.last_name}'.strip()
        else:
            field['value'] = ''
        return field

    def get_gp_signer_title_value(self, instance: FundDocument):
        field = self.default_text_field(field_id=TITLE_FIELD)
        field['locked'] = 'false'
        if instance.gp_signer:
            field['value'] = f'{instance.gp_signer.title}'.strip()
        else:
            field['value'] = ''
        return field

    def get_gp_signer_date_value(self, instance: FundDocument):
        field = self.default_text_field(field_id=DATE_FIELD)
        field['value'] = ''
        field['locked'] = 'false'
        return field

    def get_investment_amount_value(self, investment_amount):
        field = self.get_investment_amount_field()
        field['locked'] = 'false'
        if not investment_amount or not investment_amount.final_amount:
            return field

        field['value'] = format_currency(investment_amount.final_amount)
        return field

    def get_gp_signer_sign_value(self, instance: FundDocument):
        field = SubscriptionField(
            id=self.generate_id(field_id=GP_SIGNATURE_FIELD),
            field_name='',
            type=SIGNATURE_TYPE
        ).to_json()
        field['value'] = ""
        field['locked'] = 'false'
        return field

    def get_gp_signer_title2_value(self, instance: FundDocument):
        field = self.default_text_field(field_id=TITLE_FIELD_2)
        field['value'] = ''
        field['locked'] = 'false'
        return field

    def get_values(self, instance, investment_amount=None):
        values = super().get_values(instance=instance)
        values.append(self.get_investment_amount_value(investment_amount=investment_amount))
        return values


class CompanyDocumentDetails(FundDocumentsDetails):
    model = CompanyDocument
