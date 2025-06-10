import logging

from django.core.management.base import BaseCommand

from api.companies.models import Company
from api.companies.services.company_service import CompanyService

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = 'Create Currencies'

    def handle(self, *args, **options):
        for company in Company.objects.all().iterator():
            CompanyService.create_company_currencies(company=company)
