import logging

from django.core.management.base import BaseCommand
from django.db.transaction import atomic

from api.companies.models import Company
from api.carry_pools.models import VestingSchedule

logger = logging.getLogger(__name__)


def create_vesting_schedule(company,
                            name,
                            description,
                            cliff_duration,
                            cliff_percentage,
                            cliff_percentage_num,
                            cliff_percentage_denominator
                            ):

    vesting_schedule_data = {
        'name': name,
        'description': description,
        'vesting_type': 1,
        'is_default': False,
        'cliff_duration': cliff_duration,
        'cliff_vesting_percentage': cliff_percentage,
        'cliff_vesting_percentage_numerator': cliff_percentage_num,
        'cliff_vesting_percentage_denominator': cliff_percentage_denominator,
        'company': company
    }
    vesting_schedule = VestingSchedule.objects.create(**vesting_schedule_data)


class Command(BaseCommand):
    help = 'Create Fully Vested and No Vesting Schedules'

    def add_arguments(self, parser):
        parser.add_argument('--company_name', type=str, action='store', required=True)

    def handle(self, *args, **options):
        company_name = options.get('company_name')
        company = Company.objects.filter(name__iexact=company_name).first()
        if not company:
            return

        with atomic():
            create_vesting_schedule(
                company=company,
                name='No Vesting',
                description='No Vesting',
                cliff_duration=None,
                cliff_percentage=None,
                cliff_percentage_num=None,
                cliff_percentage_denominator=None
            )
            create_vesting_schedule(
                company=company,
                name='Fully Vested',
                description='Fully Vested',
                cliff_duration='P0M',
                cliff_percentage=100,
                cliff_percentage_num=100,
                cliff_percentage_denominator=1
            )
        self.stdout.write('Default Vesting Schedule Created Successfully!')
