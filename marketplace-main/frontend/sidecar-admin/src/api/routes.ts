const API_BASE = process.env.REACT_APP_API_URL;
const SOCKET_BASE = process.env.REACT_APP_WS_URL;


export const FUNDS_URL = `${API_BASE}/api/admin/funds/`
export const APPLICATIONS_URL = `${API_BASE}/api/admin/applications/`
export const CAPITAL_CALL_URL = `${API_BASE}/api/capital_calls/`
export const CAPITAL_CALL_ADMIN_URL = `${API_BASE}/api/admin/capital_calls/`
export const DISTRIBUTION_NOTICE_ADMIN_URL = `${API_BASE}/api/admin/distribution_notices/`
export const ADMIN_STATS_URL = `${FUNDS_URL}admin`
export const OPPORTUNITIES_URL = `${API_BASE}/api/investors/opportunities/`
export const INVESTOR_DETAIL_URL = `${API_BASE}/api/investors/detail/`
export const ORDERS_URL = `${API_BASE}/api/investors/orders/`
export const INVESTOR_PROFILES_URL = `${API_BASE}/api/investors/profiles/`
export const USERS_URL = `${API_BASE}/api/admin/users/`
export const PARTICIPANTS_INVITE_URL = `${API_BASE}/api/admin/users/invites`
export const PARTICIPANTS_LIST_URL = `${API_BASE}/api/admin/users/participants`
export const USER_INFO_URL = `${API_BASE}/api/users/info`
export const NOTIFICATIONS_URL = `${API_BASE}/api/notifications/`
export const NOTIFICATIONS_FILTERS_URL = `${API_BASE}/api/notifications/filters`
export const FUND_INVESTOR_URL = `${API_BASE}/api/investors/funds/`
export const CURRENCIES_URL = `${API_BASE}/api/admin/currencies/`
export const DOCUMENTS_URL = `${API_BASE}/api/documents/`
export const COMPANIES_URL = `${API_BASE}/api/companies/`
export const COMPANY_INFO_URL = `${API_BASE}/api/admin/companies/`
export const COMPANY_INFO_DOC_URL = `${API_BASE}/api/admin/companies/documents`
export const getCompanyInfoDocURL = (id: any) => `${API_BASE}/api/admin/companies/documents/${id}`;
export const COMPANY_TOKENS_URL = `${API_BASE}/api/companies/tokens`
export const COMPANY_REGIONS_URL = `${API_BASE}/api/admin/geographics/region_countries`
export const ELIGIBILITY_CRITERIA_URL = `${API_BASE}/api/admin/eligibility_criteria/`
export const KYC_RECORDS_URL = `${API_BASE}/api/kyc_records/`
export const ADMIN_KYC_RECORDS_URL = `${API_BASE}/api/admin/kyc_records/`
export const COMMENTS_URL = `${API_BASE}/api/admin/comments/`
export const TAX_RECORDS_ADMIN_URL = `${API_BASE}/api/admin/tax_records`
export const TAX_RECORDS_URL = `${API_BASE}/api/tax_records`
export const ADMIN_AGREEMENTS_URL = `${API_BASE}/api/admin/agreements`
export const getTaskCountURL = (tokenId: string) => `${SOCKET_BASE}/tasks/recent-count/?token=${tokenId}`
export const ELIGIBILITY_CRITERIA_BLOCKS_URL = `${ELIGIBILITY_CRITERIA_URL}blocks`
export const ALL_USERS_URL = `${API_BASE}/api/admin/users/all`
export const CARRY_POOL_URL = `${API_BASE}/api/admin/carry_pools`
export const getFeatureFlagsUrl = (featureFlag: string) => `${API_BASE}/api/admin/feature_flags/${featureFlag}`
export const FEATURE_FLAGS_URL = `${API_BASE}/api/admin/feature_flags`
export const CARRY_PARTICIPANT_ENTITY_TYPES_URL = `${API_BASE}/api/admin/carry_pools/participants/entity-types`

export const getEligibilityCriteriaDecisionUrl = (criteriaId: number) => `${ELIGIBILITY_CRITERIA_URL}${criteriaId}/decision`
export const getDecisionByIdUrl = (criteriaId: number) => `${ELIGIBILITY_CRITERIA_URL}${criteriaId}/custom/decision`
export const getCreateConnectionUrl = (criteriaId: number) => `${ELIGIBILITY_CRITERIA_URL}${criteriaId}/smart_block/connector`
export const getDeleteConnectionUrl = (criteriaId: number) => `${ELIGIBILITY_CRITERIA_URL}${criteriaId}/smart_block/connector/delete`
export const getNextBockUrl = () => `${API_BASE}/api/eligibility_criteria/response/criteria_block/`


