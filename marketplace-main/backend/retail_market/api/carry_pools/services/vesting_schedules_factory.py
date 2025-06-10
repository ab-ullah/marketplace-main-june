from django.utils import timezone
from dateutil.parser import parse

from api.carry_pools.models import VestingSchedule, TimeBasedVestingSchedule, Milestone, MilestoneBasedVestingSchedule
from api.companies.models import Company


class VestingScheduleCreationService:
    def __init__(self, company_name):
        self.company_name= company_name

    def create_time_based_vesting_schedule(self):
        company = Company.objects.filter(name__iexact=self.company_name).first()
        if not company:
            return

        vesting_schedule_data = {
            'name': 'Time Based Vesting Schedule',
            'description': '4 year vesting, 1 year cliff - vests 25% after 12 months '
                           'then equal parts monthly i.e. 2.083% until 100% vested',
            'vesting_type': 1,
            'is_default': False,
            'cliff_duration': 'P1Y',
            'cliff_vesting_percentage': 25,
            'company': company
        }
        vesting_schedule = VestingSchedule.objects.create(**vesting_schedule_data)

        sequence = 1
        bulk_create_data = []
        for count in range(1, 36 + 1):
            if count == 36:
                period_vesting_percentage = 2.0845
            else:
                period_vesting_percentage = 2.0833

            data = {
                'vesting_schedule': vesting_schedule,
                'period_duration': 'P1M',
                'period_vesting_percentage': period_vesting_percentage,
                'sequence': sequence
            }
            sequence += 1
            bulk_create_data.append(data)

        TimeBasedVestingSchedule.objects.bulk_create([TimeBasedVestingSchedule(**data) for data in bulk_create_data])

    def create_milestone_based_vesting_schedule(self):
        company = Company.objects.filter(name__iexact=self.company_name).first()
        if not company:
            return

        vesting_schedule_data = {
            'name': 'Milestone Based Vesting Schedule',
            'description': 'Vests 20% on deal date i.e. 2023-09-01, another 20% on first capital deployment i.e 2024-03-01,'
                           ' another 20% on second capital deployment i.e 2024-09-30,'
                           ' 100% vested upon liquidation i.e. on 2024-08-30',
            'vesting_type': 2,
            'is_default': False,
            'cliff_duration': None,
            'cliff_vesting_percentage': 0,
            'company': company
        }
        vesting_schedule = VestingSchedule.objects.create(**vesting_schedule_data)

        milestones_data = [
            {
                'name': 'Deal Date',
                'type': 'Deal Date',
                'date': '2023-09-01',
                'milestone_vesting_percentage': 20
            },
            {
                'name': 'First Capital Deployment',
                'type': 'Capital Deployment',
                'date': '2024-03-01',
                'milestone_vesting_percentage': 20
            },
            {
                'name': 'Second Capital Deployment',
                'type': 'Capital Deployment',
                'date': '2024-09-30',
                'milestone_vesting_percentage': 20
            },
            {
                'name': 'Liquidation',
                'type': 'Liquidation',
                'date': '2024-08-30',
                'is_accelerated': True,
                'milestone_vesting_percentage': 100
            }
        ]

        for milestone_data in milestones_data:
            date = parse(milestone_data.pop('date'))
            milestone_vesting_percentage = milestone_data.pop('milestone_vesting_percentage')
            is_accelerated = milestone_data.pop('is_accelerated') if 'is_accelerated' in milestone_data else False

            milestone = Milestone.objects.create(date=date, **milestone_data)
            MilestoneBasedVestingSchedule.objects.create(
                vesting_schedule=vesting_schedule,
                milestone=milestone,
                milestone_vesting_percentage=milestone_vesting_percentage,
                is_accelerated=is_accelerated
            )

    def create_hybrid_vesting_schedule(self):
        company = Company.objects.filter(name__iexact=self.company_name).first()
        if not company:
            return

        vesting_schedule_data = {
            'name': 'Hybrid Vesting Schedule',
            'description': '80% vesting over 4 years, vests annual with a 1 year cliff, '
                           'then 100% vested on liquidation i.e on 2026-05-31',
            'vesting_type': 3,
            'is_default': False,
            'cliff_duration': 'P1Y',
            'cliff_vesting_percentage': 20,
            'company': company
        }
        vesting_schedule = VestingSchedule.objects.create(**vesting_schedule_data)

        sequence = 1
        bulk_create_data = []
        for count in range(1, 3 + 1):
            bulk_create_data.append({
                'vesting_schedule': vesting_schedule,
                'period_duration': 'P1Y',
                'period_vesting_percentage': 20,
                'sequence': sequence
            })
            sequence += 1

        TimeBasedVestingSchedule.objects.bulk_create([TimeBasedVestingSchedule(**data) for data in bulk_create_data])

        milestone = Milestone.objects.create(
            name='Liquidation',
            type='Liquidation',
            date=timezone.datetime(2026, 5, 31)
        )
        MilestoneBasedVestingSchedule.objects.create(
            vesting_schedule=vesting_schedule,
            milestone=milestone,
            milestone_vesting_percentage=100,
            is_accelerated=True
        )
