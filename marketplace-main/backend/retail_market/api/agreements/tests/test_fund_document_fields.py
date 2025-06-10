import json

from rest_framework import status
from rest_framework.reverse import reverse

from api.admin_users.tests.factories import AdminUserFactory
from api.agreements.services.application_data.get_application_values import \
    GetApplicationValuesService
from api.documents.models import FundDocument
from api.documents.tests.factories import DocumentFactory
from api.eligibility_criteria.models import (CriteriaBlock, CustomSmartBlock,
                                             CustomSmartBlockField)
from api.eligibility_criteria.services.create_eligibility_criteria import \
    CreateEligibilityCriteriaService
from core.base_tests import BaseTestCase


class TestFundDocumentsFields(BaseTestCase):

    def setUp(self) -> None:
        self.create_company()
        self.create_user()
        self.admin_user = AdminUserFactory(company=self.company, user=self.user)
        self.client.force_authenticate(self.user)
        self.create_currency()
        self.setup_fund(company=self.company)
        self.create_card_workflow(self.company)
        self.create_criteria_region_codes(self.fund_eligibility_criteria, ["AL"], self.company)
        _ebc_service = CreateEligibilityCriteriaService({})
        _ebc_service.create_regions_countries(
            fund_criteria=self.fund_eligibility_criteria,
            country_region_codes=["AL"],
            company=self.company,
            update=True
        )

        _ebc_service.create_initial_blocks(fund_criteria=self.fund_eligibility_criteria)
        _ebc_service.create_final_step_block(fund_criteria=self.fund_eligibility_criteria)

    def test_retrieve_fund_document_fields(self):
        url = reverse('admin-funds-documents-fields', kwargs={'fund_external_id': self.fund.external_id})

        response = self.client.get(url)
        field_data = json.loads(response.data)
        field_data = field_data['fields']

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreater(len(field_data['aml_kyc_details']), 0)
        self.assertGreater(len(field_data['application_details']), 0)
        self.assertGreater(len(field_data['banking_details']), 0)
        self.assertGreater(len(field_data['eligibility_criteria_details']), 0)
        self.assertGreater(len(field_data['gp_signer_details']), 0)
        self.assertGreater(len(field_data['investment_amount_details']), 0)
        self.assertGreater(len(field_data['tax_details']), 0)

    def check_field(self, fields, field_id):
        for field in fields:
            if field['id'] == field_id:
                return True
        return False

    def get_field(self, fields, field_id):
        for field in fields:
            if field['id'] == field_id:
                return field
        return None

    def test_retrieve_fund_document_fields_with_custom_smart_blocks(self):
        custom_smart_block = CustomSmartBlock.objects.create(
            fund=self.fund,
            company=self.fund.company,
            eligibility_criteria=self.fund_eligibility_criteria,
            created_by=self.admin_user,
            title='title'
        )
        custom_smart_block_field = CustomSmartBlockField.objects.create(
            block=custom_smart_block,
            title='new-field'
        )
        CriteriaBlock.objects.create(
            criteria=self.fund_eligibility_criteria,
            custom_block=custom_smart_block
        )
        csb_field_id = f'ec-csb-{custom_smart_block.title}-{custom_smart_block_field.id}'
        url = reverse('admin-funds-documents-fields', kwargs={'fund_external_id': self.fund.external_id})

        response = self.client.get(url)
        fieldData = json.loads(response.data)
        fieldData = fieldData['fields']
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(self.check_field(fieldData['eligibility_criteria_details'], csb_field_id), True)

    def test_gp_signer_fields_when_sign_required(self):
        document = DocumentFactory(
            document_path=self.create_document_path(),
            company=self.company
        )
        fund_document = FundDocument.objects.create(
            document=document,
            fund=self.fund,
            require_signature=True,
            require_gp_signature=True,
            gp_signer=self.admin_user
        )
        application = self.create_application(
            fund=self.fund,
            company_user=self.company_user
        )

        fields = GetApplicationValuesService(application=application, document=fund_document).get()
        fund_values = fields['fund_values']

        self.assertIsNotNone(self.get_field(fund_values, 'fund-gp_signer').get('value'))
        self.assertNotEqual(self.get_field(fund_values, 'fund-gp_signer_name').get('value'), '')
        self.assertNotEqual(self.get_field(fund_values, 'fund-gp_signer_title').get('value'), '')

    def test_gp_signer_fields_when_sign_not_required(self):
        document = DocumentFactory(
            document_path=self.create_document_path(),
            company=self.company
        )
        fund_document = FundDocument.objects.create(
            document=document,
            fund=self.fund,
        )
        application = self.create_application(
            fund=self.fund,
            company_user=self.company_user
        )

        fields = GetApplicationValuesService(application=application, document=fund_document).get()
        fund_values = fields['fund_values']

        self.assertIsNone(self.get_field(fund_values, 'fund-gp_signer').get('value'))
        self.assertEqual(self.get_field(fund_values, 'fund-gp_signer_name').get('value'), '')
        self.assertEqual(self.get_field(fund_values, 'fund-gp_signer_title').get('value'), '')
