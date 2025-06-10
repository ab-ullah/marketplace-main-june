import json

from rest_framework import status
from rest_framework.reverse import reverse

from api.eligibility_criteria.models import EligibilityCriteriaResponse, CriteriaBlockResponse, InvestmentAmount
from api.partners.tests.factories import UserFactory, CompanyUserFactory, FundFactory
from core.base_tests import BaseTestCase


class InvestmentAmountAPITestCase(BaseTestCase):

    def setUp(self) -> None:
        self.create_company()
        self.create_user()
        self.client.force_authenticate(self.admin_user.user)
        self.create_currency()

        self.setup_fund(company=self.company)
        self.create_card_workflow(self.company)
        self.create_application()

        # Setting up another fund
        self.setup_fund(company=self.company)
        self.create_card_workflow(self.company)
        self.create_application()

        self.user = UserFactory()
        self.company_user = CompanyUserFactory(user=self.user, company=self.company)
        self.create_application()

    def test_get_investment_amount_api(self):
        url = reverse('get-fund-investment-amount', kwargs={'fund_external_id': self.fund.external_id})

        response = self.client.get(
            url,
            **self.get_headers()
        )

        users_recent_responses = EligibilityCriteriaResponse.objects.filter(
            criteria__fund=self.fund
        ).select_related(
            'investment_amount'
        ).order_by(
            'response_by',
            '-id'
        ).distinct(
            'response_by'
        )
        response_data = response.data

        self.assertEqual(len(users_recent_responses), 2)

        expected_amount = (
                users_recent_responses[0].investment_amount.amount + users_recent_responses[1].investment_amount.amount
        )
        expected_leverage = (
                float(
                    users_recent_responses[0].investment_amount.amount
                ) * users_recent_responses[0].investment_amount.leverage_ratio +
                float(
                    users_recent_responses[1].investment_amount.amount
                ) * users_recent_responses[1].investment_amount.leverage_ratio
        )

        self.assertEqual(response_data['amount'], expected_amount)
        self.assertEqual(response_data['leverage'], expected_leverage)

        expected_total_gross_investment = round(float(expected_amount) + expected_leverage, ndigits=3)
        expected_total_by_fund_size = round(expected_total_gross_investment / float(self.fund.target_fund_size), ndigits=3)
        expected_percentage_by_fund_size = round(
            expected_leverage * 100 / float(self.fund.target_fund_size),
            ndigits=2
        )

        self.assertEqual(response_data['total_gross_investment'], expected_total_gross_investment)
        self.assertEqual(response_data['total_by_fund_size'], expected_total_by_fund_size)
        self.assertEqual(response_data['percentage_by_fund_size'], expected_percentage_by_fund_size)

    def test_update_investment_amount_api(self):
        investment_amount = InvestmentAmount.objects.first()

        url = reverse('investment-amount-update', kwargs={'pk': investment_amount.id})

        updated_amount = 234000000.000
        updated_leverage_ratio = 5.0
        payload = {"amount": updated_amount, "leverage_ratio": updated_leverage_ratio}
        response = self.client.patch(
            url,
            payload,
            **self.get_headers()
        )

        self.assertNotEqual(updated_amount, investment_amount.amount)
        self.assertNotEqual(updated_leverage_ratio, investment_amount.leverage_ratio)

        self.assertEqual(updated_amount, response.data['amount'])
        self.assertEqual(updated_leverage_ratio, response.data['leverage_ratio'])

