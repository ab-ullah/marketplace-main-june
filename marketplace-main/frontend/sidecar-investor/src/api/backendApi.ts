import axios from "axios";
import insp from 'inspectlet-es';
import {
  Comment,
  KYCDocument,
  KYCRecordResponse,
  WorkFlow,
  WorkflowAnswerPayload,
  WorkFlowStatus
} from '../interfaces/workflows'
import {Application} from '../interfaces/application'
import {
  ADMIN_INVESTOR_USER_URL,
  ANALYTICS_ENTITY_ACTION_URL,
  APP_RECORDS_URL,
  capitalCallDetailUrl,
  COMMENTS_URL,
  deleteDocumentUrl,
  documentDownloadUrl,
  FIRST_LOGIN_URL,
  FUND_INTEREST_URL,
  FUND_SALES_URL,
  fundInvestorDetailUrl,
  getApplicationDocumentRequestListUrl,
  getApplicationDocumentRequestResponseDeletetUrl,
  getApplicationDocumentRequestResponseListUrl,
  getApplicationDocumentRequestResponseUrl,
  getAppRecords,
  getCompanyProfileUrl,
  getCountriesUrl,
  getCreateEnvelopeUrl,
  getCreateTaxReviewTaskUrl,
  getCreateTaxWorkflowUrl,
  getDismissApplicationUpdateNotificationtUrl,
  getFetchTaxDetailsUrl,
  getFundAppRecords,
  getFundProfileURL,
  getFundsDemandURL,
  getFundsInvestmentsURL,
  getFundTaxFormsUrl,
  getKYCCommentsUpdateURL,
  getKYCCommentsURL,
  getKYCDocumentDeletionURL,
  getKYCDocumentsURL,
  getKYCParticipantRecordCreateURL,
  getKYCParticipantRecordDocumentsURL,
  getKYCParticipantRecordFetchURL,
  getKYCParticipantRecordUpdateURL,
  getKYCRecordCreateURL,
  getKYCRecordFetchURL,
  getKYCRecordUpdateURL,
  getNonInvestedOpportunitiesUrl,
  getProgramDocsSigningUrl,
  getSaveProgramDocsSigningUrl,
  getSaveSignedFormUrl,
  getSigningUrlUrl,
  getTaxDocumentDeletionURL,
  getTaxDocumentsListUrl,
  getTaxRecordsCreateUrl,
  getUpdateProgramDocsUrl,
  getUpdateTaxRecordUrl,
  getUploadPOAUrl,
  getUserAgreementSigningUrl,
  getWitnessAgreementSigningUrl,
  getWitnessRequestUrl,
  getWorkflowsURLByFund,
  INVESTOR_DETAIL_URL,
  INVESTOR_PROFILES_URL,
  NOTIFICATIONS_FILTERS_URL,
  NOTIFICATIONS_URL,
  ORDERS_URL,
  reviewKYCRecordUpdateURL,
  storeUserResponseUrl,
  storeWitnessResponseUrl,
  UNREAD_NOTIFICATION_COUNT_URL,
  updateNotificationUrl,
  updateOrderDetailURL,
  USER_INFO_URL,
  USERS_URL,
  getCiteriaBlockUrl,
  getFundIndicateInterestURL,
  getReplyListCreateUrl,
  getCompanyThemeUrl,
  PENDING_CARRY_DOCUMENTS_URL,
  CARRY_DOCUMENTS_URL,
  getCarryDocumentSigningUrl,
  getSaveCarryDocsSigningUrl,
  getFeatureFlagsUrl,
  CARRY_ALLOCATIONS_URL,
  CARRY_OVERVIEW_URL,
  getAllocationOverviewUrl,
  getVestingScheduleUrl,
  INVESTOR_NOTICES_URL,
  INVESTOR_NOTICES_DETAILS_URL,
  getFirmNotciesUrl,
  INVESTOR_NOTICES_VALUATION_DETAILS_URL,
  INVESTOR_NOTICES_VALUATIONS_URL,
  ADVISOR_USER_URL,
  getSingleAllocationDetailUrl,
  ADMIN_CONSIDERATION_INVESTOR_USER_URL,
  CARRY_COMMITMENTS_URL, INVESTOR_CURRENCIES_URL,
  TOTAL_COMPENSATION_URL, 
  TOTAL_COMPENSATION_HISTORY_URL
} from "./routes";
import {COMMENT_UPDATED} from "../constants/commentStatus";

