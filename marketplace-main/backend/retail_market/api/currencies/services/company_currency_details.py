import logging

from django.core.cache import cache

from api.currencies.models import CurrencyRate, Currency
from api.currencies.serializers import CurrencySerializer, CurrencyRateSerializer

DEFAULT_CURRENCY = 'USD'

DEFAULT_CURRENCY_INFO = {
    'code': 'USD',
    'symbol': '$',
    'rate': 1
}

logger = logging.getLogger(__name__)


class CompanyCurrencyService:
    def __init__(self, company):
        self.company = company
        self.cache_key = self.get_cache_key()

    def get_currencies(self):
        currencies = self.company.company_currency.all()
        return CurrencySerializer(currencies, many=True).data

    def get_base_currency(self):
        try:
            return Currency.objects.get(company=self.company, code__iexact=DEFAULT_CURRENCY)
        except Currency.DoesNotExist:
            return None

    def get_cache_key(self):
        return 'COMPANY_{}_CURRENCY'.format(self.company.id)

    @staticmethod
    def get_conversion_rates(currency_ids):
        currency_rates = CurrencyRate.objects.filter(
            from_currency_id__in=currency_ids,
            to_currency__code__iexact=DEFAULT_CURRENCY
        ).order_by('from_currency', '-rate_date').distinct('from_currency')
        currency_rate_data = CurrencyRateSerializer(currency_rates, many=True).data
        currency_rate_map = {}
        for rate in currency_rate_data:
            currency_rate_map[rate['from_currency']] = rate
        return currency_rate_map

    def create_currency_info(self):
        base_currency = self.get_base_currency()
        base_currency_id = base_currency.id if base_currency else None
        currencies = self.get_currencies()
        currency_ids = [c['id'] for c in currencies]
        currency_rates = self.get_conversion_rates(currency_ids=currency_ids)
        for c in currencies:
            default_value = 1 if base_currency_id == c['id'] else 0
            c['rate'] = currency_rates.get(c['id'], {}).get('conversion_rate', default_value)
            c['rate_date'] = currency_rates.get(c['id'], {}).get('rate_date', None)
        return {c['id']: c for c in currencies}

    def set_cache(self, value):
        cache.set(self.cache_key, value)

    def get_cache(self):
        return cache.get(self.cache_key)

    def delete_cache(self):
        cache.delete(self.cache_key)

    def get_or_create_from_cache(self):
        value = self.get_cache()
        if value:
            return value
        return self.update_cache()

    def get_currency_detail(self, currency_id):
        value = self.get_cache()
        if value and currency_id in value:
            return value[currency_id]

        updated_cache = self.update_cache()
        if currency_id in updated_cache:
            return updated_cache[currency_id]

        logger.warning('Unable to fund details for currency id: {}'.format(currency_id))
        return DEFAULT_CURRENCY_INFO

    def update_cache(self):
        self.delete_cache()
        currency_info = self.create_currency_info()
        self.set_cache(currency_info)
        return currency_info
