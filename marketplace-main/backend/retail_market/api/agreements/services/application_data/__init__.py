from dataclasses import dataclass


@dataclass
class SubscriptionField:
    id: str
    field_name: str
    type: str
    is_foreign_key: bool = False
    foreign_model_field: str = 'name'
    required: bool = False
    text: str = ''

    def to_json(self):
        return {
            'id': self.id,
            'field_name': self.field_name,
            'type': self.type,
            'is_foreign_key': self.is_foreign_key,
            'foreign_model_field': self.foreign_model_field,
            'required': self.required,
            'text': self.text
        }
