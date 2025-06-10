from api.constants.kyc_investor_types import KYCInvestorType

SOURCE_OF_FUNDS = [
    {"label": "Income from salary", "value": "salary"},
    {"label": "Savings", "value": "savings"},
    {"label": "Gift or Inheritance", "value": "gift"},
    {"label": "Proceeds of a sale", "value": "proceeds"},
    {"label": "Other source", "value": "other"}
]

ECONOMIC_BENEFICIARY_VALUES = (
    'own_behalf',
    'third_party'
)

INVESTOR_TYPES = (
    'is_individual',
    'is_corporate_entity',
    'is_partnership',
    'is_trust'
)

INVESTOR_TYPE_MAPPING = {
    KYCInvestorType.INDIVIDUAL.value: 'is_individual',
    KYCInvestorType.PRIVATE_COMPANY.value: 'is_corporate_entity',
    KYCInvestorType.LIMITED_PARTNERSHIP.value: 'is_partnership',
    KYCInvestorType.TRUST.value: 'is_trust',
}
