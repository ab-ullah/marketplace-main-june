import enum

from api.cards.default.individual_cards import ID_DOC_IMAGE_FILE_TYPE
from api.constants.id_documents import IdDocuments
from api.constants.kyc_investor_types import KYCInvestorType
from api.kyc_records.models import KYCRecord


class FundTypeEnum(enum.Enum):
    OPEN = 'Open'
    CLOSED = 'Closed'


class CurrencyEnum(enum.Enum):
    USD = 'USD'
    EUR = 'EUR'
    JPY = 'JPY'
    KRW = 'KRW'
    CNY = 'CNY'
    AUD = 'AUD'
    CAD = 'CAD'
    SGD = 'SGD'
    GBP = 'GBP'


class VehicleTypeEnum(enum.Enum):
    INDIVIDUAL = 'individual'


class DocumentTypeEnum(enum.Enum):
    CAPITAL_CALLS = 'capital-calls'
    CAPITAL_CALL = 'capital-call'
    DISTRIBUTIONS = 'distributions'
    DISTRIBUTION = 'distribution'
    NAV_STATEMENT = 'nav-statement'
    INTEREST_STATEMENT = 'interest-statement'
    INVESTOR_REPORTS = 'investor-reports'
    FINANCIAL_STATEMENTS = 'financial-statements'
    PURCHASE_AGREEMENTS = 'purchase-agreements'
    SUBSCRIPTION_DOCUMENTS = 'subscription-documents'
    PROSPECTUS = 'prospectus'
    PITCH_BOOK = 'pitchbook'
    AGREEMENT = 'agreement'
    OTHER = 'other'
    TAX = 'tax'
    FUND_AGREEMENT_DOCUMENT = 'fund-agreement-documents'
    FINANCIAL_INFORMATION = "financial-information"
    PROPERTY_PORTFOLIO = "property-portfolio"
    QUARTERLY_REPORT = "quarterly-report"
    ETHICS = "ethics"
    INVESTOR_MEETING_MATERIALS = "investor-meeting-materials"
    STRATEGIC_MATERIALS = "strategic-materials"
    SUSTAINABILITY = "sustainability"
    ANNUAL_REPORT = 'annual-report'
    MONTHLY_REPORT = "monthly-report"


class ContentTypeEnum(enum.Enum):
    PDF = 'application/pdf'
    MS_WORD = 'application/msword'
    TEXT = 'application/text'
    JPG = 'image/jpeg'
    PNG = 'image/png'

class FundBusinessLineEnum(enum.Enum):
    AMERICAS_PRIVATE = 'americas_private'
    ASIA_PACIFIC_PRIVATE = 'asia_pacific_private'
    EUROPE_PRIVATE = 'europe_private'
    GLOBAL_PARTNER_SOLUTIONS = 'global_partner_solutions'
    GLOBAL_SECURITIES = 'global_securities'


class InvestorTypeEnum(enum.Enum):
    INDIVIDUAL = 'individual'
    PRIVATE_COMPANY = 'private_company'
    LIMITED_PARTNERSHIP = 'limited_partnership'
    TRUST = 'trust'


INVESTOR_TYPE_MAPPING = {
    InvestorTypeEnum.INDIVIDUAL.value: KYCInvestorType.INDIVIDUAL.value,
    InvestorTypeEnum.PRIVATE_COMPANY.value: KYCInvestorType.PRIVATE_COMPANY.value,
    InvestorTypeEnum.LIMITED_PARTNERSHIP.value: KYCInvestorType.LIMITED_PARTNERSHIP.value,
    InvestorTypeEnum.TRUST.value: KYCInvestorType.TRUST.value,
}


