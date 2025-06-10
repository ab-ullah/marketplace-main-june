from django.core.exceptions import ValidationError
from rest_framework.fields import CharField

from api.dsls.filter_lang import get_filter_lang


class FilterLangCharField(CharField):
    def __init__(self, *args, **kwargs):
        self.grammar = get_filter_lang(kwargs.get('debug', False))
        self.validators.append(self.validate)
        super().__init__(*args, **kwargs)

    def validate(self, value):
        # Use the metamodel to parse the input value
        try:
            self.grammar.model_from_str(value)
        except Exception as e:
            # If the input value does not match the grammar, raise a validation error
            raise ValidationError(str(e))

        return value

