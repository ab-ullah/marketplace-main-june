from api.constants.kyc_investor_types import KYCInvestorType


def get_fund_kyc_workflow_name(company, vehicle_type):
    if vehicle_type == KYCInvestorType.INDIVIDUAL.name:
        return f'KYC / AML individual {company.name}'
    elif vehicle_type == KYCInvestorType.PRIVATE_COMPANY.name:
        return f'KYC / AML corporate entity {company.name}'
    elif vehicle_type == KYCInvestorType.LIMITED_PARTNERSHIP.name:
        return f'KYC / AML partnership {company.name}'
    elif vehicle_type == KYCInvestorType.TRUST.name:
        return f'KYC / AML trust {company.name}'

def get_workflow_name_by_fund(fund, vehicle_type):
    if vehicle_type == KYCInvestorType.INDIVIDUAL.name:
        return f'KYC / AML individual {fund.name}'
    elif vehicle_type == KYCInvestorType.PRIVATE_COMPANY.name:
        return f'KYC / AML corporate entity {fund.name}'
    elif vehicle_type == KYCInvestorType.LIMITED_PARTNERSHIP.name:
        return f'KYC / AML partnership {fund.name}'
    elif vehicle_type == KYCInvestorType.TRUST.name:
        return f'KYC / AML trust {fund.name}'
