from api.constants.investment_code import INVESTMENT_CODE_LENGTH, LEVERAGE_RATIO_LENGTH


def parse_activity_investment_code(raw_code: str):
    investment_code = raw_code[:INVESTMENT_CODE_LENGTH]
    vehicle_code_leverage_ratio = raw_code[INVESTMENT_CODE_LENGTH:]

    if len(vehicle_code_leverage_ratio) <= LEVERAGE_RATIO_LENGTH:
        share_class = vehicle_code_leverage_ratio
        leverage_ratio = ''

    else:
        leverage_ratio = vehicle_code_leverage_ratio[-LEVERAGE_RATIO_LENGTH:]
        share_class = vehicle_code_leverage_ratio[:-LEVERAGE_RATIO_LENGTH]

    return {
        'investment_code': investment_code,
        'share_class': share_class,
        'leverage_ratio': leverage_ratio
    }
