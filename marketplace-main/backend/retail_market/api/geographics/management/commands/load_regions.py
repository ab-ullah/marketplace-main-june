import logging

from django.core.management.base import BaseCommand

from api.companies.models import Company
from api.geographics.services.create_company_regions import CreateCompanyRegionsService

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = 'Load Regions'

    def handle(self, *args, **options):
        for company in Company.objects.all():
            CreateCompanyRegionsService(company=company).create_regions()
