from api.funds.models import Fund, FundIndicationOfInterest
from api.libs.utils.format_currency import format_currency


class ProcessIndicationOfInterestAnswer:
    def __init__(self, fund: Fund):
        self.fund = fund

    def format_value(self, field, value):
        if 'how much equity' in field:
            currency = self.fund.fund_currency.symbol
            amount = '{:,}'.format(float(value.replace(',', '')))
            return f'"{currency}{amount}"'
        return value

    def process(self):
        fields = ['email']
        rows = []
        answers = FundIndicationOfInterest.objects.filter(
            fund=self.fund
        )
        for answer in answers:
            if answer.response_json:
                response = {'email': answer.user.user.email}
                for field, value in answer.response_json.items():
                    formatted_field = field.lower().strip()
                    if formatted_field not in fields:
                        fields.append(formatted_field)
                    response[formatted_field] = self.format_value(formatted_field, value)
                rows.append(response)

        return {'fields': fields, 'rows': rows, 'file_name': f'{self.fund.slug}-interest-answers.csv'}
