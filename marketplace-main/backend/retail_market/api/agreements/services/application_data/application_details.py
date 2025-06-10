from api.agreements.services.application_data import SubscriptionField
from api.agreements.services.application_data.base import ModelBasedOptions
from api.agreements.services.application_data.constants import APPLICATION_ID, TEXT_FIELD_TYPE, CHECKBOX_TYPE
from api.applications.models import Application
from api.constants.share_classes import FUND_SHARE_CLASSES

EMAIL_FIELD = 'email'
FUND_NAME_FIELD = 'fund_name'
SHARE_CLASS_FIELD = 'share_class'
VEHICLE_FIELD = 'feeder_name'


class ApplicationOptions(ModelBasedOptions):
    PREFIX_ID = APPLICATION_ID
    custom_fields = (EMAIL_FIELD, FUND_NAME_FIELD, SHARE_CLASS_FIELD, VEHICLE_FIELD)
    model = Application

    def get_email_field(self):
        return SubscriptionField(
            id=self.generate_id(field_id='email'),
            field_name='',
            type=TEXT_FIELD_TYPE
        ).to_json()

    def get_email_value(self, application: Application):
        field = self.default_text_field(field_id=EMAIL_FIELD)
        field['value'] = application.user.email
        return field

    def get_fund_name_value(self, application: Application):
        field = self.default_text_field(field_id=FUND_NAME_FIELD)
        field['value'] = application.fund.name
        return field

    def get_share_class_field(self):
        fields = []
        for share_class in FUND_SHARE_CLASSES:
            fields.append(
                SubscriptionField(
                    id=self.generate_id(field_id=f'share_class_is_{share_class}'),
                    field_name='',
                    type=CHECKBOX_TYPE
                ).to_json()
            )
        return fields

    def get_feeder_name_field(self):
        return SubscriptionField(
            id=self.generate_id(field_id='feeder_name'),
            field_name='',
            type=TEXT_FIELD_TYPE
        ).to_json()

    def get_share_class_value(self, application: Application):
        fields = self.get_share_class_field()
        share_class = None
        if application.share_class:
            if application.share_class.internal_name:
                share_class_abbreviation = application.share_class.internal_name
            else:
                share_class_abbreviation = application.share_class.display_name.rsplit()[-1]
            share_class = self.generate_id(f'share_class_is_{share_class_abbreviation.lower()}')
        for field in fields:
            field['value'] = field['id'] == share_class
        return fields

    def get_feeder_name_value(self, application: Application):
        field = self.get_feeder_name_field()
        value = ''
        if application.vehicle:
            value = application.vehicle.name
        field['value'] = value
        return field
