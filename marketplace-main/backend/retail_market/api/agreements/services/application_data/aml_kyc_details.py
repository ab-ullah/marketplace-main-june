from decimal import Decimal

from api.agreements.services.application_data import SubscriptionField
from api.agreements.services.application_data.base import ModelBasedOptions
from api.agreements.services.application_data.constants import AML_KYC_ID, CHECKBOX_TYPE, SIGNATURE_TYPE
from api.constants.agreements_data import SOURCE_OF_FUNDS, ECONOMIC_BENEFICIARY_VALUES, INVESTOR_TYPES, \
    INVESTOR_TYPE_MAPPING
from api.constants.kyc_investor_types import KYCInvestorType
from api.kyc_records.models import KYCRecord

SOURCE_OF_FUNDS_OPTION_FIELD = 'source_of_funds_option'
ECONOMIC_BENEFICIARY_FIELD = 'economic_beneficiary'
INVESTOR_TYPE_FIELD = 'investor_type'
FULL_NAME_FIELD = 'full_name'
APPLICANT_NAME_FIELD = 'applicant_name'
HOME_MAILING_ADDRESS_FIELD = 'home_mailing_address'
APPLICANT_OWNED_BY_OTHER_ENTITY = 'applicant_owned'
DIRECT_PARENT_OWNED_BY_OTHER_ENTITY = 'direct_parent_owned'
APPLICANT_ORGANIZED_FOR_SPECIFIC_PURPOSE = 'applicant_organized_for_specific_purpose'
JURISDICTION_OF_ORGANIZATION = 'jurisdiction_of_organization'
YEAR_OF_ORGANIZATION = 'year_of_organization'
IS_US_PERSON = 'is_us_person'
US_PERSON_NAME = 'us_person_name'
US_PERSON_TITLE = 'us_person_title'
US_PERSON_SIGNATURE = 'us_person_sign'
ENTITY_SIGNATURE = 'entity_sign'


