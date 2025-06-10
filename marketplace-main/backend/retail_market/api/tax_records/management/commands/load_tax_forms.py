from django.core.management.base import BaseCommand

from api.companies.models import Company
from api.tax_records.services.load_tax_forms import CreateCompanyTaxFormsService


class Command(BaseCommand):
    help = 'Load tax forms'

    def handle(self, *args, **options):
        for company in Company.objects.all():
            CreateCompanyTaxFormsService(company=company).create()