export const FUND_TAGS_URL = `${API_BASE}/api/admin/funds/tags`;
export const START_PUSH_URL = `${API_BASE}/api/admin/backups/book_pushes`;
export const getInvestorAccountCodeUploadURL = (externalId: string) => `${API_BASE}/api/admin/applications/funds/${externalId}/investor-account-codes`


export const createManagersUrl = (externalId: string) =>
  `${FUNDS_URL}${externalId}/managers`;
export const updateUserUrl = (userId: number) => `${USERS_URL}${userId}`
export const createApplicationDocumentUrl = (applicationId: number) => `${APPLICATIONS_URL}${applicationId}/supporting-document`
export const updateApplicationDocumentUrl = (applicationId: number, applicationDocumentId: number) => `${APPLICATIONS_URL}${applicationId}/supporting-document/${applicationDocumentId}`
export const createFundDocURL = (externalId: string) => `${API_BASE}/api/admin/funds/${externalId}/documents/create`
export const getCarryPoolURL = (externalId: string) => `${CARRY_POOL_URL}/funds/${externalId}/carry-pools`
export const getAllocationActionURL = (externalId: string) => `${CARRY_POOL_URL}/funds/${externalId}/allocation-actions`
export const FundDetailDocURL = (externalId: string) => `${API_BASE}/api/admin/funds/${externalId}/public/document`
export const exportInterestAnswers = (externalId: string) => `${API_BASE}/api/admin/funds/interest/${externalId}/export`
export const getFundDocURL = (externalId: string) => `${API_BASE}/api/admin/funds/${externalId}/documents`
export const updateCompanyTokenURL = (tokenId: number) => `${COMPANY_TOKENS_URL}/${tokenId}`
export const updateFundURL = (fundId: number) => `${FUNDS_URL}${fundId}`
export const publishFundURL = (fundId: number) => `${FUNDS_URL}${fundId}/publish`
export const getFundsDetailURL = (externalId: string) => `${FUNDS_URL}external_id/${externalId}`
export const getFundsBaseInfoURL = (externalId: string) => `${FUNDS_URL}external_id/${externalId}/base-info`
export const getFundsInvestmentsURL = (externalId: string) => `${FUND_INVESTOR_URL}${externalId}/detail`
export const updateOrderDetailURL = (orderId: number) => `${ORDERS_URL}${orderId}`
export const fundInvestorDetailUrl = (fundInvestorId: string) => `${FUND_INVESTOR_URL}${fundInvestorId}`
export const capitalCallDetailUrl = (capitalCallUUID: string) => `${CAPITAL_CALL_URL}${capitalCallUUID}`
export const documentDownloadUrl = (documentId: string) => `${DOCUMENTS_URL}${documentId}`
export const updateNotificationUrl = (notificationId: number) => `${NOTIFICATIONS_URL}${notificationId}`
export const eligibilityCriteriaDetailUrl = (criteriaId: number) => `${ELIGIBILITY_CRITERIA_URL}${criteriaId}`
export const eligibilityCriteriaUpdateUrl = (criteriaId: number) => `${ELIGIBILITY_CRITERIA_URL}${criteriaId}/edit`
export const eligibilityCriteriaPreviewUrl = (criteriaId: number) => `${ELIGIBILITY_CRITERIA_URL}${criteriaId}/preview`
export const createBlockUrl = (criteriaId: number) => `${ELIGIBILITY_CRITERIA_URL}${criteriaId}/block`
export const validateCustomExpressionUrl = () => `${ELIGIBILITY_CRITERIA_URL}validate-update-custom-expression`
export const createBlockDocumentUrl = (criteriaId: number) => `${ELIGIBILITY_CRITERIA_URL}${criteriaId}/documents`
export const getBlockDocumentsUrl = (criteriaId: number) => `${ELIGIBILITY_CRITERIA_URL}${criteriaId}/documents/list`
export const updateConnectorUrl = (connectorId: number) => `${ELIGIBILITY_CRITERIA_URL}connector/${connectorId}`
export const customLogicBlockUrl = (criteriaId: number) => `${ELIGIBILITY_CRITERIA_URL}${criteriaId}/custom_logic_block`
export const updateCriteriaBlockUrl = (connectorId: number) => `${ELIGIBILITY_CRITERIA_URL}criteria_block/${connectorId}`
export const getEligibilityCriteriaCard = (responseId: number) => `${ELIGIBILITY_CRITERIA_URL}response/${responseId}/`
export const deleteDocumentUrl = (documentId: number) => `${DOCUMENTS_URL}${documentId}`
export const getWorkflowsURLByFund = (externalId: string) => `${API_BASE}/api/admin/workflows/funds/${externalId}/`
export const getKYCRecordsByWorkflow = (workflowSlug: string) => `${KYC_RECORDS_URL}workflows/${workflowSlug}/kyc_records`
export const getKYCDocumentsURL = (kycRecordId: number, applicationId: number | undefined) => `${KYC_RECORDS_URL}${kycRecordId}/documents${applicationId ? `?application_id=${applicationId}` : ''}`
export const getKYCParticipantDocumentsURL = (workflowSlug: string, kycRecordId: number, participantId: number, applicationId: number | undefined) => `${KYC_RECORDS_URL}workflows/${workflowSlug}/kyc_records/${kycRecordId}/participants/${participantId}/documents${applicationId ? `?application_id=${applicationId}` : ''}`
export const getKYCRiskEvaluationURL = (kycRecordId: number) => `${KYC_RECORDS_URL}${kycRecordId}/risk_evaluation`
export const getKYCCommentsUpdateURL = (commentId: number) => `${COMMENTS_URL}update/${commentId}`;
export const getIndicationOfInterestAnalyticsUrl = (externalId: string) => `${API_BASE}/api/analytics/fund/${externalId}/indication-of-interest`
export const getIndicationOfInterestAnalyticsExportUrl = (externalId: string, fund_id: number) => `${API_BASE}/api/analytics/fund/${externalId}/indication-of-interest/${fund_id}/export`
export const getTaxRecords = () => `${TAX_RECORDS_ADMIN_URL}/`;
export const getTaxFormsUrl = (recordId: number) => `${TAX_RECORDS_ADMIN_URL}/${recordId}/documents`;
export const updateFundStatusURL = (externalId: string) => `${API_BASE}/api/funds/status/${externalId}`;
export const getSigningUrlUrl = (envelopeId: string, returnUrl: string) => `${TAX_RECORDS_URL}/tax_forms/${envelopeId}/form_signing_url?return_url=${returnUrl}`;
export const getFetchTaxDetailsUrl = (record_id: number) => `${TAX_RECORDS_ADMIN_URL}/${record_id}/tax-details/`;
export const getUserAgreementSigningUrl = (envelopeId: string, returnUrl: string) => `${ADMIN_AGREEMENTS_URL}/signing_url/${envelopeId}?return_url=${returnUrl}`;
export const storeUserResponseUrl = (envelopeId: string) => `${ADMIN_AGREEMENTS_URL}/store_response/${envelopeId}`;

