from api.agreements.services.application_data.base import ModelBasedOptions
from api.agreements.services.application_data.constants import BOOLEAN_FIELD_TYPE, TAX_ID
from api.tax_records.data.tax_forms import TAX_FORMS
from api.tax_records.models import TaxRecord

TAX_JURISDICTIONS_FIELD = 'tax_jurisdictions'
TAX_EXEMPT_IN_COUNTRY_FIELD = 'tax_exempt_in_country'
TAX_EXEMPT_COUNTRIES_FIELD = 'tax_exempt_countries'
US_HOLDER_FIELD = 'us_holder'
TAX_EXEMPT_FIELD = 'tax_exempt'
TAX_ENTITY_FIELD = 'is_entity'


class TaxDetailOptions(ModelBasedOptions):
    PREFIX_ID = TAX_ID
    model = TaxRecord
    custom_fields = (
        TAX_JURISDICTIONS_FIELD,
        TAX_EXEMPT_FIELD,
        TAX_EXEMPT_IN_COUNTRY_FIELD,
        TAX_EXEMPT_COUNTRIES_FIELD,
        US_HOLDER_FIELD,
        TAX_EXEMPT_FIELD,
        TAX_ENTITY_FIELD
    )

    def get_fields(self, fetch_custom=True):
        fields = super().get_fields(fetch_custom=fetch_custom)
        for tax_form in TAX_FORMS:
            fields.append(
                {
                    'field_name': tax_form['form_id'],
                    'id': self.generate_id(field_id=tax_form['form_id']),
                    'type': BOOLEAN_FIELD_TYPE
                }
            )

        return fields

    def get_tax_exempt_in_country_field(self):
        return [
            {
                'field_name': '',
                'id': self.generate_id(field_id=f'is_{TAX_EXEMPT_IN_COUNTRY_FIELD}'),
                'type': BOOLEAN_FIELD_TYPE
            },
            {
                'field_name': '',
                'id': self.generate_id(field_id=f'is_not_{TAX_EXEMPT_IN_COUNTRY_FIELD}'),
                'type': BOOLEAN_FIELD_TYPE
            }
        ]

    def get_tax_exempt_field(self):
        return [
            {
                'field_name': '',
                'id': self.generate_id(field_id=f'is_{TAX_EXEMPT_FIELD}'),
                'type': BOOLEAN_FIELD_TYPE
            },
            {
                'field_name': '',
                'id': self.generate_id(field_id=f'is_not_{TAX_EXEMPT_FIELD}'),
                'type': BOOLEAN_FIELD_TYPE
            }
        ]

    def get_us_holder_field(self):
        return [
            {
                'field_name': '',
                'id': self.generate_id(field_id=f'is_{US_HOLDER_FIELD}'),
                'type': BOOLEAN_FIELD_TYPE
            },
            {
                'field_name': '',
                'id': self.generate_id(field_id=f'is_not_{US_HOLDER_FIELD}'),
                'type': BOOLEAN_FIELD_TYPE
            }
        ]

    def get_is_entity_field(self):
        return [
            {
                'field_name': '',
                'id': self.generate_id(field_id=f'is_{TAX_ENTITY_FIELD}'),
                'type': BOOLEAN_FIELD_TYPE
            },
            {
                'field_name': '',
                'id': self.generate_id(field_id=f'is_not_{TAX_ENTITY_FIELD}'),
                'type': BOOLEAN_FIELD_TYPE
            }
        ]

    @staticmethod
    def get_tax_record_countries(tax_record: TaxRecord):
        country_codes = list(tax_record.countries.values_list('name', flat=True))
        if not country_codes:
            return ''
        return ', '.join(country_codes)

    @staticmethod
    def get_tax_exempt_countries(tax_record: TaxRecord):
        if not tax_record.is_tax_exempt_in_country:
            return ''
        country_codes = list(tax_record.countries.values_list('name', flat=True))
        if not country_codes:
            return ''
        return ', '.join(country_codes)

    def get_tax_jurisdictions_value(self, instance: TaxRecord):
        field = self.default_text_field(field_id=TAX_JURISDICTIONS_FIELD)
        field['value'] = self.get_tax_record_countries(tax_record=instance)
        return field

    @staticmethod
    def char_to_bool(value):
        if not value:
            return value

        if not isinstance(value, str):
            return value

        return value.lower().strip() in ['true', 'yes', 't']

    def get_tax_exempt_in_country_value(self, instance: TaxRecord):
        fields = self.get_tax_exempt_in_country_field()
        value = self.char_to_bool(instance.is_tax_exempt_in_country)
        return self.boolean_to_yes_no_option_value(fields=fields, value=value)

    def get_is_entity_value(self, instance: TaxRecord):
        fields = self.get_is_entity_field()
        value = self.char_to_bool(instance.is_entity)
        return self.boolean_to_yes_no_option_value(fields=fields, value=value)

    def get_us_holder_value(self, instance: TaxRecord):
        fields = self.get_us_holder_field()
        value = self.char_to_bool(instance.us_holder)
        return self.boolean_to_yes_no_option_value(fields=fields, value=value)

    def get_tax_exempt_value(self, instance: TaxRecord):
        fields = self.get_tax_exempt_field()
        value = self.char_to_bool(instance.is_tax_exempt)
        return self.boolean_to_yes_no_option_value(fields=fields, value=value)

    def get_tax_exempt_countries_value(self, instance: TaxRecord):
        field = self.default_text_field(field_id=TAX_EXEMPT_COUNTRIES_FIELD)
        field['value'] = self.get_tax_record_countries(tax_record=instance)
        return field

    def get_values(self, instance: TaxRecord):
        if not instance:
            return
        completed_ids = []
        for tax_document in instance.tax_documents.all():
            if tax_document.completed:
                field_id = self.generate_id(field_id=tax_document.form.form_id)
                completed_ids.append(field_id)

        fields = self.get_fields(fetch_custom=False)
        for field in fields:
            if field['id'] in completed_ids:
                field['value'] = True
            field_name = field['field_name']
            if field_name == 'tax_year_end':
                field['value'] = instance.get_tax_year_end_month_day
                continue
            if hasattr(instance, field['field_name']):
                value = getattr(instance, field['field_name'])
                if not isinstance(value, bool) and value:
                    value = str(value)
                field['value'] = value
        fields.extend(self.process_custom_fields(instance=instance))
        return fields
