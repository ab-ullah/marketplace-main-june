from api.currencies.models import Currency, CurrencyRate

class CurrencyHelper:

    USD = 'USD'

    @staticmethod
    def get_currency_symbols():
        currencies = Currency.objects.all()
        currency_symbols = dict()
        for currency in currencies:
            currency_symbols[currency.code] = currency.symbol

        return currency_symbols

    @staticmethod
    def get_currency_rate(from_curr_code, to_curr_code, at_date):
        from_curr = Currency.objects.get(code=from_curr_code)
        to_curr = Currency.objects.get(code=to_curr_code)

        curr_rate = CurrencyRate.objects.get(
            from_currency_id=from_curr.id,
            to_currency_id=to_curr.id,
            rate_date=at_date)

        return curr_rate.conversion_rate



