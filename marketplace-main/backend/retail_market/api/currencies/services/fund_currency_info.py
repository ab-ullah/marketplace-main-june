from api.currencies.services.company_currency_details import CompanyCurrencyService

DEFAULT_CURRENCY = 'USD'


class FundCurrencyDetail:
    def __init__(self, fund, currency=None):
        self.fund = fund
        self.currency = currency if currency else fund.fund_currency

    @staticmethod
    def get_default():
        return {
            'code': 'USD',
            'symbol': '$',
            'rate': 1
        }

    def process(self):
        fund_currency = self.currency
        if not fund_currency:
            return self.get_default()

        currency_service = CompanyCurrencyService(fund_currency.company)
        return currency_service.get_currency_detail(currency_id=fund_currency.id)
