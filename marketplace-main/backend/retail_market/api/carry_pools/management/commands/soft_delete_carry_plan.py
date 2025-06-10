import logging

from django.core.management.base import BaseCommand

from api.carry_pools.models import CarryPlan
from api.carry_pools.services.carry_plan_deletion import CarryPlanDeletion
from api.companies.models import Company

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = 'Create Default Vesting Schedules for Company'

    def add_arguments(self, parser):
        parser.add_argument('--company_name', type=str, action='store', required=True)
        parser.add_argument('--carry_plan_id', type=int, action='store', required=True)

    def handle(self, *args, **options):
        company_name = options.get('company_name')
        carry_plan_id = options.get('carry_plan_id')

        company = Company.objects.get(name__iexact=company_name)
        carry_plan = CarryPlan.objects.get(id=carry_plan_id, company=company)
        CarryPlanDeletion(carry_plan=carry_plan, company=company).delete()
        self.stdout.write('Soft deleted carry plan successfully!')