import download from 'downloadjs'
import {formatDateTime} from "../pages/KnowYourCustomer/utils";
import {parseNativeDate} from "../utils/dateFormatting";

class RetailMarketAPI {
  getHeaders = (token: string) => ({
    Authorization: `Bearer ${token}`,
  });


  getOpportunities = async (companySlug: string) => {
    const url = getNonInvestedOpportunitiesUrl(companySlug);
    const response = await axios.get(url);
    return response.data;
  };
  getFundDemand = async (externalId: string) => {
    const url = getFundsDemandURL(externalId)
    const response = await axios.get(url);
    return response.data;
  };

  createOrder = async (payload: any) => {
    await axios.post(ORDERS_URL, payload);
  };

  reportFundIndicationOfInterestView = async (fundId: number) => {
    const response = await axios.post(ANALYTICS_ENTITY_ACTION_URL, {entity: 1, entity_id: fundId, user_action: 2})
    return response.data
  }

  updateOrder = async (orderId: number, payload: any) => {
    const url = updateOrderDetailURL(orderId);
    await axios.patch(url, payload);
  };

  getInvestorDetail = async (dateParams:string) => {
    const response = await axios.get(INVESTOR_DETAIL_URL+dateParams);
    return response.data;
  };

  getInvestorCurrencies = async () => {
    const response = await axios.get(INVESTOR_CURRENCIES_URL);
    return response.data;
  };


  getInvestorNotices = async (startDate: Date, endDate: Date) => {
    const formattedStartDate = parseNativeDate(startDate)
    const formattedEndDate = parseNativeDate(endDate)
    const response = await axios.get(`${INVESTOR_NOTICES_URL}?start_date=${formattedStartDate}&end_date=${formattedEndDate}`);
    return response.data;
  };

  getInvestorNoticesDetails = async (startDate: Date, endDate: Date) => {
    const formattedStartDate = parseNativeDate(startDate)
    const formattedEndDate = parseNativeDate(endDate)
    const response = await axios.get(`${INVESTOR_NOTICES_DETAILS_URL}?start_date=${formattedStartDate}&end_date=${formattedEndDate}`);
    return response.data;
  };

  getInvestorNoticesValuationsDetails = async (startDate: Date | null | undefined, endDate: Date | null | undefined) => {
    let qs = `${INVESTOR_NOTICES_VALUATION_DETAILS_URL}`
    if(startDate && endDate) {
      const formattedStartDate = parseNativeDate(startDate)
      const formattedEndDate = parseNativeDate(endDate)
      qs = `${INVESTOR_NOTICES_VALUATION_DETAILS_URL}?start_date=${formattedStartDate}&end_date=${formattedEndDate}`
    }
    const response = await axios.get(qs);
    return response.data;
  };

  getInvestorProfiles = async () => {
    const response = await axios.get(INVESTOR_PROFILES_URL);
    return response.data;
  };

  getFundInvestments = async (payload:{externalId: string, dateParams:string}) => {
    const url = getFundsInvestmentsURL(payload.externalId);
    const response = await axios.get(url+payload.dateParams);
    return response.data;
  };

  createSale = async (payload: any) => {
    await axios.post(FUND_SALES_URL, payload);
  };

  getCapitalCallDetails = async (capitalCallUUID: string) => {
    const url = capitalCallDetailUrl(capitalCallUUID);
    const response = await axios.get(url);
    return response.data;
  };

  createUser = async (payload: any) => {
    const response = await axios.post(USERS_URL, payload);
    return response.data
  };


  getInvestorUsers = async () => {
    const response = await axios.get(ADMIN_INVESTOR_USER_URL);
    return response.data
  };

  getConsiderationInvestorUsers = async () => {
    const response = await axios.get(ADMIN_CONSIDERATION_INVESTOR_USER_URL);
    return response.data
  };

  getAdvisorUsers = async () => {
    const response = await axios.get(ADVISOR_USER_URL);
    return response.data
  };

  getUserInfo = async () => {
    const response = await axios.get(USER_INFO_URL);
    insp(['tagSession',  {userid: response.data?.id}]);
    return response.data
  };
  
  getCompanyTheme = async (company:string) => {
    try {
      const response = await axios.get(getCompanyThemeUrl(company))
      return { success: true, data: response.data }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      return { success: false, message: err.message }
    }
  }

