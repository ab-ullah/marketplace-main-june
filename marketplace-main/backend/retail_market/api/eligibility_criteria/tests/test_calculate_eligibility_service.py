import json

from rest_framework.reverse import reverse

from api.eligibility_criteria.blocks_data.block_ids import (
    APPROVAL_CHECKBOX_ID, AU_WHOLESALE_CLIENT_ID,
    KEY_INVESTMENT_INFORMATION_ID)
from api.eligibility_criteria.services.calculate_eligibility import \
    CalculateEligibilityService
from api.eligibility_criteria.services.create_eligibility_criteria import \
    CreateEligibilityCriteriaService
from api.eligibility_criteria.tests.factories import ApplicationFactory
from core.base_tests import BaseTestCase


class CalculateEligibilityTestCase(BaseTestCase):

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

    def test_calculate_eligibility_decision_with_single_block(self):
        self.create_eligibility_criteria_user_response()

        added_block = self.add_block_in_fund_criteria(
            criteria=self.fund_eligibility_criteria,
            block=self.get_block_by_str_id(str_id=KEY_INVESTMENT_INFORMATION_ID, company=self.company)
        )
        application = ApplicationFactory(
            user=self.user,
            company=self.company,
            fund=self.fund,
            eligibility_response=self.fund_eligibility_criteria_response
        )
        url = reverse('create-update-block-response')

        for response_value in [True, ]:
            block_response = {'key': 'original value', 'value': response_value}
            create_payload = {
                "eligibility_criteria_id": self.fund_eligibility_criteria.id,
                "block_id": added_block.id,
                "response_json": block_response
            }
            self.client.post(
                url,
                data=json.dumps(create_payload),
                content_type='application/json',
                **self.get_headers()
            )

            service = CalculateEligibilityService(self.fund_eligibility_criteria_response)
            decision = service.calculate()
            self.assertEqual(decision, response_value)

    def test_calculate_eligibility_with_multiple_blocks(self):
        self.create_eligibility_criteria_user_response()
        self.assertEqual(self.fund_eligibility_criteria_response.is_financial, False)

        application = ApplicationFactory(
            user=self.user,
            company=self.company,
            fund=self.fund,
            eligibility_response=self.fund_eligibility_criteria_response
        )

        option = {
            'id': 'au.wc.1',
            'text': "Yes I am ""wholesale client "" by virtue of my experience as an investor: \n I have previous experience in using financial services and investing in financial products that allows me to assess:\n(a) the merits of the product or service; and \n (b) the value of the product or service; and \n (c) the risks associated with holding the product; and \n (d) the my own information needs; and \n (e) the adequacy of the information given by the licensee and the product issuer.",
            'logical_value': True,
            'is_financial': True,
        }

        data = {
            'expected_decision': True,
            'expected_is_financial': True,
            'block': [
                {
                    'type': APPROVAL_CHECKBOX_ID,
                    'response': {
                        'value': True,
                    }
                },
                {
                    'type': AU_WHOLESALE_CLIENT_ID,
                    'response': {
                        'value': 'au.wc.1',
                        'au.wc.1_option': option
                    }
                }
            ]
        }

        for block in data['block']:
            added_block = self.add_block_in_fund_criteria(
                criteria=self.fund_eligibility_criteria,
                block=self.get_block_by_str_id(str_id=block['type'], company=self.company)
            )

            url = reverse('create-update-block-response')
            create_payload = {
                "eligibility_criteria_id": self.fund_eligibility_criteria.id,
                "block_id": added_block.id,
                "response_json": block['response']
            }

            self.client.post(
                url,
                data=json.dumps(create_payload),
                content_type='application/json',
                **self.get_headers()
            )

        service = CalculateEligibilityService(self.fund_eligibility_criteria_response)
        decision = service.calculate()

        self.fund_eligibility_criteria_response.refresh_from_db()

        self.assertEqual(decision, data['expected_decision'])
        self.assertEqual(self.fund_eligibility_criteria_response.is_financial, data['expected_is_financial'])
