from django.test import SimpleTestCase
from api.kyc_records.serializers import KYCSerializer


class KYCRequiredFieldsValidationTestCase(SimpleTestCase):

    def test_field_value_is_present(self):
        attrs = {'id_issuing_country': '232', 'id_document_type': 1}
        field = {'id': 'id_document_type'}
        errors = {}
        KYCSerializer.validate_required_field(field, errors, attrs)
        self.assertEqual(errors, {}, 'no errors should be found')

    def test_field_value_is_none(self):
        attrs = {'id_issuing_country': '232', 'id_document_type': None}
        field = {'id': 'id_document_type'}
        errors = {}
        KYCSerializer.validate_required_field(field, errors, attrs)
        self.assertEqual(errors, {'id_document_type': 'This field is required'}, 'id doc type is required')

    def test_field_value_is_missing(self):
        attrs = {'id_issuing_country': '232'}
        field = {'id': 'id_document_type'}
        errors = {}
        KYCSerializer.validate_required_field(field, errors, attrs)
        self.assertEqual(errors, {'id_document_type': 'This field is required'}, 'id doc type is required')

    def test_field_value_with_dependency_equals(self):
        field = {
            'id': 'id_document_type',
            'field_dependencies': [
                {
                    'field': 'id_issuing_country',
                    'relation': 'equals',
                    'value': 232
                }
            ]
        }

        errors = {}
        attrs = {'id_issuing_country': '232', 'id_document_type': 1}
        KYCSerializer.validate_required_field(field, errors, attrs)
        self.assertEqual(errors, {}, 'id doc type is present')

        errors = {}
        attrs = {'id_issuing_country': '232', 'id_document_type': None}
        KYCSerializer.validate_required_field(field, errors, attrs)
        self.assertEqual(errors, {'id_document_type': 'This field is required'}, 'id doc type is required')

        errors = {}
        attrs = {'id_issuing_country': '232'}
        KYCSerializer.validate_required_field(field, errors, attrs)
        self.assertEqual(errors, {'id_document_type': 'This field is required'}, 'id doc type is required')

    def test_field_value_with_dependency_not_equals(self):
        field = {
            'id': 'id_document_type',
            'field_dependencies': [
                {
                    'field': 'id_issuing_country',
                    'relation': 'not equals',
                    'value': 232
                }
            ]
        }

        errors = {}
        attrs = {'id_issuing_country': '231', 'id_document_type': 1}
        KYCSerializer.validate_required_field(field, errors, attrs)
        self.assertEqual(errors, {}, 'id doc type is present')

        errors = {}
        attrs = {'id_issuing_country': '231', 'id_document_type': None}
        KYCSerializer.validate_required_field(field, errors, attrs)
        self.assertEqual(errors, {'id_document_type': 'This field is required'}, 'id doc type is required')

        errors = {}
        attrs = {'id_issuing_country': '231'}
        KYCSerializer.validate_required_field(field, errors, attrs)
        self.assertEqual(errors, {'id_document_type': 'This field is required'}, 'id doc type is required')

    def test_field_value_with_dependency_in(self):
        field = {
            'id': 'id_document_type',
            'field_dependencies': [
                {
                    'field': 'id_issuing_country',
                    'relation': 'in',
                    'value': ['1', '232', '2']
                }
            ]
        }

        errors = {}
        attrs = {'id_issuing_country': '232', 'id_document_type': 1}
        KYCSerializer.validate_required_field(field, errors, attrs)
        self.assertEqual(errors, {}, 'id doc type is present')

        errors = {}
        attrs = {'id_issuing_country': '232', 'id_document_type': None}
        KYCSerializer.validate_required_field(field, errors, attrs)
        self.assertEqual(errors, {'id_document_type': 'This field is required'}, 'id doc type is required')

        errors = {}
        attrs = {'id_issuing_country': '232'}
        KYCSerializer.validate_required_field(field, errors, attrs)
        self.assertEqual(errors, {'id_document_type': 'This field is required'}, 'id doc type is required')

    def test_field_value_with_dependency_not_in(self):
        field = {
            'id': 'id_document_type',
            'field_dependencies': [
                {
                    'field': 'id_issuing_country',
                    'relation': 'not in',
                    'value': ['231', '233', '234']
                }
            ]
        }

        errors = {}
        attrs = {'id_issuing_country': '232', 'id_document_type': 1}
        KYCSerializer.validate_required_field(field, errors, attrs)
        self.assertEqual(errors, {}, 'id doc type is present')

        errors = {}
        attrs = {'id_issuing_country': '232', 'id_document_type': None}
        KYCSerializer.validate_required_field(field, errors, attrs)
        self.assertEqual(errors, {'id_document_type': 'This field is required'}, 'id doc type is required')

        errors = {}
        attrs = {'id_issuing_country': '232'}
        KYCSerializer.validate_required_field(field, errors, attrs)
        self.assertEqual(errors, {'id_document_type': 'This field is required'}, 'id doc type is required')