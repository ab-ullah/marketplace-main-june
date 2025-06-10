from decimal import Decimal

from django.db.models import BooleanField, CharField, ForeignKey, DateField, DateTimeField
from encrypted_fields.fields import EncryptedCharField, EncryptedDateField

from api.agreements.services.application_data import SubscriptionField
from api.agreements.services.application_data.constants import TEXT_FIELD_TYPE, BOOLEAN_FIELD_TYPE
from api.libs.utils.format_currency import format_currency
from api.libs.utils.listify import listify


class ModelBasedOptions:
    PREFIX_ID = ''
    allowed_types = (
        BooleanField,
        EncryptedCharField,
        CharField,
        ForeignKey,
        DateField,
        DateTimeField,
        EncryptedDateField
    )
    custom_fields = ()
    currency_format_fields = ()

    def generate_id(self, field_id):
        return f'{self.PREFIX_ID}-{field_id}'.lower().replace('.', '-')

    def default_text_field(self, field_id):
        return SubscriptionField(
            id=self.generate_id(field_id),
            field_name='',
            type=TEXT_FIELD_TYPE,
            is_foreign_key=False,
            foreign_model_field=''
        ).to_json()

    def get_fields(self, fetch_custom=True):
        fields = []
        for field in self.model._meta.local_fields:
            if field in self.custom_fields:
                continue
            if type(field) in self.allowed_types and field.attname not in self.custom_fields:
                field_type = BOOLEAN_FIELD_TYPE if type(field) == BooleanField else TEXT_FIELD_TYPE
                is_foreign_key = type(field) == ForeignKey
                field_name = field.attname
                if is_foreign_key:
                    field_name = field.attname.rsplit('_id', 1)[0]
                field_id = self.generate_id(field_id=field_name)
                fields.append(
                    SubscriptionField(
                        id=field_id,
                        field_name=field_name,
                        type=field_type,
                        is_foreign_key=is_foreign_key,
                        foreign_model_field='name' if is_foreign_key else ''
                    ).to_json()
                )
        if fetch_custom:
            fields.extend(self.process_custom_fields())
        return fields

    def process_custom_fields(self, instance=None):
        suffix = 'value' if instance else 'field'
        args = []
        if instance:
            args.append(instance)
        custom_field_details = []
        for field in self.custom_fields:
            field_getter = f'get_{field}_{suffix}'
            if hasattr(self, field_getter):
                custom_field = getattr(self, field_getter)(*args)
                custom_field_details.extend(listify(custom_field))
            else:
                custom_field_details.append(self.default_text_field(field))
        return custom_field_details

    def get_values(self, instance):
        if not instance:
            return
        fields = self.get_fields(fetch_custom=False)
        for field_info in fields:
            field_name = field_info['field_name']
            if not field_name:
                continue
            value = getattr(instance, field_name)

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

    @staticmethod
    def boolean_to_yes_no_option_value(fields, value):
        if value is None:
            return fields

        for field in fields:
            option_value = value
            if '-is_not' in field['id']:
                option_value = not value
            field['value'] = option_value
        return fields

    def format_currency_fields(self, values):
        if not self.currency_format_fields:
            return values

        currency_field_ids = [self.generate_id(field_id) for field_id in self.currency_format_fields]

        for field_value in values:
            if field_value['id'] in currency_field_ids:
                value = field_value.get('value')
                if not value:
                    continue
                value = format_currency(value)
                field_value['value'] = value

        return values