class KycTaxDocumentTypeEnum(enum.Enum):
    DRIVER_LICENSE = 'driver_license'
    PASSPORT = 'passport'
    NATIONAL_ID_CARD = 'national_id_card'
    PROOF_OF_ADDRESS = 'proof_of_address'
    CERTIFICATE_OF_INCORPORATION = 'certificate_of_incorporation'
    LIST_OF_DIRECTORS_MANAGERS = 'list_of_current_directors_or_managers'
    LIST_OF_AUTHORIZED_SIGNATORIES = 'list_of_authorized_signatories'
    LIST_OF_SHAREHOLDERS_MEMBERS_OWNERS = 'list_of_shareholders_members_owners'
    MEMORANDUM_AND_ARTICLES_OF_ASSOCIATION = 'memorandum_and_articles_of_association'
    POWER_OF_ATTORNEY_AUTHORIZATION_LETTER = 'applicable_resolutions_power_of_attorney_auth_letter'
    PARTNERSHIP_AGREEMENT = 'certified_copy_of_partnership_agreement'
    CERTIFICATE_OF_FORMATION = 'certificate_of_formation'
    BENEFICIAL_OWNERSHIP = 'evidence_of_beneficial_ownership'
    TRUST_DEEDS_OR_AGREEMENTS = 'trust_deeds_or_agreements'
    TAX_W9 = 'w9'
    TAX_W_8IMY = 'w_8imy'
    TAX_W_8BEN = 'w_8ben'
    TAX_W_8BEN_E = 'w_8ben_e'
    TAX_W_8ECI = 'w_8eci'
    TAX_W_8EXP = 'w_8exp'
    TAX_INDIVIDUAL_CERTIFICATION = 'individual_certification'
    TAX_ENTITY_CERTIFICATION = 'entity_certification'


TAX_DOCUMENTS_MAPPING = {
    KycTaxDocumentTypeEnum.TAX_W9.value: 'W-9',
    KycTaxDocumentTypeEnum.TAX_W_8IMY.value: 'W-8IMY',
    KycTaxDocumentTypeEnum.TAX_W_8BEN.value: 'W-8BEN',
    KycTaxDocumentTypeEnum.TAX_W_8BEN_E.value: 'W-8BEN-E',
    KycTaxDocumentTypeEnum.TAX_W_8ECI.value: 'W-8ECI',
    KycTaxDocumentTypeEnum.TAX_W_8EXP.value: 'W-8EXP',
    KycTaxDocumentTypeEnum.TAX_INDIVIDUAL_CERTIFICATION.value: 'Global-Individual-SC',
    KycTaxDocumentTypeEnum.TAX_ENTITY_CERTIFICATION.value: 'Global-Entity-SC',
}

KYC_DOCUMENT_TYPE_MAPPING = {
    KycTaxDocumentTypeEnum.DRIVER_LICENSE.value: IdDocuments.DRIVERS_LICENSE.value,
    KycTaxDocumentTypeEnum.PASSPORT.value: IdDocuments.PASSPORT.value,
    KycTaxDocumentTypeEnum.NATIONAL_ID_CARD.value: IdDocuments.NATIONAL_ID_CARD.value,
}


def get_kyc_document_type(kyc_record: KYCRecord, document_type):
    if kyc_record.kyc_investor_type == KYCInvestorType.TRUST:
        if document_type == KycTaxDocumentTypeEnum.POWER_OF_ATTORNEY_AUTHORIZATION_LETTER.value:
            return 'trust_applicable_resolutions_powers_of_attorney_or_authorization letters'

    if kyc_record.kyc_investor_type == KYCInvestorType.PRIVATE_COMPANY:
        if document_type == KycTaxDocumentTypeEnum.POWER_OF_ATTORNEY_AUTHORIZATION_LETTER.value:
            return 'applicable_resolutions_powers_of_attorney_or_authorization letters'

    kyc_id_document_type = KYC_DOCUMENT_TYPE_MAPPING.get(document_type)
    if kyc_id_document_type:
        kyc_record.id_document_type = kyc_id_document_type
        kyc_record.save()
        return ID_DOC_IMAGE_FILE_TYPE

    return document_type
