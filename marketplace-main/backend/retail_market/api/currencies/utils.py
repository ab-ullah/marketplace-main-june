from api.currencies.models import CurrencyRate


def get_existing_rates_for_date(company, date, return_tuple=False):
    currency_rates = CurrencyRate.objects.filter(
        from_currency__company=company,
        to_currency__company=company,
        rate_date__date=date
    ).values('from_currency__code', 'to_currency__code')
    if return_tuple:
        return [(rate['from_currency__code'], rate['to_currency__code']) for rate in currency_rates]
    return list(currency_rates)
