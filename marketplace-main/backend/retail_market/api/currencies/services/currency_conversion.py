from django.core.cache import cache
from django.conf import settings

import requests


class CarryCurrencyRatesService:

    def __init__(self, use_cache):
        self.use_cache = use_cache
        self.base_api_url = settings.CURRENCY_RATES_API_BASE_URL
        self.api_key = settings.CURRENCY_RATES_API_KEY
        self.error = None
        self.rates = {}

    def fetch_currency_rates_from_api(self):
        try:
            response = requests.get(f'{self.base_api_url}/latest?api_key={self.api_key}')
            data = response.json()
            if data.get('success'):
                latest_rates = data['rates']
                cache.set('CARRY-CURRENCY-RATES', latest_rates)
                self.rates = latest_rates
            else:
                self.error = 'Error fetching latest rates'
        except Exception as err:
            self.error = 'Error fetching latest rates: {}'.format(err)

    def fetch_historic_currency_rates_from_api(self, date, base_currency_code: str):
        url = f'{self.base_api_url}/historical?api_key={self.api_key}&date={date.strftime("%Y-%m-%d")}&base={base_currency_code}'
        try:
            response = requests.get(url)
            data = response.json()
            if data.get('success'):
                rates = data['rates']
                return rates
            else:
                self.error = 'Error fetching historic rates'
        except Exception as err:
            self.error = 'Error fetching historic rates: {}'.format(err)

    def get_latest_rates(self):
        if self.use_cache:
            cached_rates = cache.get('CARRY-CURRENCY-RATES')
            if cached_rates is not None:
                self.rates = cached_rates
            else:
                self.fetch_currency_rates_from_api()
        else:
            self.fetch_currency_rates_from_api()

        return self.rates, self.error
