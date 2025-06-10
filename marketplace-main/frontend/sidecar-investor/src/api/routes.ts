const API_BASE = process.env.REACT_APP_API_URL

export const ANALYTICS_ENTITY_ACTION_URL = `${API_BASE}/api/analytics/entity/action`
export const AGREEMENTS_URL = `${API_BASE}/api/agreements`
export const CAPITAL_CALL_URL = `${API_BASE}/api/capital_calls/`
export const INVESTOR_DETAIL_URL = `${API_BASE}/api/investors/detail/`
export const INVESTOR_CURRENCIES_URL = `${API_BASE}/api/investors/available-currencies/`
export const INVESTOR_NOTICES_URL = `${API_BASE}/api/notices/transactional-considerations`
export const INVESTOR_NOTICES_VALUATIONS_URL = `${API_BASE}/api/notices/valuation-considerations`
export const INVESTOR_NOTICES_DETAILS_URL = `${API_BASE}/api/notices/details`
export const INVESTOR_NOTICES_VALUATION_DETAILS_URL = `${API_BASE}/api/notices/valuation-details`
export const ORDERS_URL = `${API_BASE}/api/investors/orders/`
export const FUND_SALES_URL = `${API_BASE}/api/investors/sales/`
export const INVESTOR_PROFILES_URL = `${API_BASE}/api/investors/profiles/`
export const ADMIN_INVESTOR_USER_URL = `${API_BASE}/api/admin/investors/users/`
export const ADMIN_CONSIDERATION_INVESTOR_USER_URL = `${API_BASE}/api/admin/investors/consideration-users/`
export const ADVISOR_USER_URL = `${API_BASE}/api/investors/advisors/`
export const USERS_URL = `${API_BASE}/api/users/`
export const USER_INFO_URL = `${API_BASE}/api/users/info`
export const FIRST_LOGIN_URL = `${API_BASE}/api/users/first_login`
export const UNREAD_NOTIFICATION_COUNT_URL = `${API_BASE}/api/users/unread_notification_count`
export const NOTIFICATIONS_URL = `${API_BASE}/api/notifications/`
export const NOTIFICATIONS_FILTERS_URL = `${API_BASE}/api/notifications/filters`
export const FUND_INVESTOR_URL = `${API_BASE}/api/investors/funds/`
export const DOCUMENTS_URL = `${API_BASE}/api/documents/`
export const KYC_RECORDS_URL = `${API_BASE}/api/kyc_records/`
export const FUND_INTEREST_URL = `${API_BASE}/api/funds/interest`
export const COMMENTS_URL = `${API_BASE}/api/comments/`
export const TAX_RECORDS_URL = `${API_BASE}/api/tax_records`
export const APP_RECORDS_URL = `${API_BASE}/api/applications`
export const APPLICATIONS_BASE_URL = `${API_BASE}/api/applications`
export const COMPANY_REGIONS_URL = `${API_BASE}/api/geographics/region_countries`
export const PENDING_CARRY_DOCUMENTS_URL = `${API_BASE}/api/investors/carry-documents`
export const CARRY_COMMITMENTS_URL = `${API_BASE}/api/carry_plans/carry-gp-commitments`
export const CARRY_DOCUMENTS_URL = `${API_BASE}/api/carry_plans/participants_carry_documents`
export const CARRY_OVERVIEW_URL = `${API_BASE}/api/carry_plans/overview`
export const CARRY_ALLOCATIONS_URL = `${API_BASE}/api/carry_plans/allocations`
export const TOTAL_COMPENSATION_URL = `${API_BASE}/api/total_compensation`
export const TOTAL_COMPENSATION_HISTORY_URL = `${API_BASE}/api/total_compensation/history`
export const getAllocationOverviewUrl = (externalId: string) => `${API_BASE}/api/carry_plans/${externalId}`
export const getVestingScheduleUrl = (vestingScheduleId: string, planExternalId: string) => `${API_BASE}/api/carry_plans/vesting_schedules/${vestingScheduleId}?external_id=${planExternalId}`
export const getNonInvestedOpportunitiesUrl = (companySlug: string) => `${API_BASE}/api/investors/${companySlug}/non-invested-opportunities/`
export const getCompanyProfileUrl = (companySlug: string) => `${API_BASE}/api/companies/${companySlug}/profile`
export const getCompanyThemeUrl = (company:string) => `${API_BASE}/api/companies/${company}/theme`
export const getFundsDemandURL = (externalId: string) => `${API_BASE}/api/funds/external_id/${externalId}`
export const getFundProfileURL = (externalId: string) => `${API_BASE}/api/funds/external_id/${externalId}/profile`
export const getFundIndicateInterestURL = (externalId: string) => `${API_BASE}/api/funds/external_id/${externalId}/indicate-interest`
export const getFundsInvestmentsURL = (externalId: string) => `${FUND_INVESTOR_URL}${externalId}/detail`
export const getWorkflowsURLByFund = (externalId: string) => `${API_BASE}/api/workflows/funds/${externalId}/`
export const getKYCDocumentsURL = (kycRecordId: number, applicationId: number | undefined) => `${KYC_RECORDS_URL}${kycRecordId}/documents${applicationId ? `?application_id=${applicationId}` : ''}`
export const getKYCDocumentDeletionURL = (kycRecordId: number, documentId: string, fundExternalId: string) => `${KYC_RECORDS_URL}${kycRecordId}/documents/${documentId}?fundExternalId=${fundExternalId}`
export const getKYCRecordFetchURL = (uuid: string, applicationId: number | undefined) => `${KYC_RECORDS_URL}${uuid}${applicationId ? `?application_id=${applicationId}` : ''}`
export const getTaxDocumentDeletionURL = (recordId: number, documentId: string) => `${TAX_RECORDS_URL}/${recordId}/documents/${documentId}`;
export const getKYCRecordCreateURL = (workflowSlug: string) => `${KYC_RECORDS_URL}workflows/${workflowSlug}/kyc_records`
export const getKYCRecordUpdateURL = (workflowSlug: string, kycRecordId: number) => `${KYC_RECORDS_URL}workflows/${workflowSlug}/kyc_records/${kycRecordId}/`
export const reviewKYCRecordUpdateURL = (recordId: number, externalId: string) => `${KYC_RECORDS_URL}${recordId}/review/fund/${externalId}`
export const getKYCParticipantRecordCreateURL = (workflowSlug: string, kycRecordId: number) => `${KYC_RECORDS_URL}workflows/${workflowSlug}/kyc_records/${kycRecordId}/participants`
export const getKYCParticipantRecordDocumentsURL = (workflowSlug: string, kycRecordId: number, participantId: number, applicationId: number | undefined = undefined) => 
`${KYC_RECORDS_URL}workflows/${workflowSlug}/kyc_records/${kycRecordId}/participants/${participantId}/documents${applicationId ? `?application_id=${applicationId}` : ''}`
export const getKYCParticipantRecordUpdateURL = (workflowSlug: string, kycRecordId: number, participantId: number) => `${KYC_RECORDS_URL}workflows/${workflowSlug}/kyc_records/${kycRecordId}/participants/${participantId}`
export const getKYCParticipantRecordFetchURL = (workflowSlug: string, kycRecordId: number, participantId: number) => `${KYC_RECORDS_URL}workflows/${workflowSlug}/kyc_records/${kycRecordId}/participants/${participantId}`
export const updateOrderDetailURL = (orderId: number) => `${ORDERS_URL}${orderId}`
export const fundInvestorDetailUrl = (fundInvestorId: string) => `${FUND_INVESTOR_URL}${fundInvestorId}`
export const capitalCallDetailUrl = (capitalCallUUID: string) => `${CAPITAL_CALL_URL}${capitalCallUUID}`
export const documentDownloadUrl = (documentId: string) => `${DOCUMENTS_URL}${documentId}`
export const updateNotificationUrl = (notificationId: number) => `${NOTIFICATIONS_URL}${notificationId}`
export const getKYCCommentsURL = (kycRecordId: number) => `${COMMENTS_URL}kyc_record/${kycRecordId}/`;
export const getKYCCommentsUpdateURL = (commentId: number) => `${COMMENTS_URL}${commentId}`;
export const deleteDocumentUrl = (documentId: number) => `${DOCUMENTS_URL}${documentId}`
export const getTaxForms = () => `${TAX_RECORDS_URL}/tax_forms/`;
export const getFundTaxFormsUrl = (fundExternalId: string) => `${TAX_RECORDS_URL}/${fundExternalId}/tax_forms/`;
export const getTaxRecords = () => `${TAX_RECORDS_URL}/`;
export const getTaxRecordsCreateUrl = (externalId: string) => `${TAX_RECORDS_URL}/${externalId}`;
export const getFundAppRecords = (externalId: string) => `${APP_RECORDS_URL}/funds/${externalId}/applications`;
export const getAppRecords = (uuid: string) => `${APP_RECORDS_URL}/applications/${uuid}`;
export const getCreateEnvelopeUrl = (tax_record_id: string) => `${TAX_RECORDS_URL}/${tax_record_id}/tax_documents/create_envelope`;
export const getSigningUrlUrl = (envelopeId: string, returnUrl: string) => `${TAX_RECORDS_URL}/tax_forms/${envelopeId}/form_signing_url?return_url=${returnUrl}`;
export const getProgramDocsSigningUrl = (fundSlug: string, programDocId: number, returnUrl: string) => `${APPLICATIONS_BASE_URL}/funds/${fundSlug}/company-documents/signing_url/${programDocId}?return_url=${returnUrl}`;
export const getSaveProgramDocsSigningUrl = (fundSlug: string, envelopeId: string) => `${APPLICATIONS_BASE_URL}/funds/${fundSlug}/company-documents/store_response/${envelopeId}`;
export const getTaxDocumentsListUrl = (tax_record_id: string) => `${TAX_RECORDS_URL}/${tax_record_id}/tax_documents/`;
export const getSaveSignedFormUrl = (fundExternalId: string, envelopeId: string) => `${TAX_RECORDS_URL}/${fundExternalId}/tax_documents/${envelopeId}`;
export const getCountriesUrl = (externalId: string) => `${COMPANY_REGIONS_URL}/${externalId}`;
export const getApplicationDocumentRequestListUrl = (applicationId: number) => `${APPLICATIONS_BASE_URL}/application-document-request/${applicationId}`
export const getApplicationDocumentRequestResponseUrl = () => `${APPLICATIONS_BASE_URL}/application-document-request-response`
export const getApplicationDocumentRequestResponseListUrl = (applicationId: number) => `${APPLICATIONS_BASE_URL}/application-document-request-response/${applicationId}`
export const getApplicationDocumentRequestResponseDeletetUrl = (responseId: number) => `${APPLICATIONS_BASE_URL}/application-document-response-delete/${responseId}`
export const getUserAgreementSigningUrl = (agreementId: number, returnUrl: string) => `${AGREEMENTS_URL}/signing_url/${agreementId}?return_url=${returnUrl}`;
export const storeUserResponseUrl = (envelopeId: string) => `${AGREEMENTS_URL}/store_response/${envelopeId}`;
export const getWitnessRequestUrl = (uuid: string) => `${AGREEMENTS_URL}/witness_requester/${uuid}`;
export const getWitnessAgreementSigningUrl = (uuid: string, envelopeId: string, returnUrl: string) => `${AGREEMENTS_URL}/witness_signing_url/${uuid}/document/${envelopeId}?return_url=${returnUrl}`;
export const storeWitnessResponseUrl = (uuid: string, envelopeId: string) => `${AGREEMENTS_URL}/witness_store_response/${uuid}/document/${envelopeId}`;
export const getDismissApplicationUpdateNotificationtUrl = (application_id: string) => `${APPLICATIONS_BASE_URL}/${application_id}`
export const getUpdateTaxRecordUrl = (recordUUI: string) => `${API_BASE}/api/tax_records/tax-record/${recordUUI}/update`
export const getFetchTaxDetailsUrl = (recordUUI: string) => `${API_BASE}/api/tax_records/tax-record/${recordUUI}`
export const getUploadPOAUrl = (externalId: string) => `${API_BASE}/api/companies/users/by-fund/${externalId}/attorney-document`
export const getUpdateProgramDocsUrl = (externalId: string, documentId: string) => `${API_BASE}/api/applications/funds/${externalId}/company-documents/${documentId}`
export const getCreateTaxWorkflowUrl = (fundExternalId: string) => `${TAX_RECORDS_URL}/${fundExternalId}/tax-record/workflow`;
export const getCreateTaxReviewTaskUrl = (fundExternalId: string, recordUUID: string) => `${TAX_RECORDS_URL}/${fundExternalId}/tax-record/${recordUUID}/task`;
export const getCiteriaBlockUrl = (blockId: number, direction: string, externalId: string) => `${API_BASE}/api/eligibility_criteria/${externalId}/criteria_block/${blockId}/${direction}/block`;
export const getReplyListCreateUrl = (commentId: number) => `${API_BASE}/api/comments/${commentId}/replies`;
export const getCarryDocumentSigningUrl = (carryDocument: number, returnUrl: string) => `${API_BASE}/api/carry_plans/signing_url/${carryDocument}?return_url=${returnUrl}`;
export const getSaveCarryDocsSigningUrl = (envelopeId: string) => `${API_BASE}/api/carry_plans/store_response/${envelopeId}`;
export const getFeatureFlagsUrl = (featureFlag: string) => `${API_BASE}/api/feature_flags/${featureFlag}`
export const getFirmNotciesUrl = (firmId: string, startDate: string, endDate: string) => `${INVESTOR_NOTICES_URL}/${firmId}?start_date=${startDate}&end_date=${endDate}`;
export const getSingleAllocationDetailUrl = (planId: string, allocationId: string) => `${API_BASE}/api/carry_plans/carry_pools/${planId}/allocations/${allocationId}`;