  getFirmNotices = async (firmId: string, startDate: Date, endDate: Date) => {
    const formattedStartDate = parseNativeDate(startDate)
    const formattedEndDate = parseNativeDate(endDate)
    const url = getFirmNotciesUrl(firmId, formattedStartDate, formattedEndDate);
    const response = await axios.get(url);
    return response.data
  };

  getFirmNoticesValuations = async (firmId: string, startDate?: Date | null | undefined, endDate?: Date | null | undefined) => {
    let url = `${INVESTOR_NOTICES_VALUATIONS_URL}/${firmId}`
    if(startDate && endDate) {
      const formattedStartDate = parseNativeDate(startDate)
      const formattedEndDate = parseNativeDate(endDate)
      url = `${INVESTOR_NOTICES_VALUATIONS_URL}/${firmId}?start_date=${formattedStartDate}&end_date=${formattedEndDate}`
    }
    const response = await axios.get(url);
    return response.data
  };

  registerFirstLogin = async () => {
    const response = await axios.get(FIRST_LOGIN_URL);
    return response.data
  };

  getUnreadNotificationCount = async () => {
    const response = await axios.get(UNREAD_NOTIFICATION_COUNT_URL);
    return response.data
  };

  getNotifications = async (qs: string | null) => {
    const url = `${NOTIFICATIONS_URL}?${qs}`
    const response = await axios.get(url);
    return response.data;
  };

  getNotificationsPage = async (url?: string | null) => {
    const response = await axios.get(url ? url : NOTIFICATIONS_URL);
    return response.data;
  };

  getNotificationFilters = async (qs: string | null) => {
    let url = NOTIFICATIONS_FILTERS_URL
    if (qs) url = `${url}?${qs}`
    const response = await axios.get(url);
    return response.data;
  };

  updateNotification = async (notificationId: number, payload: any) => {
    const url = updateNotificationUrl(notificationId);
    const response = await axios.patch(url, payload);
    return response.data;
  };

  downloadDocument = async (documentId: string, name: string) => {
    const url = documentDownloadUrl(documentId);
    const response = await axios.get(url, {responseType: 'blob'})
    const content = response.headers['content-type'];
    download(response.data, name, content)
  }

  deleteDocument = async (documentId: number) => {
    const url = deleteDocumentUrl(documentId)
    const response = await axios.delete(url);
    return response.data
  };

  getCompanyProfile = async (companySlug: string) => {
    const url = getCompanyProfileUrl(companySlug);
    const response = await axios.get(url)
    return response.data;
  }

  getFundProfile = async (externalId: string) => {
    const url = getFundProfileURL(externalId)
    const response = await axios.get(url)
    return response.data;
  }

  createFundIndicationOfInterest = async (externalId: string, payload: any) => {
    const url = getFundIndicateInterestURL(externalId)
    const response = await axios.post(url, payload)
    return response.data;
  }

  createFundInterest = async (payload: any) => {
    const response = await axios.post(FUND_INTEREST_URL, payload)
    return response.data;
  }

  getFundWorkflows = async (externalId: string) => {
    const url = getWorkflowsURLByFund(externalId)
    const response = await axios.get(url)
    return response.data as WorkFlow[];
  }

  getKYCRecord = async (uuid: string, applicationId: number | undefined) => {
    const url = getKYCRecordFetchURL(uuid, applicationId)
    const response = await axios.get(url)
    return response.data as KYCRecordResponse;
  }

  createKYCRecord = async (workflowSlug: string, status: WorkFlowStatus, payload: WorkflowAnswerPayload) => {
    const url = getKYCRecordCreateURL(workflowSlug)
    const response = await axios.post(url, {
      status: status.id,
      ...payload
    })
    return response.data;
  }

  updateKYCRecord = async (workflowSlug: string, recordId: number, payload: WorkflowAnswerPayload) => {
    const url = getKYCRecordUpdateURL(workflowSlug, recordId)
    const response = await axios.patch(url, payload);
    return response.data;
  }

  reviewKYCRecord = async (externalId: string, recordId: number) => {
    const url = reviewKYCRecordUpdateURL(recordId, externalId)
    const response = await axios.get(url);
    return response.data;
  }

  updateKYCRecordStatus = async (workflowSlug: string, recordId: number, status: WorkFlowStatus) => {
    const url = getKYCRecordUpdateURL(workflowSlug, recordId)
    const response = await axios.patch(url, {
      status: status.id
    })
    return response.data;
  }

  uploadDocumentToKYCRecord = async (recordId: number, formData: FormData) => {
    const url = getKYCDocumentsURL(recordId, undefined)
    const response = await axios.post(url, formData, {
      headers: {
        'content-type': 'multipart/form-data'
      }
    })
    return response.data;
  }

