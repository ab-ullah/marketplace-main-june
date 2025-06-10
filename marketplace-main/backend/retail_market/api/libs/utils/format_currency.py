from decimal import Decimal


def remove_exponent(d):
    return d.quantize(Decimal(1)) if d == d.to_integral() else d.normalize()


def format_currency(amount):
    if not amount:
        return amount
    if not isinstance(amount, Decimal):
        try:
            amount = Decimal(amount)
        except:
            return amount
    try:
        return '{:,}'.format(round(amount, 2))
    except:
        return amount