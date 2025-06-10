import json
import logging

from django.core.management.base import BaseCommand

from api.companies.services.company_service import CompanyService

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = 'Create company'

    def add_arguments(self, parser):
        parser.add_argument('company_name', type=str)

    def handle(self, *args, **options):
        company_name = options.get('company_name')
        company_info = CompanyService.create_company(company_name=company_name)
        company = company_info['company']
        token = company_info['token']
        payload = {
            'name': company.name,
            'token': token
        }
        self.stdout.write(json.dumps(payload, indent=4), ending='')
