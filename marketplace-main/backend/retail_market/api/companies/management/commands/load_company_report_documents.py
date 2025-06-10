import logging

from django.core.management.base import BaseCommand

from api.companies.models import Company
from api.companies.services.load_admin_reports import LoadAdminReports

logger = logging.getLogger(__name__)


class Command(BaseCommand):

    def add_arguments(self, parser):
        parser.add_argument('--company_name', type=str, action='store')

    def handle(self, *args, **options):
        company_name = options['company_name']

        company = Company.objects.get(name__iexact=company_name)
        LoadAdminReports(company=company).process()
