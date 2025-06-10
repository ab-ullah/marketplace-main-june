import logging

from django.core.management.base import BaseCommand
from django.utils import timezone

from api.companies.models import Company
from api.currencies.models import Currency, CurrencyRate

logger = logging.getLogger(__name__)

CONVERSION_RATE = {
    'USD': 1,
    'EUR': 1.1802,
    'GBP': 1.3733,
    'JPY': 0.0090729,
    'CAD': 0.79182,
    'SGD': 0.74,
    'AUD': 0.73,
    'CNY': 0.16,
    'KRW': 0.00084,
}


class Command(BaseCommand):
    help = 'Create Currency conversion'

    @staticmethod
    def get_base_currency(company):
        try:
            return Currency.objects.get(company=company, code__iexact='USD')
        except Currency.DoesNotExist:
            return None

    def handle(self, *args, **options):
        for company in Company.objects.all().iterator():
            base_currency = self.get_base_currency(company=company)
            for currency in Currency.objects.filter(company=company):
                rate = CONVERSION_RATE.get(currency.code)
                CurrencyRate.objects.create(
                    from_currency=currency,
                    to_currency=base_currency,
                    conversion_rate=rate,
                    rate_date=timezone.now()
                )
