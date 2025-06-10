import logging

from django.core.management.base import BaseCommand

from api.companies.models import Company, CompanyFundVehicle
from api.funds.models import Fund, FundShareClass

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = 'demo create share classes'

    def add_arguments(self, parser):
        pass

    def handle(self, *args, **options):
        for company in Company.objects.all():
            company_fund_vehicle, _ = CompanyFundVehicle.objects.update_or_create(
                company=company,
                defaults={
                    'name': f'{company.name} Fund Vehicle'
                }
            )
            for fund in Fund.objects.filter(company=company):
                for share_class_abbreviation in ('A', 'B', 'C',):
                    FundShareClass.objects.get_or_create(
                        fund=fund,
                        display_name=f'Class {share_class_abbreviation}',
                        legal_name=f'Share fund Vehicle {fund.name} - {share_class_abbreviation}',
                        company=company,
                        company_fund_vehicle=company_fund_vehicle
                    )
