from django.core.management.base import BaseCommand

from api.companies.models import Company
from api.eligibility_criteria.services.create_company_blocks import CreateCompanyBlocksService


class Command(BaseCommand):
    help = 'Create blocks'

    def handle(self, *args, **options):
        for company in Company.objects.all():
            CreateCompanyBlocksService(company=company).create()
