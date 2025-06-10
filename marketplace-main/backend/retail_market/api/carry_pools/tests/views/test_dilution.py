from datetime import datetime
from dateutil.relativedelta import relativedelta

from rest_framework import status
from rest_framework.reverse import reverse

from api.admin_users.models import AdminUser
from api.carry_pools.constants import PRO_RATA_DILUTION, EVEN_DILUTION
from api.carry_pools.tests.factories import (CarryPlanFactory,
                                             CarryPoolFactory,
                                             FundCarryPlanFactory,
                                             VestingScheduleFactory, CarryParticipantFactory,
                                             TimeBasedVestingScheduleFactory)
from api.carry_pools.utils import get_carry_pool_of_carry_plan
from api.partners.tests.factories import UserFactory
from core.base_tests import BaseTestCase


class CarryPlanDilutionTestCase(BaseTestCase):

    def setUp(self):
        self.create_company()
        self.user = UserFactory()
        self.client.force_authenticate(self.user)
        self.create_fund(company=self.company)
        self.vesting_schedule = self.create_vesting_schedule()
        self.carry_participant = CarryParticipantFactory(company=self.company)
        self.carry_participant.associate_with_user(self.user)

    def create_vesting_schedule(self):
        vesting_schedule = VestingScheduleFactory(**{
            'name': 'Time Based Vesting Schedule for Testing',
            'description': '4 year vesting, 1 year cliff - vests 25% after 12 months '
                           'then equal parts yearly i.e. 25% until 100% vested',
            'vesting_type': 1,
            'is_default': True,
            'cliff_duration': 'P1Y',
            'cliff_vesting_percentage': 25,
            'cliff_vesting_percentage_numerator': 25,
            'cliff_vesting_percentage_denominator': 1,
            'company': self.company
        })

        sequence = 1
        for count in range(1, 4):
            TimeBasedVestingScheduleFactory(**{
                'vesting_schedule': vesting_schedule,
                'period_duration': 'P1Y',
                'period_vesting_percentage': 25,
                'period_vesting_percentage_numerator': 25,
                'period_vesting_percentage_denominator': 1,
                'sequence': sequence
            })
            sequence += 1

        return vesting_schedule

    def create_fund_carry_plan_with_allocation(self, vesting_start_date=None):
        allocation_vesting_start_date = vesting_start_date

        carry_plan = CarryPlanFactory(
            company=self.company,
            effective_date=allocation_vesting_start_date
        )
        fund_carry_plan = FundCarryPlanFactory(fund=self.fund, carry_plan=carry_plan)
        CarryPoolFactory(carry_plan=carry_plan, company=self.company)

        payload = {
            "allocations": [
                {
                    "carry_participant_id": self.carry_participant.id,
                    "bps": 40,
                    "allocation_id": None,
                    "grant_date": datetime.now(),
                    "vesting_schedule": self.vesting_schedule.id,
                    "vesting_start_date": allocation_vesting_start_date
                }
            ]}
        url = reverse('carry-plan-allocations', kwargs={'pk': carry_plan.id})

        self.client.post(
            url,
            data=payload,
            format='json',
            **self.get_headers()
        )

        return fund_carry_plan

    def create_fund_carry_plan(self):
        carry_plan = CarryPlanFactory(company=self.company)
        fund_carry_plan = FundCarryPlanFactory(fund=self.fund, carry_plan=carry_plan)
        CarryPoolFactory(carry_plan=carry_plan, company=self.company)

        return fund_carry_plan

    def test_dilution(self):
        AdminUser.objects.create(user=self.user, company=self.company)

        fund_carry_plan = self.create_fund_carry_plan()
        carry_pool = get_carry_pool_of_carry_plan(fund_carry_plan.carry_plan.id, company_id=self.company.id)
        self.assertEqual(carry_pool.bps, 100.0)

        # create 3 allocations, allocating all points in pool
        test_user_one = UserFactory()
        test_user_two = UserFactory()
        carry_participant_one = CarryParticipantFactory(company=self.company)
        carry_participant_two = CarryParticipantFactory(company=self.company)
        carry_participant_one.associate_with_user(test_user_one)
        carry_participant_two.associate_with_user(test_user_two)

        payload = {
            "allocations": [
                {
                    "carry_participant_id": self.carry_participant.id,
                    "bps": 15,
                    "allocation_id": None
                },
                {
                    "carry_participant_id": carry_participant_one.id,
                    "bps": 50,
                    "allocation_id": None
                },
                {
                    "carry_participant_id": carry_participant_two.id,
                    "bps": 35,
                    "allocation_id": None
                }
            ],
            "mode": None
        }
        url = reverse('carry-plan-allocations', kwargs={'pk': fund_carry_plan.carry_plan.id})

        response = self.client.post(
            url,
            data=payload,
            format='json',
            **self.get_headers()
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        carry_pool = get_carry_pool_of_carry_plan(fund_carry_plan.carry_plan.id,
                                                  company_id=fund_carry_plan.carry_plan.company.id)
        self.assertEqual(len(carry_pool.allocations), 3)
        self.assertEqual(carry_pool.allocations[0]['bps'], '15')
        self.assertEqual(carry_pool.allocations[1]['bps'], '50')
        self.assertEqual(carry_pool.allocations[2]['bps'], '35')

        # create a dilution in pool for 15 points, for all 3 users
        dilute_url = reverse('carry-plan-dilute', kwargs={'pk': fund_carry_plan.carry_plan.id})
        dilute_allocations = [carry_pool.allocations[0], carry_pool.allocations[1], carry_pool.allocations[2]]
        dilute_data = {
            "dilute_points": 15,
            "dilute_date": datetime.now() - relativedelta(days=3),
            "allocations": dilute_allocations,
            "mode": EVEN_DILUTION
        }

        response = self.client.post(dilute_url, data=dilute_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # validate diluted points from allocations and pool
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        response_allocations = response.data['allocations']
        self.assertEqual(response.data['carry_pool']['allocated_points'], 85)
        self.assertEqual(len(response_allocations), 3)
        self.assertEqual(float(response_allocations[0]['bps']), 10)
        self.assertEqual(float(response_allocations[1]['bps']), 45)
        self.assertEqual(float(response_allocations[2]['bps']), 30)

        # create dilution again in pool for 10 more points, for 2nd user with 45 points
        dilute_url = reverse('carry-plan-dilute', kwargs={'pk': fund_carry_plan.carry_plan.id})
        dilute_allocations = [carry_pool.allocations[1]]
        dilute_data = {
            "dilute_points": 10,
            "dilute_date": datetime.now() - relativedelta(days=3),
            "allocations": dilute_allocations,
            "mode": EVEN_DILUTION
        }

        response = self.client.post(dilute_url, data=dilute_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # validate diluted points from allocations and pool
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        response_allocations = response.data['allocations']
        self.assertEqual(response.data['carry_pool']['allocated_points'], 75)
        self.assertEqual(len(response_allocations), 3)
        self.assertEqual(float(response_allocations[0]['bps']), 10)
        self.assertEqual(float(response_allocations[1]['bps']), 35)
        self.assertEqual(float(response_allocations[2]['bps']), 30)

    def test_dilution_preview_api(self):
        AdminUser.objects.create(user=self.user, company=self.company)

        fund_carry_plan = self.create_fund_carry_plan()
        carry_pool = get_carry_pool_of_carry_plan(fund_carry_plan.carry_plan.id, company_id=self.company.id)
        self.assertEqual(carry_pool.bps, 100.0)

        # create 2 allocations, allocating all points in pool
        test_user_one = UserFactory()
        carry_participant_one = CarryParticipantFactory(company=self.company)
        carry_participant_one.associate_with_user(test_user_one)

        payload = {
            "allocations": [
                {
                    "carry_participant_id": self.carry_participant.id,
                    "bps": 75,
                    "allocation_id": None
                },
                {
                    "carry_participant_id": carry_participant_one.id,
                    "bps": 25,
                    "allocation_id": None
                }
            ],
            "mode": None
        }
        url = reverse('carry-plan-allocations', kwargs={'pk': fund_carry_plan.carry_plan.id})

        response = self.client.post(
            url,
            data=payload,
            format='json',
            **self.get_headers()
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        carry_pool = get_carry_pool_of_carry_plan(fund_carry_plan.carry_plan.id,
                                                  company_id=fund_carry_plan.carry_plan.company.id)
        self.assertEqual(len(carry_pool.allocations), 2)
        self.assertEqual(carry_pool.allocations[0]['bps'], '75')
        self.assertEqual(carry_pool.allocations[1]['bps'], '25')

        # check dilution calculations in pool for 10 points, for all 2 users
        dilute_url = reverse('carry-plan-dilute-preview', kwargs={'pk': fund_carry_plan.carry_plan.id})
        dilute_allocations = [carry_pool.allocations[0], carry_pool.allocations[1]]
        dilute_data = {
            "dilute_points": 10,
            "dilute_date": datetime.now() - relativedelta(days=3),
            "allocations": dilute_allocations,
            "mode": EVEN_DILUTION
        }

        response = self.client.post(dilute_url, data=dilute_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('allocations', response.data)
        self.assertIn('errors', response.data)

        # check calculations preview has no errors
        self.assertEqual(response.data['errors'], [])

        # validate reduced points for allocations
        response_allocations = response.data['allocations']
        self.assertEqual(len(response_allocations), 2)
        self.assertEqual(response_allocations[0]['points_reduced'], 5)
        self.assertEqual(response_allocations[1]['points_reduced'], 5)

        # check api returns errors if points are negative after dilution
        # try to dilute 30 more points, for 2nd user with 25 points, to create negative allocation
        dilute_allocations = [carry_pool.allocations[1]]
        dilute_data = {
            "dilute_points": 30,
            "dilute_date": datetime.now() - relativedelta(days=3),
            "allocations": dilute_allocations,
            "mode": EVEN_DILUTION
        }

        response = self.client.post(dilute_url, data=dilute_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # validate accurate error message
        self.assertIn("Cannot Create a Negative Allocation", response.data['errors'])

        # validate diluted points from allocations and pool
        response_allocations = response.data['allocations']
        self.assertEqual(len(response_allocations), 1)
        self.assertEqual(response_allocations[0]['points_reduced'], 30)

    def test_dilution_with_vesting(self):
        """
        Test to verify that vesting is fine dilution happens along the timeline
        """
        AdminUser.objects.create(user=self.user, company=self.company)

        fund_carry_plan = self.create_fund_carry_plan_with_allocation(datetime.now())
        carry_plan = fund_carry_plan.carry_plan
        url = reverse('user-carry-allocations', kwargs={'user_id': self.user.id})

        as_of_date = datetime.now().strftime('%Y-%m-%d')
        response = self.client.get(url, HTTP_AS_OF_DATE=as_of_date)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        result_allocation = response.data[0]
        self.assertEqual(result_allocation['carry_plan_name'], carry_plan.name)
        self.assertEqual(result_allocation['bps'], '40')
        self.assertEqual(result_allocation['vested_bps'], 0)

        # dilute by 10 points so that vested points are calculated from 30 total not 40
        dilute_url = reverse('carry-plan-dilute', kwargs={'pk': carry_plan.id})
        dilute_allocations = [result_allocation]
        dilute_data = {
            "dilute_points": 10,
            "dilute_date": datetime.now() + relativedelta(days=120),
            "allocations": dilute_allocations,
            "mode": EVEN_DILUTION
        }

        response = self.client.post(dilute_url, data=dilute_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        as_of_date = (datetime.now() + relativedelta(years=1, days=1)).strftime('%Y-%m-%d')
        response = self.client.get(url, HTTP_AS_OF_DATE=as_of_date)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        result_allocation = response.data[0]
        self.assertEqual(float(result_allocation['bps']), 30.0)
        self.assertEqual(result_allocation['vested_bps'], 7.5)
        self.assertEqual(result_allocation['diluted_bps'], 10)

        as_of_date = (datetime.now() + relativedelta(years=2, days=10)).strftime('%Y-%m-%d')
        response = self.client.get(url, HTTP_AS_OF_DATE=as_of_date)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        result_allocation = response.data[0]
        self.assertEqual(float(result_allocation['bps']), 30)
        self.assertEqual(result_allocation['vested_bps'], 15)

        # dilute by 5 points again to validate dilution before completion
        dilute_url = reverse('carry-plan-dilute', kwargs={'pk': carry_plan.id})
        dilute_allocations = [result_allocation]
        dilute_data = {
            "dilute_points": 5,
            "dilute_date": datetime.now() + relativedelta(years=2, days=30),
            "allocations": dilute_allocations,
            "mode": EVEN_DILUTION
        }
        response = self.client.post(dilute_url, data=dilute_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        as_of_date = (datetime.now() + relativedelta(years=3, days=1)).strftime('%Y-%m-%d')
        response = self.client.get(url, HTTP_AS_OF_DATE=as_of_date)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        result_allocation = response.data[0]
        self.assertEqual(float(result_allocation['bps']), 25)
        self.assertEqual(result_allocation['vested_bps'], 21.25)

        as_of_date = (datetime.now() + relativedelta(years=5, days=1)).strftime('%Y-%m-%d')
        response = self.client.get(url, HTTP_AS_OF_DATE=as_of_date)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        result_allocation = response.data[0]
        self.assertEqual(float(result_allocation['bps']), 25)
        self.assertEqual(result_allocation['vested_bps'], 25)


    def test_dilution_pro_rata(self):
        AdminUser.objects.create(user=self.user, company=self.company)

        fund_carry_plan = self.create_fund_carry_plan()
        carry_pool = get_carry_pool_of_carry_plan(fund_carry_plan.carry_plan.id, company_id=self.company.id)
        self.assertEqual(carry_pool.bps, 100.0)

        # create 2 allocations, allocating all points in pool
        test_user_one = UserFactory()
        carry_participant_one = CarryParticipantFactory(company=self.company)
        carry_participant_one.associate_with_user(test_user_one)

        payload = {
            "allocations": [
                {
                    "carry_participant_id": self.carry_participant.id,
                    "bps": 75,
                    "allocation_id": None
                },
                {
                    "carry_participant_id": carry_participant_one.id,
                    "bps": 25,
                    "allocation_id": None
                }
            ],
            "mode": None
        }
        url = reverse('carry-plan-allocations', kwargs={'pk': fund_carry_plan.carry_plan.id})

        response = self.client.post(
            url,
            data=payload,
            format='json',
            **self.get_headers()
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        carry_pool = get_carry_pool_of_carry_plan(fund_carry_plan.carry_plan.id,
                                                  company_id=fund_carry_plan.carry_plan.company.id)
        self.assertEqual(len(carry_pool.allocations), 2)
        self.assertEqual(carry_pool.allocations[0]['bps'], '75')
        self.assertEqual(carry_pool.allocations[1]['bps'], '25')

        # create a pro rata type dilution
        # check dilution calculations in pool for 10 points, for all 2 users
        # points reduced must be dynamic

        dilute_url = reverse('carry-plan-dilute-preview', kwargs={'pk': fund_carry_plan.carry_plan.id})
        dilute_allocations = [carry_pool.allocations[0], carry_pool.allocations[1]]
        dilute_data = {
            "dilute_points": 10,
            "dilute_date": datetime.now() - relativedelta(days=3),
            "allocations": dilute_allocations,
            "mode": PRO_RATA_DILUTION
        }

        response = self.client.post(dilute_url, data=dilute_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('allocations', response.data)
        self.assertIn('errors', response.data)

        # validate reduced points for allocations
        response_allocations = response.data['allocations']
        self.assertEqual(len(response_allocations), 2)
        self.assertEqual(response_allocations[0]['points_reduced'], 7.5)
        self.assertEqual(response_allocations[1]['points_reduced'], 2.5)

        # check dilution calculations in pool for 4 points, for all 2 users
        dilute_url = reverse('carry-plan-dilute-preview', kwargs={'pk': fund_carry_plan.carry_plan.id})
        dilute_allocations = [carry_pool.allocations[0], carry_pool.allocations[1]]
        dilute_data = {
            "dilute_points": 4,
            "dilute_date": datetime.now() - relativedelta(days=3),
            "allocations": dilute_allocations,
            "mode": PRO_RATA_DILUTION
        }

        response = self.client.post(dilute_url, data=dilute_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # validate reduced points for allocations,must be dynamic
        response_allocations = response.data['allocations']
        self.assertEqual(response_allocations[0]['points_reduced'], 3)
        self.assertEqual(response_allocations[1]['points_reduced'], 1)