export const getCompanyDocumentSigningUrl = (externalId: string, envelopeId: string, returnUrl: string) => `${API_BASE}/api/admin/applications/funds/${externalId}/company-documents/gp_signing_url/${envelopeId}?return_url=${returnUrl}`;
export const storeCompanyDocumentUserResponseUrl = (externalId: string, envelopeId: string) => `${API_BASE}/api/admin/applications/funds/${externalId}/company-documents/gp_store_response/${envelopeId}`;
export const getEligibilityCriteriaSaveTemplatesUrl = (criteriaId: number) => `${ELIGIBILITY_CRITERIA_URL}custom-block-templates/${criteriaId}`
export const getEligibilityCriteriaSaveTemplatesListUrl = () => `${ELIGIBILITY_CRITERIA_URL}custom-block-templates/`;
export const getCreateCustomBlockFromTemplateUrl = (criteriaId: number, templateId: number) => 
  `${ELIGIBILITY_CRITERIA_URL}${criteriaId}/create-from-template/${templateId}`;

export const GROUPS_URL = `${API_BASE}/api/admin/companies/groups`
export const getUpdateUserUrl = (userId: number) => `${API_BASE}/api/admin/users/${userId}/update`
export const getReplyListCreateUrl = (commentId: number) => `${API_BASE}/api/comments/${commentId}/replies`


