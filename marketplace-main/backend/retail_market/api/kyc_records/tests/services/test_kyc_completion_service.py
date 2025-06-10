import uuid

from django.utils import timezone

from api.cards.config.company_specific_workflows import get_workflow_creator_for_company
from api.cards.models import Workflow as CardWorkFlow
from api.companies.models import Company
from api.documents.models import KYCDocument
from api.documents.tests.factories import DocumentFactory
from api.geographics.models import Country
from api.kyc_records.models import KYCRecord
from api.kyc_records.services.check_kyc_completion import CheckKycCompletion
from api.kyc_records.tests.factories import KYCRecordFactory
from api.partners.tests.factories import FundFactory
from core.base_tests import BaseTestCase


class KYCRequiredFieldsValidationTestCase(BaseTestCase):
    def setUp(self) -> None:
        self.company = Company.objects.get(name='sidecar')
        self.create_countries()
        kyc_workflow_creator = get_workflow_creator_for_company(company=self.company)
        kyc_workflow_creator(company=self.company)

    def test_kyc_completion_detection(self):
        company = self.company
        workflow = CardWorkFlow.objects.get(company=company, slug='kyc-aml-individual-sidecar')
        kyc = KYCRecordFactory(
            company=company,
            workflow=workflow
        )  # type: KYCRecord
        result = CheckKycCompletion(kyc_record=kyc).process()
        self.assertFalse(result['is_completed'])

        country = Country.objects.first()
        complete_data = {'status': 2, 'kyc_investor_type': 1, 'first_name': 'omair', 'last_name': 'shamshir',
                         'employment_status': None, 'employer_name': None, 'occupation': 'dev',
                         'uk_national_insurance_number': '', 'source_of_wealth': None, 'source_of_funds': 'savings',
                         'date_of_birth': '2023-08-16', 'is_lasalle_or_jll_employee': False,
                         'pollitically_exposed_person': False, 'purpose_of_the_subscription': 'exposure',
                         'purpose_of_the_subscription_other': None, 'phone_number': 'asdadasd',
                         'economic_beneficiary': 'own_behalf', 'source_of_funds_other': None,
                         'source_of_funds_sale': None, 'source_of_funds_profession': None, 'is_us_citizen': False,
                         'applicant_owned_by_another_entity': None, 'direct_parent_owned_by_another_entity': None,
                         'applicant_organized_for_specific_purpose_of_investing': None, 'net_worth': '234234',
                         'home_address': '234234', 'home_city': '234234', 'home_state': None, 'home_region': '234234',
                         'home_zip': '234234234', 'home_phone_number': None, 'home_id_type': None,
                         'id_document_type': 4, 'id_expiration_date': None, 'number_of_id': '234234234',
                         'entity_name': None, 'entity_title': None, 'general_partnership_is_a_private_company': None,
                         'department': 'asset-management', 'job_band': 'Business Support 5', 'invite_only': False,
                         'max_leverage_ratio': None, 'job_title': 'dev', 'date_of_formation': None,
                         'nature_of_business': None, 'registered_address': None, 'one_director': None,
                         'approved': False, 'citizenship_country': country, 'jurisdiction_state': None,
                         'home_country': country, 'eligibility_country': country, 'id_issuing_country': country,
                         'kyc_entity': None, 'office_location': country, 'investor_location': country,
                         'jurisdiction': None}

        for k, v in complete_data.items():
            setattr(kyc, k, v)

        result = CheckKycCompletion(kyc_record=kyc).process()
        self.assertEqual(set(result['errors'].keys()), {'id_doc_image', 'proof_of_address'})
        self.assertFalse(result['is_completed'])

        kyc.is_lasalle_or_jll_employee = True
        kyc.save()
        result = CheckKycCompletion(kyc_record=kyc).process()
        self.assertEqual(set(result['errors'].keys()), {'id_doc_image'})
        self.assertFalse(result['is_completed'])

        kyc.is_lasalle_or_jll_employee = False
        kyc.save()

        kyc.id_document_type = 1
        kyc.save()

        result = CheckKycCompletion(kyc_record=kyc).process()
        self.assertEqual(set(result['errors'].keys()), {'id_doc_image', 'id_expiration_date', 'proof_of_address'})
        self.assertFalse(result['is_completed'])

        KYCDocument.objects.create(
            kyc_record=kyc,
            document=DocumentFactory(),
            partner_id=uuid.uuid4().hex,
            kyc_record_file_id='id_doc_image'
        )

        KYCDocument.objects.create(
            kyc_record=kyc,
            document=DocumentFactory(),
            partner_id=uuid.uuid4().hex,
            kyc_record_file_id='proof_of_address'
        )

        result = CheckKycCompletion(kyc_record=kyc).process()
        self.assertEqual(set(result['errors'].keys()), {'id_expiration_date'})
        self.assertFalse(result['is_completed'])

        kyc.id_expiration_date = timezone.now().date()
        kyc.save()

        result = CheckKycCompletion(kyc_record=kyc).process()
        self.assertTrue(result['is_completed'])

        kyc.net_worth = None
        kyc.save()
        result = CheckKycCompletion(kyc_record=kyc).process()
        self.assertFalse(result['is_completed'])

        fund = FundFactory(company=company)
        fund.skip_net_worth_question = True
        fund.save()

        result = CheckKycCompletion(kyc_record=kyc, fund=fund).process()
        self.assertTrue(result['is_completed'])
