const API_BASE = process.env.REACT_APP_API_URL

export const KYC_RECORDS_URL = `${API_BASE}/api/kyc_records/`
export const COMMENTS_URL = `${API_BASE}/api/comments/`
export const APP_RECORDS_URL = `${API_BASE}/api/applications`
export const ELIGIBILITY_CRITERIA_URL = `${API_BASE}/api/eligibility_criteria`
export const APPLICATIONS_BASE_URL = `${API_BASE}/api/applications`
export const DOCUMENTS_URL = `${API_BASE}/api/documents/`
export const TAX_RECORDS_URL = `${API_BASE}/api/tax_records`
export const COMPANY_REGIONS_URL = `${API_BASE}/api/geographics/region_countries`
export const AGREEMENTS_URL = `${API_BASE}/api/agreements`
export const USER_INFO_URL = `${API_BASE}/api/users/info`
export const ADVISOR_USER_URL = `${API_BASE}/api/investors/advisors/`

export const getKYCRecordFetchURL = (uuid: string) =>
	`${KYC_RECORDS_URL}${uuid}`
export const getKYCDocumentsURL = (kycRecordId: number) =>
	`${KYC_RECORDS_URL}${kycRecordId}/documents`
export const getKYCParticipantRecordDocumentsURL = (
	workflowSlug: string,
	kycRecordId: number,
	participantId: number,
) =>
	`${KYC_RECORDS_URL}workflows/${workflowSlug}/kyc_records/${kycRecordId}/participants/${participantId}/documents`
export const getWorkflowsURLByFund = (externalId: string) =>
	`${API_BASE}/api/workflows/funds/${externalId}/`
export const getFundAppRecords = (externalId: string) =>
	`${APP_RECORDS_URL}/funds/${externalId}/applications`
export const getKYCParticipantRecordCreateURL = (
	workflowSlug: string,
	kycRecordId: number,
) =>
	`${KYC_RECORDS_URL}workflows/${workflowSlug}/kyc_records/${kycRecordId}/participants`
export const getKycEligibilityCriteriaUrl = (kycId: number) =>
	`${ELIGIBILITY_CRITERIA_URL}/response/kyc/${kycId}`
export const getApplicationDocumentRequestListUrl = (applicationId: number) =>
	`${APPLICATIONS_BASE_URL}/application-document-request/${applicationId}`
export const getApplicationDocumentRequestResponseUrl = () =>
	`${APPLICATIONS_BASE_URL}/application-document-request-response`
export const getApplicationDocumentRequestResponseListUrl = (
	applicationId: number,
) =>
	`${APPLICATIONS_BASE_URL}/application-document-request-response/${applicationId}`
export const getApplicationDocumentRequestResponseDeletetUrl = (
	responseId: number,
) =>
	`${APPLICATIONS_BASE_URL}/application-document-response-delete/${responseId}`
export const getDismissApplicationUpdateNotificationtUrl = (
	application_id: string,
) => `${APPLICATIONS_BASE_URL}/${application_id}`
export const getKYCRecordCreateURL = (workflowSlug: string) =>
	`${KYC_RECORDS_URL}workflows/${workflowSlug}/kyc_records`
export const getAppRecords = (uuid: string) =>
	`${APP_RECORDS_URL}/applications/${uuid}`
export const documentDownloadUrl = (documentId: string) =>
	`${DOCUMENTS_URL}${documentId}`
export const getKYCDocumentDeletionURL = (
	kycRecordId: number,
	documentId: string,
) => `${KYC_RECORDS_URL}${kycRecordId}/documents/${documentId}`
export const getKYCRecordUpdateURL = (
	workflowSlug: string,
	kycRecordId: number,
) => `${KYC_RECORDS_URL}workflows/${workflowSlug}/kyc_records/${kycRecordId}/`
export const getKYCParticipantRecordUpdateURL = (
	workflowSlug: string,
	kycRecordId: number,
	participantId: number,
) =>
	`${KYC_RECORDS_URL}workflows/${workflowSlug}/kyc_records/${kycRecordId}/participants/${participantId}`
export const reviewKYCRecordUpdateURL = (
	recordId: number,
	externalId: string,
) => `${KYC_RECORDS_URL}${recordId}/review/fund/${externalId}`
export const getFundTaxFormsUrl = (fundExternalId: string) =>
	`${TAX_RECORDS_URL}/${fundExternalId}/tax_forms/`
export const getTaxDocumentsListUrl = (tax_record_id: string) =>
	`${TAX_RECORDS_URL}/${tax_record_id}/tax_documents/`
export const getCountriesUrl = (externalId: string) =>
	`${COMPANY_REGIONS_URL}/${externalId}`
export const getUpdateTaxRecordUrl = (recordUUI: string) =>
	`${API_BASE}/api/tax_records/tax-record/${recordUUI}/update`
export const getFetchTaxDetailsUrl = (recordUUI: string) =>
	`${API_BASE}/api/tax_records/tax-record/${recordUUI}`
export const getCreateTaxWorkflowUrl = (fundExternalId: string) =>
	`${TAX_RECORDS_URL}/${fundExternalId}/tax-record/workflow`
export const getCreateTaxReviewTaskUrl = (
	fundExternalId: string,
	recordUUID: string,
) => `${TAX_RECORDS_URL}/${fundExternalId}/tax-record/${recordUUID}/task`
export const getTaxRecordsCreateUrl = (externalId: string) =>
	`${TAX_RECORDS_URL}/${externalId}`
export const getSaveSignedFormUrl = (
	fundExternalId: string,
	envelopeId: string,
) => `${TAX_RECORDS_URL}/${fundExternalId}/tax_documents/${envelopeId}`
export const getSigningUrlUrl = (envelopeId: string, returnUrl: string) =>
	`${TAX_RECORDS_URL}/tax_forms/${envelopeId}/form_signing_url?return_url=${returnUrl}`
export const getTaxDocumentDeletionURL = (
	recordId: number,
	documentId: string,
) => `${TAX_RECORDS_URL}/${recordId}/documents/${documentId}`
export const getCreateEnvelopeUrl = (tax_record_id: string) =>
	`${TAX_RECORDS_URL}/${tax_record_id}/tax_documents/create_envelope`
export const getUserAgreementSigningUrl = (agreementId: number, returnUrl: string) => `${AGREEMENTS_URL}/signing_url/${agreementId}?return_url=${returnUrl}`;
export const storeUserResponseUrl = (envelopeId: string) => `${AGREEMENTS_URL}/store_response/${envelopeId}`;
export const getSaveProgramDocsSigningUrl = (fundSlug: string, envelopeId: string) => `${APPLICATIONS_BASE_URL}/funds/${fundSlug}/company-documents/store_response/${envelopeId}`;
export const getUpdateProgramDocsUrl = (externalId: string, documentId: string) => `${API_BASE}/api/applications/funds/${externalId}/company-documents/${documentId}`
export const getProgramDocsSigningUrl = (fundSlug: string, programDocId: number, returnUrl: string) => `${APPLICATIONS_BASE_URL}/funds/${fundSlug}/company-documents/signing_url/${programDocId}?return_url=${returnUrl}`;
export const getResponseStatus = (responseId: number) => `${ELIGIBILITY_CRITERIA_URL}/response/${responseId}/status`
export const deleteDocumentUrl = (documentId: number) => `${DOCUMENTS_URL}${documentId}`
export const getFundProfileURL = (externalId: string) => `${API_BASE}/api/funds/external_id/${externalId}/profile`
export const getFeatureFlagsUrl = (featureFlag: string) => `${API_BASE}/api/feature_flags/${featureFlag}`