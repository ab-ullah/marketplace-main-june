import json
import logging

import django.db
from django.core.management.base import BaseCommand

from api.companies.models import Company
from api.employment_records.models import JobBand

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = 'Create company job band'

    def add_arguments(self, parser):
        parser.add_argument('company_name', type=str)
        parser.add_argument('job_band', type=str)

    def handle(self, *args, **options):
        company_name = options.get('company_name')
        job_band_name = options.get('job_band')
        try:
            company = Company.objects.get(name=company_name)
        except django.db.Error as e:
            self.stderr.write(json.dumps({"error": str(e)}))
            return
        job_band = JobBand.objects.create(company=company, name=job_band_name)
        payload = {
            'id': job_band.id,
            'name': job_band.name,
            'company': job_band.company.name
        }
        self.stdout.write(json.dumps(payload, indent=4), ending='')
