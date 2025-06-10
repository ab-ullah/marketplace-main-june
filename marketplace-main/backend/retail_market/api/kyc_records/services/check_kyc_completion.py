from typing import Iterable

from api.cards.models import Card
from api.documents.models import KYCDocument
from api.kyc_records.models import KYCRecord


class CheckKycCompletion:
    def __init__(self, kyc_record: KYCRecord, fund=None):
        self.kyc_record = kyc_record
        self.fund = fund
        self.errors = {}

    def get_cards(self):
        return list(self.kyc_record.workflow.cards.all())

    def adjust_for_boolean(self, value):
        value = str(value)
        if value.lower() not in ['t', 'f']:
            return value

        return value.lower() == 't'

    def validate_required_field_by_dependency(self, field_id, dependency):
        dependency_field = dependency.get('field')
        actual_value = getattr(self.kyc_record, dependency_field)
        if not isinstance(actual_value, bool):
            actual_value = str(actual_value)
        dependency_relation = dependency.get('relation')
        if dependency_relation == 'equals':
            dependency_value = self.adjust_for_boolean(dependency.get('value'))
            if dependency_value == actual_value:
                self.errors[field_id] = "This field is required"
                return
        elif dependency_relation == 'not equals':
            dependency_value = self.adjust_for_boolean(dependency.get('value'))
            if dependency_value != actual_value:
                self.errors[field_id] = "This field is required"
                return
        elif dependency_relation == 'in':
            dependency_value = list(map(lambda x: self.adjust_for_boolean(x), dependency.get('value')))
            if actual_value in dependency_value:
                self.errors[field_id] = "This field is required"
                return
        elif dependency_relation == 'not in':
            dependency_value = list(map(lambda x: self.adjust_for_boolean(x), dependency.get('value')))
            if actual_value not in dependency_value:
                self.errors[field_id] = "This field is required"
                return

    def process_field(self, field):
        field_id = field.get('id')

        if field.get('type') == 'file_upload':
            document_exists = KYCDocument.objects.filter(
                kyc_record=self.kyc_record,
                kyc_record_file_id=field_id,
                deleted=False
            ).exists()
            value = True if document_exists else None
        else:
            value = getattr(self.kyc_record, field_id)
        if value is not None:
            return

        field_dependencies = field.get('field_dependencies')
        if isinstance(field_dependencies, Iterable):
            for dependency in field_dependencies:
                self.validate_required_field_by_dependency(field_id, dependency)
        else:
            self.errors[field_id] = "This field is required"
            return

    def process_card(self, card: Card):
        for field in card.schema:
            if not field.get('required'):
                continue

            if self.fund and self.fund.skip_net_worth_question and field.get('id') == 'net_worth':
                continue

            self.process_field(field=field)

    def process(self):
        cards = self.get_cards()
        for card in cards:
            if card.name.lower() == 'participant information':
                continue
            self.process_card(card=card)

        return {
            'is_completed': not bool(self.errors),
            'errors': self.errors
        }
