import json

from django.urls import reverse
from rest_framework import status

from api.constants.kyc_investor_types import KYCInvestorType
from api.eligibility_criteria.models import InvestmentAmount, EligibilityCriteriaResponse
from api.eligibility_criteria.services.create_eligibility_criteria import CreateEligibilityCriteriaService
from api.eligibility_criteria.tests.factories import FundEligibilityCriteriaFactory
from core.base_tests import BaseTestCase


class EligibilityCriteriaCountrySwitchAPITestCase(BaseTestCase):

    def setUp(self) -> None:
        self.create_company()
        self.create_user()
        self.client.force_authenticate(self.user)
        self.create_currency()
        self.create_fund(company=self.company)
        self.create_card_workflow(self.company)

    def create_criteria(self, country_code):
        eligibility_criteria = FundEligibilityCriteriaFactory(fund=self.fund)
        self.create_criteria_region_codes(eligibility_criteria, [country_code], self.company)
        _ebc_service = CreateEligibilityCriteriaService({})
        _ebc_service.create_regions_countries(
            fund_criteria=eligibility_criteria,
            country_region_codes=[country_code],
            company=self.company,
            update=True
        )

        _ebc_service.create_initial_blocks(fund_criteria=eligibility_criteria)
        _ebc_service.create_final_step_block(fund_criteria=eligibility_criteria)
        return eligibility_criteria

    def test_country_switching(self):
        self.create_criteria(country_code='AL')
        self.create_criteria(country_code='DZ')

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

        investment_amount_count = InvestmentAmount.objects.count()
        self.assertEqual(investment_amount_count, 1)
        response_count = EligibilityCriteriaResponse.objects.count()
        self.assertEqual(response_count, 1)

        # Apply with a different country
        url = reverse('fetch-block-response', kwargs={
            'fund_external_id': self.fund.external_id,
            'country_code': "DZ",
            'vehicle_type': KYCInvestorType.INDIVIDUAL.name
        })

        response = self.client.post(
            url,
            data=json.dumps(payload),
            content_type='application/json',
            **self.get_headers()
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        investment_amount_count = InvestmentAmount.objects.count()
        self.assertEqual(investment_amount_count, 1)
        response_count = EligibilityCriteriaResponse.objects.count()
        self.assertEqual(response_count, 2)
