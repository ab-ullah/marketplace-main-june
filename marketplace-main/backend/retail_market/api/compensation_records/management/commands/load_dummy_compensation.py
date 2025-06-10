import logging

from django.core.management.base import BaseCommand

from api.compensation_records.models import CompensationRecord, Cash, InsuranceBenefit, MiscellaneousBenefit, \
    CompensationTax
from api.currencies.models import Currency
from api.users.models import RetailUser

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = 'Load Dummy Compensation'

    def add_arguments(self, parser):
        parser.add_argument('--email', type=str, action='store')

    def generate_number_from_year(self, user, year, multiplier):
        return int(year * multiplier * user.id)

    def handle(self, *args, **options):
        email = options.get('email')
        user = RetailUser.objects.get(email__iexact=email)
        company = user.associated_company_users.first().company
        currency = Currency.objects.get(
            code='USD',
            company=company
        )
        for year in (2023, 2022, 2021, 2020, 2019):
            compensation_record, created = CompensationRecord.objects.get_or_create(
                year=year,
                user=user,
                company=company,
                defaults={
                    'currency': currency
                }
            )
            Cash.objects.get_or_create(
                compensation_record=compensation_record,
                defaults={
                    'salary': self.generate_number_from_year(user=user, year=year, multiplier=3),
                    'bonus': self.generate_number_from_year(user=user, year=year, multiplier=4),
                    'extra_bonus': self.generate_number_from_year(user=user, year=year, multiplier=2),
                    'match_401k': self.generate_number_from_year(user=user, year=year, multiplier=1),
                }
            )
            InsuranceBenefit.objects.get_or_create(
                compensation_record=compensation_record,
                defaults={
                    'medical': self.generate_number_from_year(user=user, year=year, multiplier=0.75),
                    'dental': self.generate_number_from_year(user=user, year=year, multiplier=0.65),
                    'vision': self.generate_number_from_year(user=user, year=year, multiplier=0.35),
                    'life': self.generate_number_from_year(user=user, year=year, multiplier=0.9),
                    'ad_and_d': self.generate_number_from_year(user=user, year=year, multiplier=0.15),
                    'std': self.generate_number_from_year(user=user, year=year, multiplier=0.33),
                    'ltd': self.generate_number_from_year(user=user, year=year, multiplier=0.22),
                    'supplemental_ltd': self.generate_number_from_year(user=user, year=year, multiplier=0.8),
                }
            )
            MiscellaneousBenefit.objects.get_or_create(
                compensation_record=compensation_record,
                defaults={
                    'phone': self.generate_number_from_year(user=user, year=year, multiplier=1.5),
                    'meals': self.generate_number_from_year(user=user, year=year, multiplier=1.65),
                    'parking': self.generate_number_from_year(user=user, year=year, multiplier=1.35),
                }
            )
            CompensationTax.objects.get_or_create(
                compensation_record=compensation_record,
                defaults={
                    'fica': self.generate_number_from_year(user=user, year=year, multiplier=0.95),
                    'medicare': self.generate_number_from_year(user=user, year=year, multiplier=0.765),
                    'futa': self.generate_number_from_year(user=user, year=year, multiplier=0.835),
                    'sui': self.generate_number_from_year(user=user, year=year, multiplier=0.235),
                }
            )
