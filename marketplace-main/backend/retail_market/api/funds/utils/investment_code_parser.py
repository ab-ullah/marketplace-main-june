from api.constants.investment_code import INVESTMENT_CODE_LENGTH


def parse_fund_investment_code(raw_code: str):
    investment_code = raw_code[:INVESTMENT_CODE_LENGTH]
    vehicle_code = raw_code[INVESTMENT_CODE_LENGTH:]

    return {
        'investment_code': investment_code,
        'vehicle_code': vehicle_code
    }
