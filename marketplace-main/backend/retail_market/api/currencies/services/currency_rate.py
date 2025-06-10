from api.currencies.models import CurrencyRate, Currency
from api.currencies.services.currency_conversion import CarryCurrencyRatesService
from api.currencies.utils import get_existing_rates_for_date


class CurrencyRateService:

    def __init__(self, from_currency, to_currency, date):
        self.from_currency = from_currency
        self.to_currency = to_currency
        self.date = date
        self.currency_mapping = self.get_currency_code_mapping()

    def get_currency_code_mapping(self):
        currencies = Currency.objects.filter(company=self.from_currency.company).values('code', 'id')
        return {
            currency['code']: currency['id'] for currency in currencies
        }

    def get_conversion_rate_from_db(self):
        try:
            currency_rate = CurrencyRate.objects.filter(
                from_currency=self.from_currency,
                to_currency=self.to_currency,
                rate_date__date=self.date
            ).latest('rate_date')
            return currency_rate.conversion_rate
        except CurrencyRate.DoesNotExist:
            return None

    def store_rates_in_db(self, rates):
        existing_rates = get_existing_rates_for_date(
            company=self.from_currency.company,
            date=self.date,
            return_tuple=True
        )

        currency_rates = []

        for currency_code, rate in rates.items():
            if currency_code not in self.currency_mapping:
                continue

            currency_id = self.currency_mapping[currency_code]
            direct_rate_tuple = (self.from_currency.code, currency_code)
            inverse_rate_tuple = (currency_code, self.from_currency.code)
            inverse_rate = 1 / rate

            if direct_rate_tuple not in existing_rates:
                currency_rates.append(CurrencyRate(
                    from_currency=self.from_currency,
                    to_currency_id=currency_id,
                    conversion_rate=rate,
                    rate_date=self.date
                ))

            if inverse_rate_tuple not in existing_rates:
                currency_rates.append(CurrencyRate(
                    from_currency_id=currency_id,
                    to_currency=self.from_currency,
                    conversion_rate=inverse_rate,
                    rate_date=self.date
                ))

        if currency_rates:
            CurrencyRate.objects.bulk_create(currency_rates, batch_size=200, ignore_conflicts=True)

    def process_conversion_rates_from_api(self):
        currency_conversion_service = CarryCurrencyRatesService(use_cache=True)
        rates = currency_conversion_service.fetch_historic_currency_rates_from_api(
            base_currency_code=self.from_currency.code,
            date=self.date
        )
        if rates:
            self.store_rates_in_db(rates)
            conversion_rate = rates.get(self.to_currency.code)
            if conversion_rate:
                return conversion_rate

        return None

    def get_conversion_rate(self):
        if self.from_currency.id == self.to_currency.id:
            return 1.0
        rate_from_db = self.get_conversion_rate_from_db()
        if rate_from_db:
            return rate_from_db

        return self.process_conversion_rates_from_api()
