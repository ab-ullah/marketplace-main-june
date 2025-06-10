const API_BASE = process.env.REACT_APP_API_URL

export const COMPANY_REGIONS_URL = `${API_BASE}/api/geographics/region_countries`
export const ELIGIBILITY_CRITERIA_URL = `${API_BASE}/api/eligibility_criteria`
export const CREATE_ELIGIBILITY_CRITERIA_RESPONSE_URL = `${ELIGIBILITY_CRITERIA_URL}/response/criteria_block/`
export const CREATE_RESPONSE_BLOCK_DOCUMENT_URL = `${ELIGIBILITY_CRITERIA_URL}/response/criteria_block/document`
export const getCountriesRegionsUrl = (externalId: string) => `${API_BASE}/api/geographics/region_countries/${externalId}`
export const getEligibilityCriteriaResponseUrl = (externalId: string, countryCode: string, vehicleType: string) => `${ELIGIBILITY_CRITERIA_URL}/response/${externalId}/${countryCode}/${vehicleType}`
export const getEligibilityCriteriaResponseDocuments = (responseId: number) => `${ELIGIBILITY_CRITERIA_URL}/response/${responseId}/documents`
export const updateEligibilityCriteriaResponse = (responseId: number) => `${ELIGIBILITY_CRITERIA_URL}/response/${responseId}/update`
export const getResponseStatus = (responseId: number) => `${ELIGIBILITY_CRITERIA_URL}/response/${responseId}/status`
export const createInvestmentAmountUrl = (responseId: number) => `${ELIGIBILITY_CRITERIA_URL}/response/${responseId}/investment_amount`
export const submitForReviewUrl = (responseId: number) => `${ELIGIBILITY_CRITERIA_URL}/response/${responseId}/submit-for-review`
export const getKycEligibilityCriteriaUrl = (kycId: number) => `${ELIGIBILITY_CRITERIA_URL}/response/kyc/${kycId}`
export const fetchDataProtectionPolicyUrl = (externalId: string) => `${API_BASE}/api/funds/slug/${externalId}/data-protection-policy-document`
export const dataProtectionPolicyResponseUrl = (externalId: string) => `${API_BASE}/api/funds/slug/${externalId}/data-protection-policy-document-response`
export const getEligibilityCriteriaUrl = (externalId: string) => `${API_BASE}/api/eligibility_criteria/response/${externalId}/fetch`
export const getEligibilityCriteriaResponseTaskUrl = (responseId: number) => `${API_BASE}/api/eligibility_criteria/response/${responseId}/create-task`

