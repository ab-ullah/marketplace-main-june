from rest_framework import status
from rest_framework.reverse import reverse

from api.admin_users.models import AdminUser
from api.carry_pools.tests.factories import (CarryPlanFactory,
                                             CarryPoolFactory,
                                             FundCarryPlanFactory,
                                             VestingScheduleFactory, CarryParticipantFactory)
from api.carry_pools.utils import get_carry_pool_of_carry_plan
from api.partners.tests.factories import FundFactory, UserFactory
from core.base_tests import BaseTestCase


class CarryPlanCreationViewTestCase(BaseTestCase):

    def setUp(self):
        self.create_company()
        self.user = UserFactory()
        self.client.force_authenticate(self.user)
        self.create_fund(company=self.company)
        self.vesting_schedule = VestingScheduleFactory(is_default=True, company=self.company)


    def test_carry_plan_firm_level_vew(self):
        AdminUser.objects.create(user=self.user, company=self.company)

        # create raw data for a firm
        fund1 = FundFactory(company=self.company, accept_applications=True)
        fund2 = FundFactory(company=self.company, accept_applications=True)
        fund3 = FundFactory(company=self.company, accept_applications=True)

        carry_plan1 = CarryPlanFactory(company=self.company)
        carry_plan2 = CarryPlanFactory(company=self.company)
        carry_plan3 = CarryPlanFactory(company=self.company)
        FundCarryPlanFactory(fund=fund1, carry_plan=carry_plan1)
        FundCarryPlanFactory(fund=fund2, carry_plan=carry_plan2)
        FundCarryPlanFactory(fund=fund3, carry_plan=carry_plan3)
        CarryPoolFactory(carry_plan=carry_plan1, company=self.company)
        CarryPoolFactory(carry_plan=carry_plan2, company=self.company)
        CarryPoolFactory(carry_plan=carry_plan3, company=self.company)

        user_1 = UserFactory()
        user_2 = UserFactory()
        user_3 = UserFactory()

        carry_participant_1 = CarryParticipantFactory(company=self.company)
        carry_participant_2 = CarryParticipantFactory(company=self.company)
        carry_participant_3 = CarryParticipantFactory(company=self.company)

        carry_participant_1.associate_with_user(user_1)
        carry_participant_2.associate_with_user(user_2)
        carry_participant_3.associate_with_user(user_3)

        payload = {
            "allocations": [
                {
                    "carry_participant_id": carry_participant_1.id,
                    "bps": 5,
                    "allocation_id": None
                },
                {
                    "carry_participant_id": carry_participant_2.id,
                    "bps": 3,
                    "allocation_id": None
                }
            ],
            "mode": None
        }
        url = reverse('carry-plan-allocations', kwargs={'pk': carry_plan1.id})

        response = self.client.post(
            url,
            data=payload,
            format='json',
            **self.get_headers()
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        carry_pool = get_carry_pool_of_carry_plan(carry_plan1.id, company_id=carry_plan1.company.id)
        self.assertEqual(len(carry_pool.allocations), 2)
        self.assertEqual(carry_pool.allocations[0]['initial_bps'], '5')
        self.assertEqual(carry_pool.allocations[1]['initial_bps'], '3')

        payload = {
            "allocations": [
                {
                    "carry_participant_id": carry_participant_2.id,
                    "bps": 7,
                    "allocation_id": None
                },
                {
                    "carry_participant_id": carry_participant_3.id,
                    "bps": 9,
                    "allocation_id": None
                }
            ],
            "mode": None
        }
        url = reverse('carry-plan-allocations', kwargs={'pk': carry_plan2.id})

        response = self.client.post(
            url,
            data=payload,
            format='json',
            **self.get_headers()
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        carry_pool = get_carry_pool_of_carry_plan(carry_plan2.id, company_id=carry_plan2.company.id)
        self.assertEqual(len(carry_pool.allocations), 2)
        self.assertEqual(carry_pool.allocations[0]['initial_bps'], '7')
        self.assertEqual(carry_pool.allocations[1]['initial_bps'], '9')

        payload = {
            "allocations": [
                {
                    "carry_participant_id": carry_participant_3.id,
                    "bps": 19,
                    "allocation_id": None
                },
                {
                    "carry_participant_id": carry_participant_3.id,
                    "bps": 11,
                    "allocation_id": None
                }
            ],
            "mode": None
        }
        url = reverse('carry-plan-allocations', kwargs={'pk': carry_plan3.id})

        response = self.client.post(
            url,
            data=payload,
            format='json',
            **self.get_headers()
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        carry_pool = get_carry_pool_of_carry_plan(carry_plan3.id, company_id=carry_plan3.company.id)
        self.assertEqual(len(carry_pool.allocations), 2)
        self.assertEqual(carry_pool.allocations[0]['initial_bps'], '19')
        self.assertEqual(carry_pool.allocations[1]['initial_bps'], '11')

        # test firm level overview api
        url = reverse("carry-plans-firm-level-api-view")
        response = self.client.get(url)
        response_data = response.data
        self.assertEqual(len(response_data['carry_plans']), 3)
        self.assertEqual(len(response_data['participants']), 3)

        user_1_info = response_data['participants'][0]['carry_plans']
        self.assertEqual(len(user_1_info), 1)
        self.assertEqual(user_1_info[0]['bps'], 5)
        self.assertEqual(user_1_info[0]['carry_plan_id'], carry_plan1.id)

        user_2_info = response_data['participants'][1]['carry_plans']
        self.assertEqual(len(user_2_info), 2)
        self.assertEqual(user_2_info[0]['bps'], 3)
        self.assertEqual(user_2_info[0]['carry_plan_id'], carry_plan1.id)
        self.assertEqual(user_2_info[1]['bps'], 7)
        self.assertEqual(user_2_info[1]['carry_plan_id'], carry_plan2.id)

        user_3_info = response_data['participants'][2]['carry_plans']
        self.assertEqual(len(user_3_info), 2)
        self.assertEqual(user_3_info[0]['bps'], 9)
        self.assertEqual(user_3_info[0]['carry_plan_id'], carry_plan2.id)
        self.assertEqual(user_3_info[1]['bps'], 30)
        self.assertEqual(user_3_info[1]['carry_plan_id'], carry_plan3.id)
