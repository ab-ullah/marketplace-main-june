from rest_framework import status
from rest_framework.reverse import reverse
from decimal import Decimal

from api.carry_pools.models import VestingSchedule
from api.carry_pools.tests.factories import (
    MilestoneBasedVestingScheduleFactory, MilestoneFactory,
    VestingScheduleFactory)
from core.base_tests import BaseTestCase


class VestingScheduleViewTestCase(BaseTestCase):

    def setUp(self):
        self.create_user()
        self.client.force_authenticate(self.admin_user.user)

    def test_create_vesting_schedule_with_time_periods(self):
        period_count = 36

        request_data = {
            "name": "Time Based Vesting Schedule",
            "description": "5 year vesting, 1 year cliff - vests 15% after 12 months then equal parts monthly until "
                           "100% vested",
            "vesting_type": 1,
            "is_default": False,
            "cliff_duration": "P1Y",
            "cliff_vesting_percentage": 15,
            "time_vesting_schedules": [
                {
                    "period_duration": "P1M",
                    "period_vesting_percentage": 85,
                    "periodically": True,
                    "period_count": period_count
                }
            ]
        }

        url = reverse('vesting-schedule-list-create')
        response = self.client.post(url, data=request_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        vesting_schedule = VestingSchedule.objects.get(id=response.data['id'])
        self.assertEqual(vesting_schedule.name, request_data['name'])
        self.assertEqual(str(vesting_schedule), request_data['name'])
        self.assertEqual(vesting_schedule.description, request_data['description'])

        time_vesting_schedules = vesting_schedule.time_vesting_schedules.all().order_by('sequence')
        self.assertEqual(len(time_vesting_schedules), period_count)

        for count in range(0, period_count-1):
            self.assertEqual(float(time_vesting_schedules[count].period_vesting_percentage), 2.3611)

        self.assertEqual(float(time_vesting_schedules[period_count-1].period_vesting_percentage), 2.3615)

        url = reverse('vesting-schedule-display', kwargs={'pk': vesting_schedule.id})
        response = self.client.get(url)
        response = response.data

        self.assertEqual(response['cliff'], '1 year')
        self.assertEqual(response['periods'][0]['period'], f'Monthly at 2.3611% for 36 months')
        self.assertEqual(response['periods'][0]['percentage'], Decimal('85'))

    def test_create_vesting_schedule_different_periods(self):
        request_data = {
            "name": "Time Based Vesting Schedule",
            "description": "80% vesting annually over the first 5 years, 20% annually over the last 5 years",
            "vesting_type": 1,
            "is_default": False,
            "cliff_duration": 0,
            "cliff_vesting_percentage": 0,
            "time_vesting_schedules": [
                {
                    "period_duration": "P1Y",
                    "period_vesting_percentage": 80,
                    "periodically": True,
                    "period_count": 5
                },
                {
                    "period_duration": "P1Y",
                    "period_vesting_percentage": 20,
                    "periodically": True,
                    "period_count": 5
                },
            ]
        }

        url = reverse('vesting-schedule-list-create')
        response = self.client.post(url, data=request_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        vesting_schedule = VestingSchedule.objects.get(id=response.data['id'])
        self.assertEqual(vesting_schedule.name, request_data['name'])
        self.assertEqual(vesting_schedule.description, request_data['description'])

        url = reverse('vesting-schedule-display', kwargs={'pk': vesting_schedule.id})
        response = self.client.get(url)
        response = response.data

        self.assertEqual(response['cliff'], 'No cliff')
        self.assertEqual(len(response['periods']), 2)
        self.assertEqual(response['periods'][0]['period'], 'Yearly at 16% for first 5 years')
        self.assertEqual(response['periods'][1]['period'], 'Yearly at 4% for last 5 years')
        self.assertEqual(response['periods'][0]['percentage'], 80)
        self.assertEqual(response['periods'][1]['percentage'], 20)

    def test_create_invalid_vesting_schedule(self):
        request_data = {
            "name": "Time Based Vesting Schedule",
            "description": "80% vesting annually over the first 5 years, 20% annually over the last 5 years",
            "vesting_type": 1,
            "is_default": False,
            "cliff_duration": 0,
            "cliff_vesting_percentage": 0,
            "time_vesting_schedules": [
                {
                    "period_duration": "P1Y",
                    "period_vesting_percentage": 100,
                    "periodically": True,
                    "period_count": 5
                },
                {
                    "period_duration": "P1Y",
                    "period_vesting_percentage": 100,
                    "periodically": True,
                    "period_count": 5
                },
            ]
        }

        url = reverse('vesting-schedule-list-create')
        response = self.client.post(url, data=request_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        vesting_schedule = VestingSchedule.objects.get(id=response.data['id'])
        self.assertEqual(vesting_schedule.name, request_data['name'])
        self.assertEqual(vesting_schedule.description, request_data['description'])

    def test_create_vesting_schedule_with_milestone(self):
        request_data = {
            "name": "MileStone Based Vesting Schedule",
            "description": "Vests 20% on deal date, another 20% on first capital deployment, another 20% on second "
                           "capital deployment,  100% vested upon liquidation",
            "vesting_type": 2,
            "is_default": False,
            "cliff_duration": 0,
            "cliff_vesting_percentage": 0,
            "milestone_vesting_schedules": [
                {
                    "name": "Deal Date",
                    "type": "Deal Date",
                    "milestone_vesting_percentage": 20
                },
                {
                    "name": "First Capital Deployment",
                    "type": "Capital Deployment",
                    "milestone_vesting_percentage": 20
                },
                {
                    "name": "Second Capital Deployment",
                    "type": "Capital Deployment",
                    "milestone_vesting_percentage": 20
                },
                {
                    "name": "Liquidation",
                    "type": "Liquidation",
                    "milestone_vesting_percentage": 40
                }
            ]
        }

        url = reverse('vesting-schedule-list-create')
        response = self.client.post(url, data=request_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        vesting_schedule = VestingSchedule.objects.get(id=response.data['id'])
        self.assertEqual(vesting_schedule.name, request_data['name'])
        self.assertEqual(vesting_schedule.description, request_data['description'])

        milestone_vesting_schedules = vesting_schedule.milestone_vesting_schedules.all()
        self.assertEqual(len(milestone_vesting_schedules), 4)

        url = reverse('vesting-schedule-display', kwargs={'pk': vesting_schedule.id})
        response = self.client.get(url)
        response = response.data

        self.assertEqual(response['cliff'], 'No cliff')
        self.assertEqual(len(response['milestone_vesting_schedules']), 4)
        self.assertEqual(response['milestone_vesting_schedules'][0]['milestone']['name'], 'Deal Date')
        self.assertEqual(response['milestone_vesting_schedules'][0]['milestone_vesting_percentage'], 20)

    def test_create_vesting_schedule(self):
        request_data = {
            "name": "Hybrid Vesting Schedule",
            "description": "80% vesting over 4 years, vests annual with a 1 year cliff, then event based vesting for "
                           "final 20%",
            "vesting_type": 3,
            "is_default": False,
            "cliff_duration": "P1Y",
            "cliff_vesting_percentage": 20,
            "time_vesting_schedules": [
                {
                    "period_duration": "P1Y",
                    "period_vesting_percentage": 60,
                    "periodically": True,
                    "period_count": 3
                }
            ],
            "milestone_vesting_schedules": [
                {
                    "name": "Deal Date",
                    "type": "Deal Date",
                    "milestone_vesting_percentage": 20
                }
            ]
        }

        url = reverse('vesting-schedule-list-create')
        response = self.client.post(url, data=request_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        vesting_schedule = VestingSchedule.objects.get(id=response.data['id'])
        self.assertEqual(vesting_schedule.name, request_data['name'])
        self.assertEqual(vesting_schedule.description, request_data['description'])

        time_vesting_schedules = vesting_schedule.time_vesting_schedules.all()
        self.assertEqual(len(time_vesting_schedules), 3)

        milestone_vesting_schedules = vesting_schedule.milestone_vesting_schedules.all()
        self.assertEqual(len(milestone_vesting_schedules), 1)

        url = reverse('vesting-schedule-display', kwargs={'pk': vesting_schedule.id})
        response = self.client.get(url)
        response = response.data
        self.assertEqual(response['cliff'], '1 year')
        self.assertEqual(response['periods'][0]['period'], f'Yearly at 20% for 3 years')
        self.assertEqual(response['periods'][0]['percentage'], 60)
        self.assertEqual(len(response['milestone_vesting_schedules']), 1)
        self.assertEqual(response['milestone_vesting_schedules'][0]['milestone']['name'], 'Deal Date')
        self.assertEqual(response['milestone_vesting_schedules'][0]['milestone_vesting_percentage'], 20)

    def test_list_vesting_schedules(self):
        VestingScheduleFactory.create_batch(3, company=self.company)
        url = reverse('vesting-schedule-list-create')
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 3)

        vesting_schedule_id = response.data[0]['id']
        url = reverse('vesting-schedule-detail', kwargs={'pk': vesting_schedule_id})
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)

    def test_list_milestones(self):
        vesting_schedule = VestingScheduleFactory(company=self.company)
        milestones = MilestoneFactory.create_batch(3)
        [MilestoneBasedVestingScheduleFactory(milestone=milestone, vesting_schedule=vesting_schedule)
         for milestone in milestones]

        url = reverse('milestone-list-create', kwargs={'vesting_id': vesting_schedule.id})
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 3)

    def test_update_milestone(self):
        vesting_schedule = VestingScheduleFactory(company=self.company)
        milestone = MilestoneFactory()
        MilestoneBasedVestingScheduleFactory(milestone=milestone, vesting_schedule=vesting_schedule)

        url = reverse('milestone-detail', kwargs={'vesting_id': vesting_schedule.id, 'pk': milestone.id})

        new_name = 'Updated Milestone Name'
        new_date = '2023-06-15'
        data = {'name': new_name}
        response = self.client.patch(url, data, format='json')
        self.assertEqual(response.status_code, 200)

        milestone.refresh_from_db()
        self.assertEqual(milestone.name, new_name)

    def test_create_time_based_vesting_schedule(self):
        vesting_schedule = VestingScheduleFactory(company=self.company)
        url = reverse('time-based-vesting-schedule-list-create', kwargs={'vesting_id': vesting_schedule.id})
        data = {
            "period_duration": "3 years",
            "period_vesting_percentage": 60,
            "sequence": 1
        }

        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        url = reverse(
            'time-based-vesting-schedule-detail',
            kwargs={'vesting_id': vesting_schedule.id, 'pk': response.data[0]['id']}
        )
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_create_milestone_based_vesting_schedule(self):
        vesting_schedule = VestingScheduleFactory(company=self.company)
        milestone = MilestoneFactory()

        url = reverse('milestone-based-vesting-schedule-list-create', kwargs={'vesting_id': vesting_schedule.id})
        data = {
            "milestone": milestone.id,
            "milestone_vesting_percentage": 50
        }

        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data[0]['milestone']['id'], milestone.id)

        url = reverse(
            'milestone-based-vesting-schedule-detail',
            kwargs={
                'vesting_id': vesting_schedule.id,
                'pk': response.data[0]['id']
            }
        )
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['milestone']['id'], milestone.id)
