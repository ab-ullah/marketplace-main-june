from rest_framework import status
from rest_framework.reverse import reverse
from typing import List

from api.carry_pools.entities import Allocation
from api.carry_pools.models import Deal, DealCarryPlan, CarryPlan, CarryPool, FundCarryPlan
from api.carry_pools.tests.factories import DealFactory, VestingScheduleFactory

from core.base_tests import BaseTestCase


class DealsAPITestCase(BaseTestCase):
    def setUp(self):
        self.create_user()
        self.client.force_authenticate(self.admin_user.user)
        self.create_fund(company=self.company)

    def test_deals_list_create(self):
        url = reverse('carry-deals')

        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # create without fund
        request_data = {
            "name": "Hotel",
            "estimated_value": 985000.0,
        }

        response = self.client.post(url, data=request_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Deal.objects.count(), 1)

        response = self.client.get(url)
        response_data = response.json()
        self.assertEqual(len(response_data), 1)
        self.assertIn('distributions', response_data[0])
        self.assertIn('carry_plan_name', response_data[0])

        # check with fund
        response = self.create_deal_with_fund(self.fund.external_id)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Deal.objects.count(), 2)

    def create_deal_with_fund(self, fund_external_id):
        url = reverse('carry-deals')
        request_data = {
            "name": "Beach",
            "estimated_value": 85000.0,
            "fund_external_id": fund_external_id
        }
        response = self.client.post(url, data=request_data, format='json')
        return response

    def add_participants(self, pool_external_id, allocations: List[Allocation]):
        url = reverse('carry-pool-allocations')
        payload = {
            'base_pool_id': pool_external_id,
            'parent_pool_id': pool_external_id,
            'allocations': [a.model_dump() for a in allocations]

        }
        return self.client.post(
            url,
            data=payload,
            format='json',
            **self.get_headers()
        )

    def test_deals_update(self):
        url = reverse('carry-deals')

        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        request_data = {
            "name": "Hotel",
            "estimated_value": 985000.0,
        }

        response = self.client.post(url, data=request_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        deal_id = response.data['id']

        url = reverse('deal-retrieve-update', kwargs={'pk': deal_id})
        request_data = {
            "name": "Hotel Updated",
            "estimated_value": 0,
            "fund.external_id": self.fund.external_id
        }

        response = self.client.patch(url, data=request_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["name"], "Hotel Updated")

    def test_create_deal_carry_plan(self):
        deal = DealFactory.create(fund=self.fund, company=self.fund.company)
        vesting_schedule = VestingScheduleFactory()
        self.assertEqual(Deal.objects.count(), 1)

        url = reverse('carry-plans-list-create')
        payload = {
            'deals': [
                {
                    'external_id': deal.external_id
                }
            ],
            'bps': 200,
            'default_vesting_schedule': vesting_schedule.id,
            'is_deal': True,
            'name': 'carry plan name'
        }
        response = self.client.post(
            url,
            data=payload,
            format='json',
            **self.get_headers()
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(DealCarryPlan.objects.count(), 1)
        self.assertEqual(CarryPlan.objects.count(), 1)
        self.assertEqual(CarryPool.objects.count(), 1)

        # Verify DealCarryPlan already exists
        response = self.client.post(
            url,
            data=payload,
            format='json',
            **self.get_headers()
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        # Verify Invalid deal external_id
        payload['external_id'] = 'df75tg8yhu9jikop'
        response = self.client.post(
            url,
            data=payload,
            format='json',
            **self.get_headers()
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_carry_plan_with_funds_and_deals(self):
        deal = DealFactory.create(fund=self.fund, company=self.fund.company)
        vesting_schedule = VestingScheduleFactory()
        self.assertEqual(Deal.objects.count(), 1)
        self.assertEqual(DealCarryPlan.objects.count(), 0)
        self.assertEqual(FundCarryPlan.objects.count(), 0)

        url = reverse('carry-plans-list-create')
        payload = {
            'deals': [
                {
                    'external_id': deal.external_id
                }
            ],
            'funds': [
                {
                    'external_id': self.fund.external_id
                }
            ],
            'bps': 200,
            'default_vesting_schedule': vesting_schedule.id,
            'name': 'Fund Deal Combo'
        }
        response = self.client.post(
            url,
            data=payload,
            format='json',
            **self.get_headers()
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(DealCarryPlan.objects.count(), 1)
        self.assertEqual(FundCarryPlan.objects.count(), 1)
        self.assertEqual(CarryPlan.objects.count(), 1)
        self.assertEqual(CarryPool.objects.count(), 1)
        self.assertEqual(CarryPlan.objects.first().name, 'Fund Deal Combo')
