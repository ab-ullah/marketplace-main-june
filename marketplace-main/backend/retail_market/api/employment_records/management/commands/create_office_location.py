import json
import logging

import django.db
from django.core.management.base import BaseCommand

from api.companies.models import Company
from api.employment_records.models import OfficeLocation

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = 'Create company job band'

    def add_arguments(self, parser):
        parser.add_argument('company_name', type=str)
        parser.add_argument('office_location', type=str)

    def handle(self, *args, **options):
        company_name = options.get('company_name')
        office_location_name = options.get('office_location')
        try:
            company = Company.objects.get(name=company_name)
        except django.db.Error as e:
            self.stderr.write(json.dumps({"error": str(e)}))
            return
        office_location = OfficeLocation.objects.create(company=company, name=office_location_name)
        payload = {
            'id': office_location.id,
            'name': office_location.name,
            'company': office_location.company.name
        }
        self.stdout.write(json.dumps(payload, indent=4), ending='')
