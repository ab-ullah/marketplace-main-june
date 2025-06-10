from api.comments.models import ModuleChoices
from api.libs.utils.urls import get_eligibility_url, get_aml_kyc_url, get_tax_record_url, get_bank_detail_url, \
    get_review_docs_url, get_agreements_url

MODULE_URL_FUNCTIONS = {
    ModuleChoices.ELIGIBILITY_CRITERIA.value: get_eligibility_url,
    ModuleChoices.KYC_RECORD.value: get_aml_kyc_url,
    ModuleChoices.TAX_RECORD.value: get_tax_record_url,
    ModuleChoices.BANKING_DETAILS.value: get_bank_detail_url,
    ModuleChoices.FUND_DOCUMENTS.value: get_review_docs_url,
    ModuleChoices.AGREEMENT.value: get_agreements_url,
}