export const createKycDocumentUrl = (kycRecordId: number) => `${ADMIN_KYC_RECORDS_URL}${kycRecordId}/documents`;

export const createTaxRecordUrl = () => `${TAX_RECORDS_ADMIN_URL}/documents/create`;

export const createProgramDocumentUrl = (
  applicationId: number
) => `${APPLICATIONS_URL}funds/${applicationId}/create-company-documents`;

export const getAdminProfileUrl = () => `${API_BASE}/api/admin_users/admin-info`;
export const getCreateFundDocumentUrl = () => `${API_BASE}/api/admin/investors/fund-document/`;
export const getCreateNoticeDocumentUrl = () => `${API_BASE}/api/admin/notices/`;
export const getCreateInvestorDocumentUrl = () => `${API_BASE}/api/admin/investors/investor-document/`;
export const getUpdateInvestorDocumentUrl = (id: string) => `${API_BASE}/api/admin/investors/investor-document/update/${id}`;
export const getFetchInvestorDocumentsUrl = () => `${API_BASE}/api/admin/investors/documents/`;
export const getInvestorDocumentDeleteUrl = (id: number, type: string) => `${API_BASE}/api/admin/investors/${type}/delete/${id}`;
export const getUploadEmployeesOnboardingUrl = () => `${API_BASE}/api/admin/employees/onboarding`;

export const getFetchInvestorDocumentsFiltersUrl = `${API_BASE}/api/admin/investors/document-filters/`;


export const getCarryPlanAllocationsUrl = (planId:string) => `${CARRY_POOL_URL}/carry-plan/${planId}/allocations`;
export const getCarryPlanAdjustmentAllocationsUrl = (planId:string) => `${CARRY_POOL_URL}/carry-plan/${planId}/adjustment-allocations`;
export const getAdjustmentAllocationByIdUrl = (adjustmentId:string) => `${CARRY_POOL_URL}/adjustments/${adjustmentId}`;
export const getCarryPlanTransferUrl = (planId:string) => `${CARRY_POOL_URL}/carry-plan/${planId}/transfer`;
export const getCarryPlanCompanyUsersUrl = (planId:string) => `${CARRY_POOL_URL}/carry-plan/${planId}/company-users`;
export const getAllocationsDilutionUrl = (planId:string) => `${CARRY_POOL_URL}/carry-plan/${planId}/dilute`;
export const getCarryPlanUrl = (planId:string) => `${CARRY_POOL_URL}/carry-plan/${planId}`;
export const getHurdleUrl = (hurdleId: string) => `${CARRY_POOL_URL}/hurdles/${hurdleId}`;

export const createCarryPoolUrl = `${CARRY_POOL_URL}/add`
export const createCarryAllocationsUrl = `${CARRY_POOL_URL}/allocations`
export const deleteCarryPoolUrl = `${CARRY_POOL_URL}/delete`
export const vestingScheduleUrl = `${CARRY_POOL_URL}/vesting-schedule/`
export const carryShareClassesUrl = `${CARRY_POOL_URL}/carry-share-class`
export const getCarryShareClassesUpdateUrl = (id: number) => `${CARRY_POOL_URL}/carry-share-class/${id}`
export const caryyVehiclesUrl = `${CARRY_POOL_URL}/carry-vehicles`
export const getCaryyVehiclesUpdateUrl = (id: number) => `${CARRY_POOL_URL}/carry-vehicles/${id}`
export const CalculateVestedPointsUrl = `${CARRY_POOL_URL}/calculate-vested-points`
export const CarryPlanUrl = `${CARRY_POOL_URL}/carry-plans`
export const CarryPlanFirmOverviewUrl = `${CARRY_POOL_URL}/carry-plans/firm-level-overview`
export const ManagerFirmOverviewUrl = `${CARRY_POOL_URL}/reporting/manager`
export const CarryFundsListUrl = `${CARRY_POOL_URL}/carry-funds`
export const CarryPlanMilestoneDateUrl = `${CARRY_POOL_URL}/carry-plan-milestone`
export const CarryFundsCreateUrl = CarryFundsListUrl
export const CarryParticipantsUrl = `${CARRY_POOL_URL}/participants`
export const CarryParticipantsUngroupedUrl = `${CARRY_POOL_URL}/carry-participant`
export const CarryUsersUrl = `${CARRY_POOL_URL}/all-users`
export const CarryDealsUrl = `${CARRY_POOL_URL}/deals`
export const CarryTemplateDocsUrl = `${CARRY_POOL_URL}/carry-documents`
export const CarryParticipantsDocsUrl = `${CARRY_POOL_URL}/carry-document-participants`
export const getCarryParticipantDocUrl =(docId:any)=> `${CARRY_POOL_URL}/carry-document-participant/${docId}`
export const CreateCarryParticipantUrl = `${CARRY_POOL_URL}/carry-participant`
export const CarryDistributionUrl = `${CARRY_POOL_URL}/distributions`
export const CarryCommitmentsUrl = `${CARRY_POOL_URL}/carry-gp-commits`

