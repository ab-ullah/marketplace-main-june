import logging

from django.core.management.base import BaseCommand

from api.companies.models import Company, CompanyRole
from api.constants.employment_levels import EMPLOYMENT_LEVELS

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = 'Create User Roles'

    def handle(self, *args, **options):
        for company in Company.objects.all():
            for employment_level in EMPLOYMENT_LEVELS:
                CompanyRole.objects.get_or_create(
                    company=company,
                    name=employment_level['name'],
                    leverage_ratio=employment_level['leverage_ratio']
                )