  getDocumentsInKYCRecord = async (recordId: number, applicationId: number | undefined) => {
    const url = getKYCDocumentsURL(recordId, applicationId)
    const response = await axios.get(url)
    return response.data as KYCDocument[];
  }

  getActiveKYComments = async (kycRecordId: number) => {
    const url = getKYCCommentsURL(kycRecordId);
    const response = await axios.get(url);
    return response.data as Comment[];
  }

  getActiveApplicationComments = async (applicationId: number) => {
    const url = getKYCCommentsURL(applicationId);
    const response = await axios.get(url);
    return response.data as Comment[];
  }

  getKYCCommentsByKycId = async (kycRecordId: number) => {
    const response = await axios.get(`${COMMENTS_URL}?kyc_id=${kycRecordId}`);
    return response.data as Comment[];
  }

  getKYCCommentsByApplicationId = async (applicationId: number) => {
    const response = await axios.get(`${COMMENTS_URL}?application_id=${applicationId}`);
    return response.data as Comment[];
  }

  setKYCCommentStatusAsUpdated = async (commentId: number) => {
    const url = getKYCCommentsUpdateURL(commentId);
    const response = await axios.patch(url, {status: COMMENT_UPDATED});
    return response.data;
  }

  getKYCDocumentAsDataURI = async (documentId: string) => {
    const url = documentDownloadUrl(documentId);
    const response = await axios.get(url, {responseType: 'arraybuffer'});
    let raw = Buffer.from(response.data).toString('base64');
    const fileURL = "data:" + response.headers["content-type"] + ";base64," + raw;
    const fileType = response.headers["content-type"];
    return {fileURL, fileType};
  }

  deleteKYCDocument = async (kycRecordId: number, documentId: string, fundExternalId: string) => {
    const url = getKYCDocumentDeletionURL(kycRecordId, documentId, fundExternalId);
    const response = await axios.delete(url);
    return response.data;
  }

  getTaxForms = async (fundExternalId: string) => {
    const url = getFundTaxFormsUrl(fundExternalId);
    const response = await axios.get(url);
    return response.data;
  }

  createTaxRecord = async (externalId: string) => {
    const url = getTaxRecordsCreateUrl(externalId);
    const response = await axios.post(url);
    return response.data;
  }

  getAppRecords = async (externalId: string) => {
    const url = getFundAppRecords(externalId);
    const response = await axios.get(url);
    return response.data as Application[];
  }

  createAppRecord = async (payload: any) => {
    const response = await axios.post(APP_RECORDS_URL + '/', payload);
    return response.data;
  }

  updateAppRecord = async (uuid: string, payload: any) => {
    const url = getAppRecords(uuid);
    const response = await axios.patch(url, payload);
    return response.data;
  }

  createKYCEntityRecord = async (workflowSlug: string, payload: any) => {
    const url = getKYCRecordCreateURL(workflowSlug);
    const response = await axios.post(url, payload);
    return response.data;
  }

  createKYCParticipantRecord = async (workflowSlug: string, kycRecordId: number) => {
    const url = getKYCParticipantRecordCreateURL(workflowSlug, kycRecordId);
    const response = await axios.post(url);
    return response.data;
  }

  createEnvelope = async (taxRecordUUID: string, payload: any) => {
    const url = getCreateEnvelopeUrl(taxRecordUUID);
    const response = await axios.post(url, payload);
    return response.data;
  }

  getSigningUrl = async (envelopeId: string, returnUrl: string) => {
    const url = getSigningUrlUrl(envelopeId, returnUrl);
    const response = await axios.get(url);
    return response.data;
  }

  getProgramDocsSigning = async (externalId: string, programDocId: number, returnUrl: string) => {
    const url = getProgramDocsSigningUrl(externalId, programDocId, returnUrl);
    const response = await axios.get(url);
    return response.data;
  }

  updateParticipantRecord = async (workflowSlug: string, kycRecordId: number, participantId: number, payload: any) => {
    const url = getKYCParticipantRecordUpdateURL(workflowSlug, kycRecordId, participantId);
    const response = await axios.patch(url, payload);
    return response.data;
  }

  getKYCParticipantRecord = async (workflowSlug: string, kycRecordId: number, participantId: number) => {
    const url = getKYCParticipantRecordFetchURL(workflowSlug, kycRecordId, participantId);
    const response = await axios.get(url);
    return response.data;
  }

