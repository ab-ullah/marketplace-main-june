import logging

from django.core.management.base import BaseCommand

from api.carry_pools.models import Milestone
from api.companies.models import Company

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = 'Create a milestone for a Company'

    def add_arguments(self, parser):
        parser.add_argument('--milestone', type=str, action='store', required=True)
        parser.add_argument('--company_name', type=str, action='store', required=True)

    def handle(self, *args, **options):
        company_name = options.get('company_name')
        milestone_name = options.get('milestone')

        company = Company.objects.filter(name__iexact=company_name).first()
        if not company:
            return

        Milestone.objects.create(
            name=milestone_name,
            type=milestone_name,
            company=company
        )

        self.stdout.write('Milestone Created Successfully!')
