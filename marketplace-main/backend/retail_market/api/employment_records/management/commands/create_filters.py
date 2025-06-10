import json
import logging

import django.db
from django.core.management.base import BaseCommand

from api.companies.models import Company
from api.employment_records.constants.filters import DEFAULT_FILTERS
from api.employment_records.models import OfficeLocation, CompanyFirmViewFilter

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = 'Create Filters Definitions'

    def add_arguments(self, parser):
        parser.add_argument('company_name', type=str)

    def handle(self, *args, **options):
        company_name = options.get('company_name')
        try:
            company = Company.objects.get(name=company_name)
        except django.db.Error as e:
            self.stderr.write(json.dumps({"error": str(e)}))
            return
        CompanyFirmViewFilter.objects.update_or_create(
            company=company,
            defaults={
                'filters': DEFAULT_FILTERS
            }
        )
