import json
import logging

import django.db
from django.core.management.base import BaseCommand

from api.companies.models import Company
from api.employment_records.models import Department

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = 'Create company department'

    def add_arguments(self, parser):
        parser.add_argument('company_name', type=str)
        parser.add_argument('department', type=str)

    def handle(self, *args, **options):
        company_name = options.get('company_name')
        department_name = options.get('department')
        try:
            company = Company.objects.get(name=company_name)
        except django.db.Error as e:
            self.stderr.write(json.dumps({"error": str(e)}))
            return
        department = Department.objects.create(company=company, name=department_name)
        payload = {
            'id': department.id,
            'name': department.name,
            'company': department.company.name
        }
        self.stdout.write(json.dumps(payload, indent=4), ending='')