class AmlKycOptions(ModelBasedOptions):
    PREFIX_ID = AML_KYC_ID
    model = KYCRecord
    custom_fields = (
        FULL_NAME_FIELD,
        SOURCE_OF_FUNDS_OPTION_FIELD,
        ECONOMIC_BENEFICIARY_FIELD,
        INVESTOR_TYPE_FIELD,
        APPLICANT_NAME_FIELD,
        HOME_MAILING_ADDRESS_FIELD,
        APPLICANT_OWNED_BY_OTHER_ENTITY,
        DIRECT_PARENT_OWNED_BY_OTHER_ENTITY,
        APPLICANT_ORGANIZED_FOR_SPECIFIC_PURPOSE,
        JURISDICTION_OF_ORGANIZATION,
        YEAR_OF_ORGANIZATION,
        IS_US_PERSON,
        US_PERSON_NAME,
        US_PERSON_TITLE,
        US_PERSON_SIGNATURE,
        ENTITY_SIGNATURE
    )
    currency_format_fields = ('net_worth',)

    def get_full_name_value(self, instance: KYCRecord):
        field = self.default_text_field(field_id=FULL_NAME_FIELD)
        field['value'] = f'{instance.first_name} {instance.last_name}'.strip()
        return field

    def get_source_of_funds_option_field(self):
        fields = []
        for field in SOURCE_OF_FUNDS:
            fields.append(
                SubscriptionField(
                    id=self.generate_id(field_id=f'{SOURCE_OF_FUNDS_OPTION_FIELD}_{field["value"]}'),
                    field_name='',
                    type=CHECKBOX_TYPE
                ).to_json()
            )
        return fields

    def get_source_of_funds_option_value(self, instance: KYCRecord):
        fields = self.get_source_of_funds_option_field()
        selected_value = instance.source_of_funds
        if not selected_value:
            return fields
        for field in fields:
            value = field['id'] == self.generate_id(field_id=f'{SOURCE_OF_FUNDS_OPTION_FIELD}_{selected_value}')
            field['value'] = value
        return fields

    def get_economic_beneficiary_field(self):
        fields = []
        for field in ECONOMIC_BENEFICIARY_VALUES:
            fields.append(
                SubscriptionField(
                    id=self.generate_id(field_id=f'{ECONOMIC_BENEFICIARY_FIELD}_{field}'),
                    field_name='',
                    type=CHECKBOX_TYPE
                ).to_json()
            )
        return fields

    def get_economic_beneficiary_value(self, instance: KYCRecord):
        fields = self.get_economic_beneficiary_field()
        selected_value = instance.economic_beneficiary
        if not selected_value:
            return fields
        for field in fields:
            value = field['id'] == self.generate_id(field_id=f'{ECONOMIC_BENEFICIARY_FIELD}_{selected_value}')
            field['value'] = value
        return fields

    def get_investor_type_field(self):
        fields = []
        for field in INVESTOR_TYPES:
            fields.append(
                SubscriptionField(
                    id=self.generate_id(field_id=f'{INVESTOR_TYPE_FIELD}_{field}'),
                    field_name='',
                    type=CHECKBOX_TYPE
                ).to_json()
            )
        return fields

    def get_investor_type_value(self, instance: KYCRecord):
        fields = self.get_investor_type_field()
        selected_value = instance.kyc_investor_type
        value = INVESTOR_TYPE_MAPPING.get(selected_value)
        if not value:
            return fields
        selected_field_id = self.generate_id(field_id=f'{INVESTOR_TYPE_FIELD}_{value}')
        for field in fields:
            field['value'] = selected_field_id == field['id']
        return fields

    def get_applicant_name_value(self, instance: KYCRecord):
        field = self.default_text_field(field_id=APPLICANT_NAME_FIELD)
        value = instance.entity_name
        if instance.kyc_investor_type == KYCInvestorType.INDIVIDUAL.value:
            value = f'{instance.first_name} {instance.last_name}'
        field['value'] = value
        return field

    def get_home_mailing_address_value(self, instance: KYCRecord):
        field = self.default_text_field(field_id=HOME_MAILING_ADDRESS_FIELD)
        address_parts = []
        home_fields = ('home_address', 'home_city', 'home_state', 'home_zip')
        for home_field in home_fields:
            home_field_value = getattr(instance, home_field)
            if home_field_value:
                address_parts.append(home_field_value)
        field['value'] = ', '.join(address_parts)
        return field

    def get_applicant_owned_field(self):
        return [
            SubscriptionField(
                id=self.generate_id(field_id='is_applicant_owned_by_another_entity'),
                field_name='',
                type=CHECKBOX_TYPE
            ).to_json(),
            SubscriptionField(
                id=self.generate_id(field_id='is_not_applicant_owned_by_another_entity'),
                field_name='',
                type=CHECKBOX_TYPE
            ).to_json()
        ]

    def get_is_us_person_field(self):
        return [
            SubscriptionField(
                id=self.generate_id(field_id='is_us_person'),
                field_name='',
                type=CHECKBOX_TYPE
            ).to_json(),
            SubscriptionField(
                id=self.generate_id(field_id='is_not_us_person'),
                field_name='',
                type=CHECKBOX_TYPE
            ).to_json()
        ]

    def get_direct_parent_owned_field(self):
        return [
            SubscriptionField(
                id=self.generate_id(field_id='is_direct_parent_owned_by_another_entity'),
                field_name='',
                type=CHECKBOX_TYPE
            ).to_json(),
            SubscriptionField(
                id=self.generate_id(field_id='is_not_direct_parent_owned_by_another_entity'),
                field_name='',
                type=CHECKBOX_TYPE
            ).to_json()
        ]

    def get_applicant_organized_for_specific_purpose_field(self):
        return [
            SubscriptionField(
                id=self.generate_id(field_id='is_applicant_organized_for_specific_purpose_of_investing'),
                field_name='',
                type=CHECKBOX_TYPE
            ).to_json(),
            SubscriptionField(
                id=self.generate_id(field_id='is_not_applicant_organized_for_specific_purpose_of_investing'),
                field_name='',
                type=CHECKBOX_TYPE
            ).to_json()
        ]

    def get_applicant_owned_value(self, kyc_record: KYCRecord):
        fields = self.get_applicant_owned_field()
        value = kyc_record.applicant_owned_by_another_entity
        if value is None:
            return fields

        for field in fields:
            option_value = value
            if '-is_not' in field['id']:
                option_value = not value
            field['value'] = option_value
        return fields

    def get_is_us_person_value(self, kyc_record: KYCRecord):
        fields = self.get_is_us_person_field()
        value = kyc_record.is_us_citizen
        if value is None:
            return fields

        for field in fields:
            option_value = value
            if '-is_not' in field['id']:
                option_value = not value
            field['value'] = option_value
        return fields

    def get_direct_parent_owned_value(self, kyc_record: KYCRecord):
        fields = self.get_direct_parent_owned_field()
        value = kyc_record.direct_parent_owned_by_another_entity
        if value is None:
            return fields

        for field in fields:
            option_value = value
            if '-is_not' in field['id']:
                option_value = not value
            field['value'] = option_value
        return fields

    def get_applicant_organized_for_specific_purpose_value(self, kyc_record: KYCRecord):
        fields = self.get_applicant_organized_for_specific_purpose_field()
        value = kyc_record.applicant_organized_for_specific_purpose_of_investing
        if value is None:
            return fields

        for field in fields:
            option_value = value
            if '-is_not' in field['id']:
                option_value = not value
            field['value'] = option_value
        return fields

    def get_jurisdiction_of_organization_value(self, kyc_record: KYCRecord):
        field = self.default_text_field(JURISDICTION_OF_ORGANIZATION)
        tokens = []
        country = kyc_record.jurisdiction
        if not country:
            return field

        if country.iso_code == 'US' and kyc_record.jurisdiction_state:
            tokens.append(kyc_record.jurisdiction_state.name)

        tokens.append(country.name)
        field['value'] = ', '.join(tokens)
        return field

    def get_year_of_organization_value(self, kyc_record: KYCRecord):
        field = self.default_text_field(field_id=YEAR_OF_ORGANIZATION)
        if not kyc_record.date_of_formation:
            return field

        field['value'] = kyc_record.date_of_formation.year
        return field

    def get_us_person_name_value(self, kyc_record: KYCRecord):
        field = self.default_text_field(field_id=US_PERSON_NAME)
        if not kyc_record.is_us_citizen:
            return field

        field['value'] = f'{kyc_record.first_name} {kyc_record.last_name}'
        return field

    def get_us_person_title_value(self, kyc_record: KYCRecord):
        field = self.default_text_field(field_id=US_PERSON_TITLE)
        if not kyc_record.is_us_citizen:
            return field

        field['value'] = kyc_record.job_title
        return field

    def get_us_person_sign_field(self):
        return [
            SubscriptionField(
                id=self.generate_id(field_id=US_PERSON_SIGNATURE),
                field_name='',
                type=SIGNATURE_TYPE
            ).to_json(),
        ]

    def get_entity_sign_field(self):
        field_id = 'entity-sign'
        return [
            SubscriptionField(
                id=self.generate_id(field_id=field_id),
                field_name='',
                type=SIGNATURE_TYPE
            ).to_json(),
        ]

    def get_us_person_sign_value(self, kyc_record: KYCRecord):
        field = self.get_us_person_sign_field()[0]
        field['required'] = kyc_record.is_us_citizen
        field['value'] = kyc_record.is_us_citizen
        return field

    def get_entity_sign_value(self, kyc_record: KYCRecord):
        field = self.get_entity_sign_field()[0]
        is_entity = not kyc_record.is_individual_record()
        field['required'] = is_entity
        field['value'] = is_entity
        return field

    def get_values(self, instance: KYCRecord):
        if not instance:
            return
        fields = self.get_fields(fetch_custom=False)
        for field_info in fields:
            field_name = field_info['field_name']
            if not field_name:
                continue

            value = getattr(instance, field_name)

            if field_name == 'entity_name':
                if instance.is_individual_record():
                    value = 'None'
                field_info['value'] = value
                continue

            if field_info['is_foreign_key'] and value:
                related_obj = getattr(instance, field_name)
                if hasattr(related_obj, field_info['foreign_model_field']):
                    value = getattr(related_obj, field_info['foreign_model_field'])
            if type(value) is not bool and value:
                value = str(value)
            if isinstance(value, Decimal) and value == 0:
                value = '0'

            field_info['value'] = value
        fields.extend(self.process_custom_fields(instance=instance))
        return self.format_currency_fields(values=fields)
