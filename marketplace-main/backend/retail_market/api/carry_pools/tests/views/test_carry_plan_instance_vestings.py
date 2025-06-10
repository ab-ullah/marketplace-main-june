from datetime import datetime
from datetime import date


from dateutil.relativedelta import relativedelta
from rest_framework import status
from rest_framework.reverse import reverse

from api.carry_pools.models import VestingSchedule

from api.carry_pools.tests.factories import (CarryPlanMilestoneFactory,
                                             CarryPlanFactory,
                                             CarryPoolFactory,
                                             FundCarryPlanFactory,
                                             TimeBasedVestingScheduleFactory,
                                             VestingScheduleFactory,
                                             MilestoneFactory, MilestoneBasedVestingScheduleFactory,
                                             CarryParticipantFactory,
                                             )

from core.base_tests import BaseTestCase


class CarryPlanLevelVestingAPITestCase(BaseTestCase):
    def setUp(self):
        self.create_user()
        self.client.force_authenticate(self.admin_user.user)
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

    def create_fund_carry_plan_with_allocation(self, vesting_start_date=None, points=None, vesting_schedule=None):
        carry_plan_vesting_start_date = vesting_start_date if vesting_start_date else \
            datetime.now() - relativedelta(years=2, days=1)

        carry_plan = CarryPlanFactory(company=self.company, effective_date=carry_plan_vesting_start_date)
        fund_carry_plan = FundCarryPlanFactory(fund=self.fund, carry_plan=carry_plan)
        CarryPoolFactory(carry_plan=carry_plan, company=self.company)

        payload = {
            "allocations": [
                {
                    "carry_participant_id": self.carry_participant.id,
                    "bps": points if points else 40,
                    "allocation_id": None,
                    "grant_date": datetime.now(),
                    "vesting_schedule": vesting_schedule if vesting_schedule else self.vesting_schedule.id
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

    def test_milestone_based_vesting_from_carry_plan(self):
        """
        Test for getting milestone dates and percentages from carry plan for vesting calculations
        """

        # create milestone based schedule
        vesting_schedule = VestingScheduleFactory(
            vesting_type=VestingSchedule.VestingType.EVENT_BASED,
            cliff_duration=None,
            cliff_vesting_percentage=0,
            cliff_vesting_percentage_numerator=None,
            cliff_vesting_percentage_denominator=None,
            company=self.company

        )
        fund_carry_plan = self.create_fund_carry_plan_with_allocation(vesting_schedule=vesting_schedule.id)
        carry_plan = fund_carry_plan.carry_plan

        milestone_1 = MilestoneFactory(company=self.company)
        milestone_2 = MilestoneFactory(company=self.company)
        milestone_3 = MilestoneFactory(company=self.company)

        MilestoneBasedVestingScheduleFactory(
            vesting_schedule=vesting_schedule,
            milestone=milestone_1,
            milestone_vesting_percentage=30
        )
        MilestoneBasedVestingScheduleFactory(
            vesting_schedule=vesting_schedule,
            milestone=milestone_2,
            milestone_vesting_percentage=40
        )
        MilestoneBasedVestingScheduleFactory(
            vesting_schedule=vesting_schedule,
            milestone=milestone_3,
            milestone_vesting_percentage=30
        )

        # define dates and percentages at carry plan level, only 2 for now
        CarryPlanMilestoneFactory(
            milestone=milestone_1,
            carry_plan=carry_plan,
            date=date(2027, 5, 20),
            vesting_percentage=30
        )

        CarryPlanMilestoneFactory(
            milestone=milestone_2,
            carry_plan=carry_plan,
            date=date(2028, 5, 20),
            vesting_percentage=40
        )

        # 0% vesting should be done since all milestones are in future
        url = reverse('user-carry-allocations', kwargs={'user_id': self.user.id})
        as_of_date = datetime.now().strftime('%Y-%m-%d')
        response = self.client.get(url, HTTP_AS_OF_DATE=as_of_date)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        result_allocation = response.data[0]
        self.assertEqual(result_allocation['bps'], '40')
        self.assertEqual(result_allocation['vested_bps'], 0)

        # 30% vesting should be done
        url = reverse('user-carry-allocations', kwargs={'user_id': self.user.id})
        as_of_date = date(2027, 5, 21).strftime('%Y-%m-%d')
        response = self.client.get(url, HTTP_AS_OF_DATE=as_of_date)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        result_allocation = response.data[0]
        self.assertEqual(result_allocation['vested_bps'], 12)

        # 40% more vesting should be done, total 70%
        url = reverse('user-carry-allocations', kwargs={'user_id': self.user.id})
        as_of_date = date(2028, 5, 21).strftime('%Y-%m-%d')
        response = self.client.get(url, HTTP_AS_OF_DATE=as_of_date)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        result_allocation = response.data[0]
        self.assertEqual(result_allocation['vested_bps'], 28)

        # Set date and percentage for 3rd milestone against carry plan through API
        payload = {
            'carry_plan_id': carry_plan.id,
            'milestone_id': milestone_3.id,
            'date': date(2028, 12, 12),
            'vesting_percentage': 30
        }
        url = reverse("carry-plan-milestone")
        response = self.client.patch(url, data=payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # 30% more vesting should be done now, total 100%
        url = reverse('user-carry-allocations', kwargs={'user_id': self.user.id})
        as_of_date = date(2028, 12, 28).strftime('%Y-%m-%d')
        response = self.client.get(url, HTTP_AS_OF_DATE=as_of_date)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        result_allocation = response.data[0]
        self.assertEqual(result_allocation['vested_bps'], 40)

    def test_carry_plan_schedules_with_dates(self):
        """
        Test vesting schedules related to a carry plan and milestone dates in them
        """

        # create milestone based schedule
        vesting_schedule = VestingScheduleFactory(
            vesting_type=VestingSchedule.VestingType.EVENT_BASED,
            cliff_duration=None,
            cliff_vesting_percentage=0,
            company=self.company

        )
        fund_carry_plan = self.create_fund_carry_plan_with_allocation(vesting_schedule=vesting_schedule.id)
        carry_plan = fund_carry_plan.carry_plan

        milestone_1 = MilestoneFactory(company=self.company)
        milestone_2 = MilestoneFactory(company=self.company)

        MilestoneBasedVestingScheduleFactory(
            vesting_schedule=vesting_schedule,
            milestone=milestone_1,
            milestone_vesting_percentage=50
        )
        MilestoneBasedVestingScheduleFactory(
            vesting_schedule=vesting_schedule,
            milestone=milestone_2,
            milestone_vesting_percentage=50
        )

        # define dates at carry plan level
        CarryPlanMilestoneFactory(
            milestone=milestone_1,
            carry_plan=carry_plan,
            date=date(2027, 5, 20)
        )

        CarryPlanMilestoneFactory(
            milestone=milestone_2,
            carry_plan=carry_plan,
            date=date(2028, 5, 20)
        )

        # test carry plan vesting schedule api that should include milestone dates too
        url = reverse("carry-plans-vesting-schedules", kwargs={'pk': carry_plan.id})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.data

        # verify milestone data
        self.assertIn('carry_plan_milestones', data)
        self.assertEqual(len(data['carry_plan_milestones']), 2)
        self.assertEqual(data['carry_plan_milestones'][0]['name'], milestone_1.name)
        self.assertEqual(data['carry_plan_milestones'][1]['name'], milestone_2.name)
        self.assertEqual(data['carry_plan_milestones'][0]['date'], date(2027, 5, 20))
        self.assertEqual(data['carry_plan_milestones'][1]['date'], date(2028, 5, 20))

        # verify vesting schedules data
        self.assertIn('vesting_schedules', data)
        self.assertEqual(len(data['vesting_schedules']), 1)
        vesting_schedule_dict = data['vesting_schedules'][0]
        milestone_vesting_schedules = vesting_schedule_dict['milestone_vesting_schedules']
        self.assertNotEqual(milestone_vesting_schedules, None)
        self.assertEqual(len(milestone_vesting_schedules), 2)

        first_milestone = milestone_vesting_schedules[0]['milestone']
        self.assertNotEqual(first_milestone, None)
        second_milestone = milestone_vesting_schedules[1]['milestone']
        self.assertNotEqual(second_milestone, None)

        self.assertEqual(
            first_milestone['date'],
            date(2027, 5, 20)
        )
        self.assertEqual(
            second_milestone['date'],
            date(2028, 5, 20)
        )
