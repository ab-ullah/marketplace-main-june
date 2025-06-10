from datetime import datetime, timedelta

from dateutil.relativedelta import relativedelta
from rest_framework import status
from rest_framework.reverse import reverse

from api.carry_pools.tests.factories import (CarryPlanFactory,
                                             CarryPoolFactory,
                                             FundCarryPlanFactory,
                                             TimeBasedVestingScheduleFactory,
                                             VestingScheduleFactory, CarryParticipantFactory
                                             )
from api.carry_pools.utils import get_carry_pool_of_carry_plan
from core.base_tests import BaseTestCase


class AllocationDetailView(BaseTestCase):
    def setUp(self):
        self.create_user()
        self.client.force_authenticate(self.admin_user.user)
        self.create_fund(company=self.company)
        self.vesting_schedule = self.create_vesting_schedule()
        self.carry_participant = self.create_carry_participant()

    def create_carry_participant(self):
        carry_participant = CarryParticipantFactory(company=self.company)
        carry_participant.associate_with_user(self.user)
        return carry_participant

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

    def create_fund_carry_plan_with_allocation(self,
                                               vesting_start_date=None,
                                               points=None,
                                               vesting_schedule=None,
                                               allocation_vesting_start_date=None
                                               ):
        carry_plan_vesting_start_date = vesting_start_date if vesting_start_date else \
            datetime.now() - relativedelta(years=2, days=1)

        if not allocation_vesting_start_date:
            allocation_vesting_start_date = carry_plan_vesting_start_date

        carry_plan = CarryPlanFactory(company=self.company, effective_date=carry_plan_vesting_start_date)
        fund_carry_plan = FundCarryPlanFactory(fund=self.fund, carry_plan=carry_plan)
        CarryPoolFactory(carry_plan=carry_plan, company=self.company)

        payload = {
            "allocations": [
                {
                    "carry_participant_id": self.carry_participant.id,
                    "bps": points if points else 40,
                    "allocation_id": None,
                    "grant_date": datetime.now() - timedelta(days=2),
                    "vesting_schedule": vesting_schedule if vesting_schedule else self.vesting_schedule.id,
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

    def test_detail_api_view(self):
        fund_carry_plan = self.create_fund_carry_plan_with_allocation()
        fund = fund_carry_plan.fund
        carry_pool = get_carry_pool_of_carry_plan(fund_carry_plan.carry_plan.id, fund_carry_plan.carry_plan.company_id)
        allocation = carry_pool.allocations[0]
        allocation_id = allocation['allocation_id']
        detail_url = reverse(
            'carry-plan-single-allocation',
            kwargs={
                'pk': fund_carry_plan.carry_plan.id,
                'allocation_id': allocation_id

            }
        )
        forfeit_url = reverse('forfeiture', kwargs={'user_id': self.user.id})
        request_data = [
            {
                "allocation_id": carry_pool.allocations[0]['allocation_id'],
                "parent_pool_id": carry_pool.external_id,
                "base_pool_id": carry_pool.external_id,
                "bps": 8
            }
        ]

        response = self.client.post(forfeit_url, data=request_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        points = allocation['bps']
        allocation['amount'] = 500
        allocation['escrow'] = 200
        allocation['net_distribution'] = allocation['amount'] - allocation['escrow']
        allocation['escrow_percentage'] = 20

        payload = {
            "fund_external_id": fund.external_id,
            "amount": 500,
            "distribution_date": datetime.now() - timedelta(days=1),
            "escrow": 200,
            "allocations": [allocation]
        }
        url = reverse('admin-carry-distributions')
        self.client.post(
            url,
            data=payload,
            format='json',
            **self.get_headers()
        )

        response = self.client.get(detail_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        result_allocation = response.data
        self.assertEqual(result_allocation['carry_plan_name'], fund_carry_plan.carry_plan.name)
        self.assertEqual(float(result_allocation['bps']), 32)
        self.assertEqual(result_allocation['vested_bps'], 20)
        self.assertEqual(result_allocation['forfeited_bps'], 8)

        self.assertEqual(len(result_allocation['actions']), 3)
        self.assertEqual(result_allocation['actions'][0]['event_type'], 'Allocation')
        self.assertEqual(result_allocation['actions'][1]['event_type'], 'Forfeiture')
        self.assertEqual(result_allocation['actions'][2]['event_type'], 'Current Points')

        self.assertEqual(len(result_allocation['distributions']), 1)
        self.assertEqual(result_allocation['distributions'][0]['amount'], 500)
        self.assertEqual(result_allocation['distributions'][0]['escrow'], 200)