export const CarryDistributionDetailUrl =(distId:string)=> `${CARRY_POOL_URL}/distribution/${distId}`

export const CarryParticipantByIdUrl = (participantId:string) => `${CarryParticipantsUrl}/${participantId}`
export const CarryParticipantForfeitureUrl = (participantId:string) => `${CARRY_POOL_URL}/forfeiture/${participantId}`
export const UserAllocationsByIdUrl = (participantId:string) => `${CARRY_POOL_URL}/user-carry-allocations/${participantId}`
export const CarryParticipantCompansationHistoryUrl = (participantId:string) => `${CARRY_POOL_URL}/participants/${participantId}/compensation_history`
export const getCarryFundDealsByIdUrl = (fundId:string) => `${CARRY_POOL_URL}/funds/${fundId}/deals`
export const VestingScheduleByIdUrl = (scheduleId:any) => `${vestingScheduleUrl}${scheduleId}/display`
export const getCarryFundAllocationsByIdUrl = (fundId:string) => `${CARRY_POOL_URL}/carry-funds/${fundId}/allocations`
export const getParticipantNotificationsUrl = `${API_BASE}/api/notifications/`
export const getParticipantCoinvestListUrl = (participantId: number) => `${CARRY_POOL_URL}/participant-investments/${participantId}`
export const getParticipantCarryDocsUrl=(participantId:string) => `${CARRY_POOL_URL}/user-carry-documents/${participantId}`
export const getCarryDealAllocationsByIdUrl = (dealId:string) => `${CARRY_POOL_URL}/deal/${dealId}/allocations`
export const getCarryInvestmentTranchesAllocationsByIdUrl = (investmentTrancheId:string) => `${CARRY_POOL_URL}/investment-tranches/${investmentTrancheId}/allocations`
export const getUpdateDealByIdUrl = (dealId:string) => `${CARRY_POOL_URL}/deal/${dealId}`
export const getUpdateCarryFundByIdUrl = (fundId:string) => `${CarryFundsListUrl}/${fundId}`
export const EditCarryTemplateDocsUrl = (id:string) => `${CARRY_POOL_URL}/carry-document/${id}`
export const getFetchParticipantDetailUrl = (participantId: string) => `${API_BASE}/api/admin/kyc_records/user/${participantId}/kyc-records`
export const getUpdateParticipantKYCUrl = (recordUUID: string) => `${API_BASE}/admin/kyc_records/${recordUUID}/update`
export const getCarryDocumentSigningUrl = (envelopeId: number, returnUrl: string) => `${CARRY_POOL_URL}/signing_url/${envelopeId}?return_url=${returnUrl}`;
export const getSaveCarryDocsSigningUrl = (envelopeId: string) => `${CARRY_POOL_URL}/store_response/${envelopeId}`
export const getCarryPlanVestingSchedulesUrl = (planId: string) => `${CARRY_POOL_URL}/carry-plan/${planId}/vesting-schedules`
export const getFetchCarryParticipantDetailUrl = (participantId: string) => `${API_BASE}/api/admin/kyc_records/carry-participant/${participantId}/kyc-records`
export const getFetchParticipantProfileUrl = (participantId: string) => `${CARRY_POOL_URL}/participants/${participantId}/profile`
export const getFetchAllocationDetailsUrl = (carryPlanId: string, allocationId: string) => `${API_BASE}/api/admin/carry_pools/carry-plan/${carryPlanId}/allocations/${allocationId}`
export const getCarryPoolBaseUrl = (id: number) => `${API_BASE}/api/admin/carry_pools/distribution/${id}`;