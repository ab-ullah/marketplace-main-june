from re import sub


def convert_currency_to_number(currency):
    if not currency:
        return 0
    return float(sub(r'[^\d.]', '', currency))
