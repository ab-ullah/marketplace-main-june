from datetime import datetime

from dateutil.relativedelta import relativedelta
from rest_framework import status
from rest_framework.reverse import reverse

from api.carry_pools.entities import Allocation
from api.carry_pools.models import FundCarryPlan
from api.carry_pools.tests.factories import CarryPoolFactory, CarryFundFactory, FundCarryPlanFactory, \
    CarryParticipantFactory
from api.carry_pools.tests.views.base import CarryTestCase
from api.currencies.models import Currency
from api.funds.models import Fund


class CarryFundsAPITestCase(CarryTestCase):
    def setUp(self):
        self.create_user()
        self.create_currency()
        self.client.force_authenticate(self.admin_user.user)
        self.carry_participant = CarryParticipantFactory(company=self.company)
        self.carry_participant.associate_with_user(self.user)

    def test_carry_funds_list_and_allocations(self):
        fund: Fund = CarryFundFactory.create(company=self.company)

        url = reverse('carry-funds')
        fund_carry_plan: FundCarryPlan = FundCarryPlanFactory.create(fund=fund)
        fund_carry_plan_2: FundCarryPlan = FundCarryPlanFactory.create(fund=fund)
        CarryPoolFactory.create(carry_plan=fund_carry_plan.carry_plan, company=fund_carry_plan.carry_plan.company)
        CarryPoolFactory.create(carry_plan=fund_carry_plan_2.carry_plan, company=fund_carry_plan_2.carry_plan.company)
        pool_1 = fund_carry_plan.carry_plan.carry_pools.first()
        pool_2 = fund_carry_plan_2.carry_plan.carry_pools.first()

        allocations_pool_1 = [
            Allocation(bps=10, carry_participant_id=self.carry_participant.id),
            Allocation(bps=20, carry_participant_id=self.carry_participant.id),
        ]
        allocations_pool_2 = [
            Allocation(bps=10, carry_participant_id=self.carry_participant.id),
            Allocation(bps=20, carry_participant_id=self.carry_participant.id),
            Allocation(bps=30, carry_participant_id=self.carry_participant.id),
        ]
        self.add_participants(pool_1.external_id, allocations_pool_1, fund_carry_plan.carry_plan.id)
        self.add_participants(pool_2.external_id, allocations_pool_2, fund_carry_plan_2.carry_plan.id)

        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        response_data = response.json()

        self.assertEqual(response_data[0]['participants'], 5)
        self.assertEqual(response_data[0]['unallocated_points'], 110)
        self.assertEqual(response_data[0]['estimated_value'], 1000)
        self.assertEqual(response_data[0]['total_distributions'], 0)
        self.assertEqual(response_data[0]['carry_plan_name'], fund_carry_plan.carry_plan.name)


    def test_carry_fund_participant_details(self):
        fund = CarryFundFactory.create(company=self.company)

        url = reverse('carry-funds')
        fund_carry_plan = FundCarryPlanFactory.create(fund=fund)
        CarryPoolFactory.create(carry_plan=fund_carry_plan.carry_plan, company=fund_carry_plan.carry_plan.company)
        pool = fund_carry_plan.carry_plan.carry_pools.first()

        allocations_pool = [
            Allocation(bps=10, carry_participant_id=self.carry_participant.id),
            Allocation(bps=20, carry_participant_id=self.carry_participant.id),
        ]
        self.add_participants(pool.external_id, allocations_pool, fund_carry_plan.carry_plan.id)

        carry_fund_id = fund.id
        url = reverse('carry-fund-participants', kwargs={'pk': carry_fund_id})
        as_of_date = (datetime.now() + relativedelta(years=3, days=1)).strftime('%Y-%m-%d')
        response = self.client.get(url, HTTP_AS_OF_DATE=as_of_date)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # validate API returns cumulative data for carry participants (not by retail user id)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0].get('bps'), '30')
        self.assertEqual(response.data[0].get('full_name'), self.carry_participant.get_full_name())
        self.assertEqual(response.data[0].get('distributions'), 0)
        self.assertEqual(response.data[0].get('user_id'), self.user.id)
        self.assertEqual(response.data[0].get('user_name'), self.user.get_full_name())


    def test_carry_funds_creation(self):
        currency_id = Currency.objects.first().id
        payload = {
            'name': 'Today Fund',
            'fund_currency': currency_id,
            'target_fund_size': 5000,
            'estimated_value': 12600
        }
        url = reverse('carry-funds')
        response = self.client.post(
            url,
            payload,
            format='json',
            **self.get_headers()
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['name'], 'Today Fund')
        self.assertEqual(response.data['is_carry_plan'], False)
        self.assertEqual(response.data['estimated_value'], 12600)


    def test_carry_funds_sorting(self):
        url = reverse('carry-funds')
        currency_id = Currency.objects.first().id

        payload_1 = {
            'name': '137 Holdings',
            'fund_currency': currency_id
        }
        payload_2 = {
            'name': '(Realised) 137 Holdings',
            'fund_currency': currency_id
        }
        payload_3 = {
            'name': 'Holdings',
            'fund_currency': currency_id
        }

        response = self.client.post(
            url,
            payload_2,
            format='json',
            **self.get_headers()
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        response = self.client.post(
            url,
            payload_1,
            format='json',
            **self.get_headers()
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        response = self.client.post(
            url,
            payload_3,
            format='json',
            **self.get_headers()
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        # validate sorting in order of numeric, alpha, then special character
        response = self.client.get(
            url,
            **self.get_headers()
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.data
        self.assertEqual(data[0]['name'], '137 Holdings')
        self.assertEqual(data[1]['name'], 'Holdings')
        self.assertEqual(data[2]['name'], '(Realised) 137 Holdings')
