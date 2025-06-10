import json

from rest_framework import status
from rest_framework.reverse import reverse

from api.applications.tests.factories import ApplicationFactory
from api.eligibility_criteria.models import CriteriaBlock, \
    CustomSmartBlockField, CriteriaBlockResponse
from api.eligibility_criteria.services.create_eligibility_criteria import CreateEligibilityCriteriaService
from core.base_tests import BaseTestCase


class EligibilityCriteriaCustomBlockAPITestCase(BaseTestCase):

    def setUp(self) -> None:
        self.create_company()
        self.create_user()
        self.client.force_authenticate(self.admin_user.user)
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

    def test_custom_block_no_required_document(self):
        url = reverse('admin-custom-smart-blocks')

        create_payload = {
            "fund": self.fund.id,
            "eligibility_criteria": self.fund_eligibility_criteria.id,
            "title": "cs block 01"
        }

        response = self.client.post(
            url,
            data=json.dumps(create_payload),
            content_type='application/json',
            **self.get_headers()
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        criteria_block_qs = CriteriaBlock.objects.filter(
            criteria=self.fund_eligibility_criteria,
            custom_block__isnull=False
        )
        self.assertEqual(criteria_block_qs.count(), 1)
        criteria_block = criteria_block_qs.first()
        custom_block_id = criteria_block.custom_block_id

        field_payload = {
            "block": custom_block_id,
            "title": "field_01",
            "marks_as_eligible": True,
            "reviewers_required": ["Knowledgeable Employee Eligibility Reviewer"],
            "required_documents": {"title": "", "description": ""}
        }

        url = reverse('admin-custom-smart-block-fields', kwargs={'block_id': custom_block_id})
        response = self.client.post(
            url,
            data=json.dumps(field_payload),
            content_type='application/json',
            **self.get_headers()
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        field_qs = CustomSmartBlockField.objects.filter(block_id=custom_block_id)
        self.assertEqual(field_qs.count(), 1)

        custom_field = field_qs.first()
        self.assertFalse(custom_field.required_documents)

        self.client.force_authenticate(self.user)
        self.create_eligibility_criteria_user_response()
        application = ApplicationFactory(
            user=self.user,
            company=self.company,
            fund=self.fund,
            eligibility_response=self.fund_eligibility_criteria_response
        )
        url = reverse('create-update-block-response')

        # test creation
        block_response = {
            "block_id": criteria_block.id,
            "response_json": {
                f'{custom_field.id}': True,
                f'{custom_field.id}_option':
                    {
                        "id": custom_field.id,
                        "title": custom_field.title,
                        "marks_as_eligible": custom_field.marks_as_eligible,
                        "reviewers_required": [
                            "Knowledgeable Employee Eligibility Reviewer"],
                        "required_documents": custom_field.required_documents,
                        "block": custom_block_id
                    },

            },
            "eligibility_criteria_id": self.fund_eligibility_criteria.id}

        response = self.client.post(
            url,
            data=json.dumps(block_response),
            content_type='application/json',
            **self.get_headers()
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        created_block_response_exists = CriteriaBlockResponse.objects.filter(
            criteria_response=self.fund_eligibility_criteria_response.id,
            block_id=criteria_block.id
        ).exists()
        self.assertTrue(created_block_response_exists)

        documents_requirement_url = reverse(
            'fetch-block-documents',
            kwargs={'pk': self.fund_eligibility_criteria_response.id}
        )
        response = self.client.get(
            documents_requirement_url,
            content_type='application/json',
            **self.get_headers()
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, [])

    def test_custom_block_with_required_document(self):
        url = reverse('admin-custom-smart-blocks')




        create_payload = {
            "fund": self.fund.id,
            "eligibility_criteria": self.fund_eligibility_criteria.id,
            "title": "cs block 02"
        }

        response = self.client.post(
            url,
            data=json.dumps(create_payload),
            content_type='application/json',
            **self.get_headers()
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        criteria_block_qs = CriteriaBlock.objects.filter(
            criteria=self.fund_eligibility_criteria,
            custom_block__isnull=False
        )
        self.assertEqual(criteria_block_qs.count(), 1)
        criteria_block = criteria_block_qs.first()
        custom_block_id = criteria_block.custom_block_id

        document_non_required_field_payload = {
            "block": custom_block_id,
            "title": "field_01",
            "marks_as_eligible": True,
            "reviewers_required": ["Knowledgeable Employee Eligibility Reviewer"],
            "required_documents": {"title": "", "description": ""}
        }

        url = reverse('admin-custom-smart-block-fields', kwargs={'block_id': custom_block_id})
        response = self.client.post(
            url,
            data=json.dumps(document_non_required_field_payload),
            content_type='application/json',
            **self.get_headers()
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        document_required_field_payload = {
            "block": custom_block_id,
            "title": "field_02",
            "marks_as_eligible": True,
            "reviewers_required": ["Knowledgeable Employee Eligibility Reviewer"],
            "required_documents": {"title": "Document Required", "description": "Description"}
        }

        url = reverse('admin-custom-smart-block-fields', kwargs={'block_id': custom_block_id})
        response = self.client.post(
            url,
            data=json.dumps(document_required_field_payload),
            content_type='application/json',
            **self.get_headers()
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        field_qs = CustomSmartBlockField.objects.filter(block_id=custom_block_id)
        self.assertEqual(field_qs.count(), 2)

        custom_field_no_doc = field_qs.earliest('created_at')
        self.assertFalse(custom_field_no_doc.required_documents)

        custom_field_with_doc = field_qs.latest('created_at')
        self.assertEqual(
            custom_field_with_doc.required_documents,
            document_required_field_payload['required_documents']
        )

        self.client.force_authenticate(self.user)
        self.create_eligibility_criteria_user_response()
        application = ApplicationFactory(
            user=self.user,
            company=self.company,
            fund=self.fund,
            eligibility_response=self.fund_eligibility_criteria_response
        )
        url = reverse('create-update-block-response')

        # test creation
        block_response = {
            "block_id": criteria_block.id,
            "response_json": {
                f'{custom_field_no_doc.id}': True,
                f'{custom_field_no_doc.id}_option':
                    {
                        "id": custom_field_no_doc.id,
                        "title": custom_field_no_doc.title,
                        "marks_as_eligible": custom_field_no_doc.marks_as_eligible,
                        "reviewers_required": [
                            "Knowledgeable Employee Eligibility Reviewer"],
                        "required_documents": custom_field_no_doc.required_documents,
                        "block": custom_block_id
                    },
                f'{custom_field_with_doc.id}': True,
                f'{custom_field_with_doc.id}_option':
                    {
                        "id": custom_field_with_doc.id,
                        "title": custom_field_with_doc.title,
                        "marks_as_eligible": custom_field_with_doc.marks_as_eligible,
                        "reviewers_required": [
                            "Knowledgeable Employee Eligibility Reviewer"],
                        "required_documents": custom_field_with_doc.required_documents,
                        "block": custom_block_id
                    },

            },
            "eligibility_criteria_id": self.fund_eligibility_criteria.id}

        response = self.client.post(
            url,
            data=json.dumps(block_response),
            content_type='application/json',
            **self.get_headers()
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        created_block_response_exists = CriteriaBlockResponse.objects.filter(
            criteria_response=self.fund_eligibility_criteria_response.id,
            block_id=criteria_block.id
        ).exists()
        self.assertTrue(created_block_response_exists)

        documents_requirement_url = reverse(
            'fetch-block-documents',
            kwargs={'pk': self.fund_eligibility_criteria_response.id}
        )
        response = self.client.get(
            documents_requirement_url,
            content_type='application/json',
            **self.get_headers()
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            response.data[0]['requirement_text'],
            document_required_field_payload['required_documents']['description']
        )

    def test_duplicate_custom_blocks(self):
        url = reverse('admin-custom-smart-blocks')

        payload = {
            "fund": self.fund.id,
            "eligibility_criteria": self.fund_eligibility_criteria.id,
            "title": "custom smart block"
        }

        response_1 = self.client.post(
            url,
            data=json.dumps(payload),
            content_type='application/json',
            **self.get_headers()
        )
        self.assertEqual(response_1.status_code, status.HTTP_201_CREATED)

        response_2 = self.client.post(
            url,
            data=json.dumps(payload),
            content_type='application/json',
            **self.get_headers()
        )

        self.assertEqual(response_2.status_code, status.HTTP_400_BAD_REQUEST)