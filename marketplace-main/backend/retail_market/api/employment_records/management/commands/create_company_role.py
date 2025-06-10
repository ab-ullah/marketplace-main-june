import json
import logging

import django.db
from django.core.management.base import BaseCommand

from api.companies.models import Company
from api.employment_records.models import CompanyRole

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = 'Create company role'

    def add_arguments(self, parser):
        parser.add_argument('company_name', type=str)
        parser.add_argument('company_role', type=str)

    def handle(self, *args, **options):
        company_name = options.get('company_name')
        company_role_name = options.get('company_role')
        try:
            company = Company.objects.get(name=company_name)
        except django.db.Error as e:
            self.stderr.write(json.dumps({"error": str(e)}))
            return
        company_role = CompanyRole.objects.create(company=company, name=company_role_name)
        payload = {
            'id': company_role.id,
            'name': company_role.name,
            'company': company_role.company.name
        }
        self.stdout.write(json.dumps(payload, indent=4), ending='')