  getTaxDocumentsList = async (tax_record_id: string) => {
    const url = getTaxDocumentsListUrl(tax_record_id);
    const response = await axios.get(url);
    return response.data;
  }

  getKYCParticipantDocuments = async (workflowSlug: string, kycRecordId: number, participantId: number, 
    applicationId: number | undefined = undefined) => {
    const url = getKYCParticipantRecordDocumentsURL(workflowSlug, kycRecordId, participantId, applicationId);
    const response = await axios.get(url);
    return response.data;
  }

  saveSignedForm = async (fundExternalId: string, envelopeId: string) => {
    const url = getSaveSignedFormUrl(fundExternalId, envelopeId);
    const response = await axios.put(url);
    return response.data;
  }

  saveProgramDocsSigningUrl = async (fundSlug: string, envelopeId: string) => {
    const url = getSaveProgramDocsSigningUrl(fundSlug, envelopeId);
    const response = await axios.get(url);
    return response.data;
  }

  getRegionCountries = async (externalId: string) => {
    const url = getCountriesUrl(externalId);
    const response = await axios.get(url);
    return response.data
  };

  deleteTaxDocument = async (recordId: number, documentId: string) => {
    const url = getTaxDocumentDeletionURL(recordId, documentId);
    const response = await axios.delete(url);
    return response.data;
  }

  uploadKYCParticipantDocument = async (workflowSlug: string, kycRecordId: number, participantId: number, formData: FormData) => {
    const url = getKYCParticipantRecordDocumentsURL(workflowSlug, kycRecordId, participantId);
    const response = await axios.post(url, formData, {
      headers: {'content-type': 'multipart/form-data'}
    });
    return response.data;
  }

  updateKYCParticipantStatus = async (workflowSlug: string, recordId: number, participantId: number, status: WorkFlowStatus) => {
    const url = getKYCParticipantRecordUpdateURL(workflowSlug, recordId, participantId)
    const response = await axios.patch(url, {
      status: status.id
    })
    return response.data;
  }

  getAgreementsSigningUrl = async (agreementId: number, returnUrl: string) => {
    const url = getUserAgreementSigningUrl(agreementId, returnUrl)
    const response = await axios.get(url)
    return response.data
  }

  storeUserResponse = async (envelopeId: string) => {
    const url = storeUserResponseUrl(envelopeId)
    const response = await axios.get(url)
    return response.data
  }

  getWitnessRequesterInfo = async (uuid: string) => {
    const url = getWitnessRequestUrl(uuid)
    const response = await axios.get(url)
    return response.data
  }

  getWitnessAgreementsSigningUrl = async (uuid: string, envelopeId: string, returnUrl: string) => {
    const url = getWitnessAgreementSigningUrl(uuid, envelopeId, returnUrl)
    const response = await axios.get(url)
    return response.data
  }

  storeWitnessResponse = async (uuid: string, envelopeId: string) => {
    const url = storeWitnessResponseUrl(uuid, envelopeId)
    const response = await axios.get(url)
    return response.data
  }

  fetchApplicationDocumentRequests = async (applicationId: any) => {
    const url = getApplicationDocumentRequestListUrl(applicationId)
    const response = await axios.get(url);
    return response.data
  };

  uploadApplicationDocumentRequestResponse = async (payload: FormData) => {
    const url = getApplicationDocumentRequestResponseUrl()
    const response = await axios.post(url, payload, {
      headers: {'content-type': 'multipart/form-data'}
    });
    return response.data
  };

  uploadSignedPowerOfAttorney = async (externalId: string, payload: FormData) => {
    const url = getUploadPOAUrl(externalId);
    const response = await axios.patch(url, payload, {
      headers: {'content-type': 'multipart/form-data'}
    });
    return response.data
  };

  updateProgramDocs = async (externalId: string, documentId: string, payload: FormData) => {
    const url = getUpdateProgramDocsUrl(externalId, documentId);
    const response = await axios.patch(url, payload, {
      headers: {'content-type': 'multipart/form-data'}
    });
    return response.data
  };

  fetchApplicationDocumentRequestResponse = async (applicationId: any) => {
    const url = getApplicationDocumentRequestResponseListUrl(applicationId)
    const response = await axios.get(url);
    return response.data
  };

  deleteApplicationDocumentRequestResponse = async (applicationId: any) => {
    const url = getApplicationDocumentRequestResponseDeletetUrl(applicationId)
    const response = await axios.delete(url)
    return response.data
  };

