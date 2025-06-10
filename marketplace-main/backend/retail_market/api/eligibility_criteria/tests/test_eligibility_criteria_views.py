import json

from rest_framework import status
from rest_framework.reverse import reverse

from api.constants.kyc_investor_types import KYCInvestorType
from api.documents.tests.factories import DocumentFactory
from api.eligibility_criteria.blocks_data.block_ids import APPROVAL_CHECKBOX_ID, KEY_INVESTMENT_INFORMATION_ID, \
    AU_PROFESSIONAL_INVESTOR_BLOCKS_ID, NO_LOCAL_REQUIREMENT_BLOCK_ID
from api.eligibility_criteria.models import CriteriaBlockResponse, EligibilityCriteriaResponse, ResponseBlockDocument, \
    CriteriaBlock
from api.eligibility_criteria.services.create_eligibility_criteria import CreateEligibilityCriteriaService
from api.eligibility_criteria.tests.factories import FundEligibilityCriteriaFactory, ApplicationFactory
from api.users.models import RetailUser
from api.workflows.models import Task
from core.base_tests import BaseTestCase


class EligibilityCriteriaAPITestCase(BaseTestCase):

    def setUp(self) -> None:
        self.create_company()
        self.create_user()
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

    def test_create_criteria_response(self):
        self.create_eligibility_criteria_user_response()
        application = ApplicationFactory(
            user=self.user,
            company=self.company,
            fund=self.fund,
            eligibility_response=self.fund_eligibility_criteria_response
        )
        url = reverse('create-update-block-response')

        # test creation
        block_response = {'key': 'original value'}
        create_payload = {
            "eligibility_criteria_id": self.fund_eligibility_criteria.id,
            "block_id": self.fund_eligibility_criteria_block_response.block_id,
            "response_json": block_response
        }

        response = self.client.post(
            url,
            data=json.dumps(create_payload),
            content_type='application/json',
            **self.get_headers()
        )


        created_block_response_obj = CriteriaBlockResponse.objects.get(
            criteria_response=self.fund_eligibility_criteria_response.id,
            block_id=self.fund_eligibility_criteria_block_response.block_id
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(created_block_response_obj.block_id, self.fund_eligibility_criteria_block_response.block_id)
        self.assertEqual(created_block_response_obj.response_json, block_response)
        # end

        # test update
        updated_block_response = {'key': 'updated value'}
        update_payload = {
            "eligibility_criteria_id": self.fund_eligibility_criteria.id,
            "block_id": self.fund_eligibility_criteria_block_response.block_id,
            "response_json": updated_block_response
        }

        response = self.client.post(
            url,
            data=json.dumps(update_payload),
            content_type='application/json',
            **self.get_headers()
        )

        updated_block_response_obj = CriteriaBlockResponse.objects.get(
            criteria_response=self.fund_eligibility_criteria_response.id,
            block_id=self.fund_eligibility_criteria_block_response.block_id
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(updated_block_response_obj.id, self.fund_eligibility_criteria_block_response.id)
        self.assertEqual(updated_block_response_obj.response_json, updated_block_response)
        # end

    def test_user_updates_on_kycrecord_creation(self):
        url = reverse('fetch-block-response', kwargs={
            'fund_external_id': self.fund.external_id,
            'country_code': "AL",
            'vehicle_type': KYCInvestorType.INDIVIDUAL.name
        })

        # test creation
        payload = {
            "first_name": "Muhammad",
            "last_name": "Nadeem",
            "job_title": "Software Engine developer",
            "department": {"label": "Accounting", "value": "accounting"},
            "job_band": {"label": "B2", "value": "B2"}
        }

        self.assertNotEqual(payload['first_name'], self.user.first_name)
        self.assertNotEqual(payload['last_name'], self.user.last_name)

        response = self.client.post(
            url,
            data=json.dumps(payload),
            content_type='application/json',
            **self.get_headers()
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        updated_user = RetailUser.objects.get(id=self.user.id)
        self.assertEqual(payload['first_name'], updated_user.first_name)
        self.assertEqual(payload['last_name'], updated_user.last_name)

    def test_transfer_application_with_finalized_fund(self):
        self.fund.is_finalized = True
        self.fund.save()
        url = reverse('fetch-block-response', kwargs={
            'fund_external_id': self.fund.external_id,
            'country_code': "AL",
            'vehicle_type': KYCInvestorType.INDIVIDUAL.name
        })

        # test creation
        payload = {
            "first_name": "Muhammad",
            "last_name": "Nadeem",
            "job_title": "Software Engine developer",
            "department": {"label": "Accounting", "value": "accounting"},
            "job_band": {"label": "B2", "value": "B2"}
        }

        self.assertNotEqual(payload['first_name'], self.user.first_name)
        self.assertNotEqual(payload['last_name'], self.user.last_name)

        response = self.client.post(
            url,
            data=json.dumps(payload),
            content_type='application/json',
            **self.get_headers()
        )

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

        application = ApplicationFactory(
            user=self.user,
            fund=self.fund,
            company=self.company,
            is_transferred=True,
            eligibility_response=None
        )
        self.assertIsNone(application.eligibility_response)

        response = self.client.post(
            url,
            data=json.dumps(payload),
            content_type='application/json',
            **self.get_headers()
        )

        application.refresh_from_db()
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsNotNone(application.eligibility_response)
        updated_user = RetailUser.objects.get(id=self.user.id)
        self.assertEqual(payload['first_name'], updated_user.first_name)
        self.assertEqual(payload['last_name'], updated_user.last_name)

    def test_user_country_change(self):
        fund_eligibility_criteria_1 = FundEligibilityCriteriaFactory(fund=self.fund)
        fund_eligibility_criteria_2 = FundEligibilityCriteriaFactory(fund=self.fund)
        ebc_service = CreateEligibilityCriteriaService({})
        ebc_service.create_regions_countries(
            fund_criteria=fund_eligibility_criteria_1,
            country_region_codes=["CN"],
            company=self.company,
            update=True
        )

        ebc_service = CreateEligibilityCriteriaService({})
        ebc_service.create_regions_countries(
            fund_criteria=fund_eligibility_criteria_2,
            country_region_codes=["AL"],
            company=self.company,
            update=True
        )

        url = reverse('fetch-block-response', kwargs={
            'fund_external_id': self.fund.external_id,
            'country_code': "AL",
            'vehicle_type': KYCInvestorType.INDIVIDUAL.name
        })
        # test creation
        payload = {
            "first_name": "Muhammad",
            "last_name": "Nadeem",
            "job_title": "Software Engine developer",
            "department": {"label": "Accounting", "value": "accounting"},
            "job_band": {"label": "B2", "value": "B2"}
        }
        response = self.client.post(
            url,
            data=json.dumps(payload),
            content_type='application/json',
            **self.get_headers()
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        first_eligibility_criteria_response = EligibilityCriteriaResponse.objects.latest('created_at')
        first_eligibility_criteria_response.workflow.is_completed = True
        first_eligibility_criteria_response.workflow.save()
        first_eligibility_criteria_response.workflow.workflow_tasks.update(status=Task.StatusChoice.APPROVED.value)
        self.assertIsNotNone(first_eligibility_criteria_response.workflow.parent)
        self.assertTrue(first_eligibility_criteria_response.workflow.is_completed)
        self.assertFalse(
            first_eligibility_criteria_response.workflow.workflow_tasks.exclude(
                status=Task.StatusChoice.APPROVED.value
            ).exists()
        )

        url = reverse('fetch-block-response', kwargs={
            'fund_external_id': self.fund.external_id,
            'country_code': "CN",
            'vehicle_type': KYCInvestorType.INDIVIDUAL.name
        })
        # test creation
        payload = {
            "first_name": "Muhammad",
            "last_name": "Nadeem",
            "job_title": "Software Engine developer",
            "department": {"label": "Accounting", "value": "accounting"},
            "job_band": {"label": "B2", "value": "B2"}
        }
        response = self.client.post(
            url,
            data=json.dumps(payload),
            content_type='application/json',
            **self.get_headers()
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        second_eligibility_criteria_response = EligibilityCriteriaResponse.objects.latest('created_at')
        self.assertIsNotNone(second_eligibility_criteria_response.workflow.parent)

        first_eligibility_criteria_response.refresh_from_db()
        self.assertIsNone(first_eligibility_criteria_response.workflow.parent)

        url = reverse('fetch-block-response', kwargs={
            'fund_external_id': self.fund.external_id,
            'country_code': "AL",
            'vehicle_type': KYCInvestorType.INDIVIDUAL.name
        })
        # test creation
        payload = {
            "first_name": "Muhammad",
            "last_name": "Nadeem",
            "job_title": "Software Engine developer",
            "department": {"label": "Accounting", "value": "accounting"},
            "job_band": {"label": "B2", "value": "B2"}
        }
        response = self.client.post(
            url,
            data=json.dumps(payload),
            content_type='application/json',
            **self.get_headers()
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        first_eligibility_criteria_response.refresh_from_db()
        self.assertIsNotNone(first_eligibility_criteria_response.workflow.parent)
        self.assertTrue(first_eligibility_criteria_response.workflow.is_completed)
        self.assertFalse(
            first_eligibility_criteria_response.workflow.workflow_tasks.exclude(
                status=Task.StatusChoice.APPROVED.value
            ).exists()
        )

        second_eligibility_criteria_response.refresh_from_db()
        self.assertIsNone(second_eligibility_criteria_response.workflow.parent)

    def test_self_certified_kii_eligibility_criteria_response(self):
        self.create_eligibility_criteria_user_response()
        self.assertFalse(self.fund_eligibility_criteria_response.is_self_certified)
        self.assertFalse(self.fund_eligibility_criteria_response.is_approved)

        self.add_block_in_fund_criteria(
            criteria=self.fund_eligibility_criteria,
            block=self.get_block_by_str_id(str_id=KEY_INVESTMENT_INFORMATION_ID, company=self.company)
        )

        url = reverse('create-update-block-response')
        block_response = {'key': 'original value'}
        create_payload = {
            "eligibility_criteria_id": self.fund_eligibility_criteria.id,
            "block_id": self.fund_eligibility_criteria_block_response.block_id,
            "response_json": block_response
        }

        self.client.post(
            url,
            data=json.dumps(create_payload),
            content_type='application/json',
            **self.get_headers()
        )

        url = reverse("create-investment-amount", kwargs={'response_id': self.fund_eligibility_criteria_response.id})

        response = self.client.post(
            url,
            data=json.dumps({'amount': 9000, 'leverage_ratio': 3, 'leverage_option_description': ""}),
            content_type='application/json',
            **self.get_headers()
        )

        updated_fund_eligibility_criteria_response = EligibilityCriteriaResponse.objects.get(
            id=self.fund_eligibility_criteria_response.id
        )
        self.assertTrue(updated_fund_eligibility_criteria_response.is_self_certified)
        self.assertTrue(updated_fund_eligibility_criteria_response.is_approved)

    def test_self_certified_no_local_requirement_response(self):
        self.create_eligibility_criteria_user_response()
        self.assertFalse(self.fund_eligibility_criteria_response.is_self_certified)
        self.assertFalse(self.fund_eligibility_criteria_response.is_approved)

        self.add_block_in_fund_criteria(
            criteria=self.fund_eligibility_criteria,
            block=self.get_block_by_str_id(str_id=NO_LOCAL_REQUIREMENT_BLOCK_ID, company=self.company)
        )

        url = reverse("create-investment-amount", kwargs={'response_id': self.fund_eligibility_criteria_response.id})

        self.client.post(
            url,
            data=json.dumps({'amount': 9000, 'leverage_ratio': 3, 'leverage_option_description': ""}),
            content_type='application/json',
            **self.get_headers()
        )

        updated_fund_eligibility_criteria_response = EligibilityCriteriaResponse.objects.get(
            id=self.fund_eligibility_criteria_response.id
        )
        self.assertTrue(updated_fund_eligibility_criteria_response.is_self_certified)
        self.assertTrue(updated_fund_eligibility_criteria_response.is_approved)

    def test_self_certified_no_local_requirement_with_custom_smart_block(self):
        self.client.force_authenticate(self.admin_user.user)
        self.create_eligibility_criteria_user_response()
        self.assertFalse(self.fund_eligibility_criteria_response.is_self_certified)
        self.assertFalse(self.fund_eligibility_criteria_response.is_approved)

        url = reverse('admin-custom-smart-blocks')

        create_payload = {
            "fund": self.fund.id,
            "eligibility_criteria": self.fund_eligibility_criteria.id,
            "title": "cs block 01"
        }

        resp = self.client.post(
            url,
            data=json.dumps(create_payload),
            content_type='application/json',
            **self.get_headers()
        )

        self.add_block_in_fund_criteria(
            criteria=self.fund_eligibility_criteria,
            block=self.get_block_by_str_id(str_id=NO_LOCAL_REQUIREMENT_BLOCK_ID, company=self.company)
        )

        self.assertFalse(self.fund_eligibility_criteria.is_self_certified(
            criteria_blocks=self.fund_eligibility_criteria.criteria_blocks.all()
        )
        )

    def test_self_certified_ac_eligibility_criteria_response(self):
        self.create_eligibility_criteria_user_response()
        self.assertFalse(self.fund_eligibility_criteria_response.is_self_certified)
        self.assertFalse(self.fund_eligibility_criteria_response.is_approved)

        self.add_block_in_fund_criteria(
            criteria=self.fund_eligibility_criteria,
            block=self.get_block_by_str_id(str_id=APPROVAL_CHECKBOX_ID, company=self.company)
        )

        url = reverse('create-update-block-response')
        block_response = {'key': 'original value'}
        create_payload = {
            "eligibility_criteria_id": self.fund_eligibility_criteria.id,
            "block_id": self.fund_eligibility_criteria_block_response.block_id,
            "response_json": block_response
        }

        self.client.post(
            url,
            data=json.dumps(create_payload),
            content_type='application/json',
            **self.get_headers()
        )

        url = reverse("create-investment-amount", kwargs={'response_id': self.fund_eligibility_criteria_response.id})

        self.client.post(
            url,
            data=json.dumps({'amount': 9000, 'leverage_ratio': 3, 'leverage_option_description': ""}),
            content_type='application/json',
            **self.get_headers()
        )

        updated_fund_eligibility_criteria_response = EligibilityCriteriaResponse.objects.get(
            id=self.fund_eligibility_criteria_response.id
        )
        self.assertTrue(updated_fund_eligibility_criteria_response.is_self_certified)
        self.assertTrue(updated_fund_eligibility_criteria_response.is_approved)

    def test_position_update_view(self):
        self.create_eligibility_criteria_user_response()
        self.assertFalse(self.fund_eligibility_criteria_response.is_self_certified)
        self.assertFalse(self.fund_eligibility_criteria_response.is_approved)

        self.add_block_in_fund_criteria(
            criteria=self.fund_eligibility_criteria,
            block=self.get_block_by_str_id(str_id=KEY_INVESTMENT_INFORMATION_ID, company=self.company)
        )

        url = reverse('create-update-block-response')
        block_response = {'key': 'original value'}
        create_payload = {
            "eligibility_criteria_id": self.fund_eligibility_criteria.id,
            "block_id": self.fund_eligibility_criteria_block_response.block_id,
            "response_json": block_response
        }

        self.client.post(
            url,
            data=json.dumps(create_payload),
            content_type='application/json',
            **self.get_headers()
        )

        url = reverse(
            "criteria-response-update",
            kwargs={'pk': self.fund_eligibility_criteria_response.id}
        )
        response = self.client.patch(
            url,
            data=json.dumps({'last_position': 2}),
            content_type='application/json',
            **self.get_headers()
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)


        url = reverse("create-investment-amount", kwargs={'response_id': self.fund_eligibility_criteria_response.id})

        response = self.client.post(
            url,
            data=json.dumps({'amount': 9000, 'leverage_ratio': 3, 'leverage_option_description': ""}),
            content_type='application/json',
            **self.get_headers()
        )

        self.fund_eligibility_criteria_response.refresh_from_db()
        self.assertEqual(self.fund_eligibility_criteria_response.last_position, 2)


    def test_response_block_document_delete(self):
        self.create_eligibility_criteria_user_response()
        url = reverse('create-update-block-response')

        option = {
            "id": "au.pi.1",
            "text": "I hold an Australian financial services license.",
            "logical_value": True,
            "require_files": True,
            "requirement_text": "Please upload a copy of your financial services license.",
            "require_internal_review": True
        }

        block_response = {
            "value": "au.pi.1",
            "au.pi.1_option": option
        }

        au_pi_block = self.add_block_in_fund_criteria(
            criteria=self.fund_eligibility_criteria,
            block=self.get_block_by_str_id(str_id=AU_PROFESSIONAL_INVESTOR_BLOCKS_ID, company=self.company)
        )

        application = ApplicationFactory(
            user=self.user,
            company=self.company,
            fund=self.fund,
            eligibility_response=self.fund_eligibility_criteria_response
        )

        create_payload = {
            "eligibility_criteria_id": self.fund_eligibility_criteria.id,
            "block_id": au_pi_block.id,
            "response_json": block_response
        }

        response = self.client.post(
            url,
            data=json.dumps(create_payload),
            content_type='application/json',
            **self.get_headers()
        )

        created_block_response_obj = CriteriaBlockResponse.objects.get(
            criteria_response=self.fund_eligibility_criteria_response.id,
            block_id=au_pi_block.id
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        documents_url = reverse('fetch-block-documents', kwargs={'pk': self.fund_eligibility_criteria_response.id})
        documents_response = self.client.get(documents_url)
        self.assertEqual(documents_response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(documents_response.data[0]['documents']), 0)

        document = DocumentFactory(
            document_path=self.create_document_path(),
            company=self.company,
            uploaded_by_user=self.company_user,
            uploaded_by=self.company_user,
        )
        ResponseBlockDocument.objects.create(
            document=document,
            response_block_id=created_block_response_obj.id,
            payload={'options': [option]}
        )

        documents_response = self.client.get(documents_url)
        self.assertEqual(documents_response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(documents_response.data[0]['documents']), 1)

        self.delete_document(document_id=document.id)

        documents_response = self.client.get(documents_url)
        self.assertEqual(documents_response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(documents_response.data[0]['documents']), 0)

        self.assertEqual(ResponseBlockDocument.objects.count(), 0)
        self.assertEqual(ResponseBlockDocument.include_deleted.count(), 1)
