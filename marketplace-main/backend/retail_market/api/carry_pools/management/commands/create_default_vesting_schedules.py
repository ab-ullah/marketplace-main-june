import logging

from django.core.management.base import BaseCommand

from api.carry_pools.services.vesting_schedules_factory import VestingScheduleCreationService

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = 'Create Default Vesting Schedules for Company'

    def add_arguments(self, parser):
        parser.add_argument('--company_name', type=str, action='store', required=True)

    def handle(self, *args, **options):
        company_name = options.get('company_name')

        vesting_schedule_factory = VestingScheduleCreationService(company_name=company_name)
        vesting_schedule_factory.create_time_based_vesting_schedule()
        vesting_schedule_factory.create_milestone_based_vesting_schedule()
        vesting_schedule_factory.create_hybrid_vesting_schedule()

        self.stdout.write('Default Vesting Schedules Created Successfully!')