  dismissApplicationUpdateNotification = async (payload: {
    application_id: string;
    application_fields: { is_application_updated: boolean };
  }) => {
    const {application_id, application_fields} = payload;
    const url = getDismissApplicationUpdateNotificationtUrl(application_id);
    const response = await axios.patch(url, application_fields);
    return response.data;
  }

  updateTaxRecord = async (recordUUI: string, payload: any) => {
    const url = getUpdateTaxRecordUrl(recordUUI);
    const response = await axios.patch(url, payload);
    return response.data;
  }

  fetchTaxDetails = async (record_id: string) => {
    const url = getFetchTaxDetailsUrl(record_id)
    const response = await axios.get(url);
    return response.data
  };

  createTaxWorkflow = async (fund_external_id: string) => {
    const url = getCreateTaxWorkflowUrl(fund_external_id)
    const response = await axios.post(url);
    return response.data
  };

  createTaxReviewTask = async (fund_external_id: string, recordUUID: string) => {
    const url = getCreateTaxReviewTaskUrl(fund_external_id, recordUUID);
    const response = await axios.post(url);
    return response.data
  };

  fetchCriteriaBlock = async (blockId: any, direction: string, externalId: string) => {
    const response = await axios.get(getCiteriaBlockUrl(blockId, direction, externalId));
    return response.data
  };

  createReply = async (commentId: number, payload: any) => {
    const url = getReplyListCreateUrl(commentId)
    const response = await axios.post(url, payload)
    return response.data;
  };

  getCarryDocuments = async () => {
    const response = await axios.get(PENDING_CARRY_DOCUMENTS_URL)
    return response.data
  }

  getCarryCommitments = async () => {
    const response = await axios.get(CARRY_COMMITMENTS_URL)
    return response.data
  }

  getCarryDocumentsByCarryPlan = async (externalId: string) => {
    const response = await axios.get(CARRY_DOCUMENTS_URL, {params: {"external_id": externalId}})
    return response.data
  }


  getCarryAllocations = async () => {
    const response = await axios.get(CARRY_ALLOCATIONS_URL)
    return response.data
  }

  getCarryAllocationFromCarryPlan = async (externalId: string) => {
    const url = getAllocationOverviewUrl(externalId)
    const response = await axios.get(url)
    return response.data
  }

  getCarryOverview = async () => {
    const response = await axios.get(CARRY_OVERVIEW_URL)
    return response.data
  }

  acknowledgeCarryDocument = async (carryDocumentId: number) => {
    const payload = {is_acknowledged: true}
    const response = await axios.patch(`${CARRY_DOCUMENTS_URL}/${carryDocumentId}`, payload)
    return response.data
  }

  getCarrySigningURL = async (carryDocumentId: number, returnURL: string) => {
    const url = getCarryDocumentSigningUrl(carryDocumentId, returnURL)
    const response = await axios.get(url)
    return response.data
  }

  saveCarryDocsSigningUrl = async (envelopeId: string) => {
    const url = getSaveCarryDocsSigningUrl(envelopeId);
    const response = await axios.get(url);
    return response.data;
  }

  fetchFeatureFlag = async (featureFlag: string) => {
    const response = await axios.get(getFeatureFlagsUrl(featureFlag));
    return response.data;
  }

  async getVestingSchedule(vestingScheduleId: number, planExternalId: string) {
    const response = await axios.get(getVestingScheduleUrl(vestingScheduleId.toString(), planExternalId));
    return response.data;
  }

  fetchAllocationDetail = async (planId: string, allocationId: string) => {
    const response = await axios.get(getSingleAllocationDetailUrl(planId, allocationId));
    return response.data;
  }

  fetchLatestCompensation = async () => {
    try {
      const response = await axios.get(TOTAL_COMPENSATION_URL);
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, data: error?.response?.data };
    }
  };

  fetchCompensationHistory = async () => {
    try {
      const response = await axios.get(TOTAL_COMPENSATION_HISTORY_URL);
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, data: error?.response?.data };
    }
  }

  fetchCompensationCarryAllocations = async () => {
    try {
      const response = await axios.get(CARRY_ALLOCATIONS_URL);
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, data: error?.response?.data };
    }
  }

  fetchCarryAllocationDetail = async (carryPlanId: string, allocationId: string) => {
    const response = await axios.get(getSingleAllocationDetailUrl(carryPlanId, allocationId));
    return response.data;
  }
}

export default new RetailMarketAPI();