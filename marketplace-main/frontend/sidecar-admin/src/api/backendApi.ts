import axios from "axios";
import {Comment, KYCDocument, KYCRecordResponse, WorkFlow,} from "../interfaces/workflows";
import {
  USER_INFO_URL,
  ADMIN_STATS_URL,
  ALL_USERS_URL,
  CAPITAL_CALL_URL,
  CAPITAL_CALL_ADMIN_URL,
  DISTRIBUTION_NOTICE_ADMIN_URL,
  capitalCallDetailUrl,
  COMMENTS_URL,
  COMPANIES_URL,
  COMPANY_INFO_DOC_URL,
  COMPANY_REGIONS_URL,
  COMPANY_TOKENS_URL,
  createBlockDocumentUrl,
  createBlockUrl,
  CURRENCIES_URL,
  deleteDocumentUrl,
  documentDownloadUrl,
  DOCUMENTS_URL,
  ELIGIBILITY_CRITERIA_BLOCKS_URL,
  ELIGIBILITY_CRITERIA_URL,
  eligibilityCriteriaDetailUrl,
  eligibilityCriteriaPreviewUrl,
  eligibilityCriteriaUpdateUrl,
  FUND_TAGS_URL,
  fundInvestorDetailUrl,
  FUNDS_URL,
  getBlockDocumentsUrl,
  getCompanyInfoDocURL,
  getEligibilityCriteriaCard,
  getFundsBaseInfoURL,
  getFundsDetailURL,
  getFundsInvestmentsURL,
  getIndicationOfInterestAnalyticsExportUrl,
  getIndicationOfInterestAnalyticsUrl,
  getKYCCommentsUpdateURL,
  getKYCDocumentsURL,
  getKYCRecordsByWorkflow,
  getKYCRiskEvaluationURL,
  getUpdateUserUrl,
  getWorkflowsURLByFund,
  GROUPS_URL,
  INVESTOR_DETAIL_URL,
  INVESTOR_PROFILES_URL,
  NOTIFICATIONS_FILTERS_URL,
  NOTIFICATIONS_URL,
  OPPORTUNITIES_URL,
  ORDERS_URL,
  publishFundURL,
  updateCompanyTokenURL,
  updateConnectorUrl,
  updateCriteriaBlockUrl,
  updateFundURL,
  updateNotificationUrl,
  updateOrderDetailURL,
  USERS_URL,
  getTaxRecords,
  getTaxFormsUrl,
  createFundDocURL,
  getKYCParticipantDocumentsURL,
  getSigningUrlUrl,
  getFetchTaxDetailsUrl,
  getUserAgreementSigningUrl,
  storeUserResponseUrl,
  COMPANY_INFO_URL,
  getCompanyDocumentSigningUrl,
  storeCompanyDocumentUserResponseUrl,
  getEligibilityCriteriaDecisionUrl,
  customLogicBlockUrl,
  validateCustomExpressionUrl,
  getDecisionByIdUrl,
  getCreateConnectionUrl,
  getNextBockUrl,
  createApplicationDocumentUrl,
  updateApplicationDocumentUrl,
  createTaxRecordUrl,
  getReplyListCreateUrl,
  updateUserUrl,
  exportInterestAnswers,
  createKycDocumentUrl,
  createManagersUrl,
  FundDetailDocURL,
  getDeleteConnectionUrl,
  createProgramDocumentUrl,
  PARTICIPANTS_INVITE_URL,
  getAdminProfileUrl,
  getCarryPoolURL,
  createCarryPoolUrl,
  deleteCarryPoolUrl,
  createCarryAllocationsUrl,
  getCreateFundDocumentUrl,
  getCreateInvestorDocumentUrl,
  getFetchInvestorDocumentsUrl,
  getUpdateInvestorDocumentUrl,
  getInvestorDocumentDeleteUrl,
  getAllocationActionURL,
  getEligibilityCriteriaSaveTemplatesUrl,
  getEligibilityCriteriaSaveTemplatesListUrl,
  getCreateCustomBlockFromTemplateUrl,
  vestingScheduleUrl,
  CalculateVestedPointsUrl,
  CarryPlanUrl,
  getCarryPlanAllocationsUrl,
  getCarryPlanUrl,
  CarryFundsListUrl,
  getCarryPlanCompanyUsersUrl,
  CarryParticipantsUrl,
  CarryParticipantByIdUrl,
  CarryParticipantForfeitureUrl,
  CarryDealsUrl,
  CarryFundsCreateUrl,
  VestingScheduleByIdUrl,
  getCarryFundDealsByIdUrl,
  getCarryFundAllocationsByIdUrl,
  getParticipantNotificationsUrl,
  getCarryDealAllocationsByIdUrl,
  getUpdateDealByIdUrl,
  getParticipantCoinvestListUrl,
  CarryTemplateDocsUrl,
  CarryParticipantsDocsUrl,
  EditCarryTemplateDocsUrl,
  getFetchParticipantDetailUrl,
  getUpdateParticipantKYCUrl,
  getCarryDocumentSigningUrl,
  getSaveCarryDocsSigningUrl,
  PARTICIPANTS_LIST_URL,
  getFeatureFlagsUrl,
  CarryParticipantCompansationHistoryUrl,
  getUpdateCarryFundByIdUrl,
  getParticipantCarryDocsUrl,
  START_PUSH_URL,
  getCreateNoticeDocumentUrl,
  CarryPlanFirmOverviewUrl,
  getInvestorAccountCodeUploadURL,
  UserAllocationsByIdUrl,
  getCarryPlanVestingSchedulesUrl,
  CarryPlanMilestoneDateUrl,
  getUploadEmployeesOnboardingUrl,
  getFetchInvestorDocumentsFiltersUrl,
  FEATURE_FLAGS_URL,
  CreateCarryParticipantUrl,
  getFetchCarryParticipantDetailUrl,
  getAllocationsDilutionUrl,
  CarryDistributionUrl,
  CarryDistributionDetailUrl,
  carryShareClassesUrl,
  caryyVehiclesUrl,
  getCaryyVehiclesUpdateUrl,
  getCarryShareClassesUpdateUrl,
  getFetchAllocationDetailsUrl, getFetchParticipantProfileUrl,
  CarryUsersUrl,
  getCarryParticipantDocUrl, getCarryInvestmentTranchesAllocationsByIdUrl, ManagerFirmOverviewUrl,
  getCarryPoolBaseUrl,
  CarryParticipantsUngroupedUrl,
  CarryCommitmentsUrl, CARRY_PARTICIPANT_ENTITY_TYPES_URL,
  getHurdleUrl, getCarryPlanAdjustmentAllocationsUrl,
  getAdjustmentAllocationByIdUrl,
  getCarryPlanTransferUrl,
} from "./routes";
import download from "downloadjs";
import {FundStatus} from "../pages/CarryManagement/components/FundsPage/components/FundsListView/constants";

class RetailMarketAPI {
  getHeaders = (token: string) => ({
    Authorization: `Bearer ${token}`,
  });

  deleteFund = async (fundId: number) => {
    const url = updateFundURL(fundId);
    const response = await axios.delete(url);
    return response;
  };

  createFund = async (payload: any) => {
    const response = await axios.post(FUNDS_URL, payload);
    return response.data;
  };

  editFund = async (fundId: number, payload: any) => {
    const url = updateFundURL(fundId);
    const response = await axios.patch(url, payload);
    return response.data;
  };

  publishFund = async (fundId: number) => {
    const url = publishFundURL(fundId);
    const response = await axios.patch(url);
    return response.data;
  };

  createManagers = async (externalId: string, body: any) => {
    const url = createManagersUrl(externalId);
    const response = await axios.post(url, body);
    return response.data;
  };

  createCapitalCall = async (payload: any) => {
    const response = await axios.post(CAPITAL_CALL_URL, payload);
    return response.data;
  };

  // For Capital Call section in Fund Setup Page //
  getFundCapitalCalls = async (externalId: any) => {
    const url = `${CAPITAL_CALL_ADMIN_URL}${externalId}`;
    const response = await axios.get(url);
    return response.data;
  };

  getFundCapitalCallDetail = async (externalId: any, capitalCallUUID: any) => {
    const url = `${CAPITAL_CALL_ADMIN_URL}${externalId}/detail/${capitalCallUUID}`;
    const response = await axios.get(url);
    return response.data;
  };

  createFundCapitalCall = async (externalId: any, payload: any) => {
    try {
      const url = `${CAPITAL_CALL_ADMIN_URL}${externalId}/document`;
      const response = await axios.post(url, payload);
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, data: error?.response?.data };
    }
  };

  ///////////////////////////////////////////////////

  // For Distribution Notices section in Fund Setup Page //
  getFundDistributionNotices = async (externalId: any) => {
    const url = `${DISTRIBUTION_NOTICE_ADMIN_URL}${externalId}`;
    const response = await axios.get(url);
    return response.data;
  };

  getFundDistributionNoticeDetail = async (
    externalId: any,
    distributionNoticeUUID: any
  ) => {
    const url = `${DISTRIBUTION_NOTICE_ADMIN_URL}${externalId}/detail/${distributionNoticeUUID}`;
    const response = await axios.get(url);
    return response.data;
  };

  createFundDistributionNotice = async (externalId: any, payload: any) => {
    try {
      const url = `${DISTRIBUTION_NOTICE_ADMIN_URL}${externalId}/document`;
      const response = await axios.post(url, payload);
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, data: error?.response?.data };
    }
  };

  ///////////////////////////////////////////////////
  getOpportunities = async () => {
    const response = await axios.get(OPPORTUNITIES_URL);
    return response.data;
  };

  getFundDetail = async (externalId: string) => {
    const url = getFundsDetailURL(externalId);
    const response = await axios.get(url);
    return response.data;
  };

  getFundBaseInfo = async (externalId: string) => {
    const url = getFundsBaseInfoURL(externalId);
    const response = await axios.get(url);
    return response.data;
  };

  createOrder = async (payload: any) => {
    await axios.post(ORDERS_URL, payload);
  };
  updateOrder = async (orderId: number, payload: any) => {
    const url = updateOrderDetailURL(orderId);
    await axios.patch(url, payload);
  };

  getInvestorDetail = async () => {
    const response = await axios.get(INVESTOR_DETAIL_URL);
    return response.data;
  };

  getInvestorProfiles = async () => {
    const response = await axios.get(INVESTOR_PROFILES_URL);
    return response.data;
  };

  getFundInvestments = async (externalId: string) => {
    const url = getFundsInvestmentsURL(externalId);
    const response = await axios.get(url);
    return response.data;
  };

  getUserInfo = async () => {
    const response = await axios.get(USER_INFO_URL);
    return response.data;
  };

  getUsers = async () => {
    const response = await axios.get(ALL_USERS_URL);
    return response.data;
  };

  deleteUser = async (userId: number) => {
    const url = updateUserUrl(userId);
    const response = await axios.delete(url);
    return response.data;
  };

  createUser = async (payload: any) => {
    const response = await axios.post(USERS_URL, payload);
    return response.data;
  };

  getAllUsers = async () => {
    const response = await axios.get(USERS_URL);
    return response.data;
  };
  //------ /admin/carryManagement?tab=distributions------//


  fetchCarryDetailsForDistribution = async (payload:any) => {
    try {
      const response = await axios.post(CarryDistributionUrl+"/carry-plan", payload);
      return { success:true, data: response.data};
    } catch (error: any) {
      return {success: false, data: error?.response?.data}
    }
  };

  createDistribution = async (payload:any) => {
    try {
      const response = await axios.post(CarryDistributionUrl, payload);
      return { success:true, data: response.data};
    } catch (error: any) {
      return {success: false, data: error?.response?.data}
    }
  };

  fetchDistributionsList = async () => {
    try {
      const response = await axios.get(CarryDistributionUrl);
      return { success:true, data: response.data};
    } catch (error: any) {
      return {success: false, data: error?.response?.data}
    }
  };

  fetchDistributionDetail = async (distId:string) => {
    try {
      const response = await axios.get(CarryDistributionDetailUrl(distId));
      return { success:true, data: response.data};
    } catch (error: any) {
      return {success: false, data: error?.response?.data}
    }
  };

  editDistributionDetail = async (distId:string, payload:any) => {
    try {
      const response = await axios.patch(CarryDistributionDetailUrl(distId), payload);
      return { success:true, data: response.data};
    } catch (error: any) {
      return {success: false, data: error?.response?.data}
    }
  };

  deleteDistribution = async (distributionId: number) => {
    try {
      await axios.delete(getCarryPoolBaseUrl(distributionId));
      return { success:true, data: null};
    } catch (error: any) {
      return {success: false, data: error?.response?.data}
    }
  };


  //------ /admin/carryManagement?tab=vesting------//

//------ /admin/carryManagement?tab=documents------//
createCarryDocument = async (payload: any) => {
  try {
    const response = await axios.post(CarryTemplateDocsUrl, payload);
    return { success:true, data: response.data};
  } catch (error: any) {
    return {success: false, data: error?.response?.data}
  }
};

editCarryDocument = async (id:any,payload: any) => {
  try {
    const response = await axios.patch(EditCarryTemplateDocsUrl(id), payload);
    return { success:true, data: response.data};
  } catch (error: any) {
    return {success: false, data: error?.response?.data}
  }
};

fetchCarryTemplateDocuments = async () => {
  try {
    const response = await axios.get(CarryTemplateDocsUrl);
    return { success:true, data: response.data};
  } catch (error: any) {
    return {success: false, data: error?.response?.data}
  }
};

fetchCarryParticipantsDocuments = async () => {
  try {
    const response = await axios.get(CarryParticipantsDocsUrl);
    return { success:true, data: response.data};
  } catch (error: any) {
    return {success: false, data: error?.response?.data}
  }
};

releaseAllCarryParticipantsDocuments = async () => {
  try {
    const response = await axios.post(CarryParticipantsDocsUrl+"/release");
    return { success:true, data: response.data};
  } catch (error: any) {
    return {success: false, data: error?.response?.data}
  }
};

deleteCarryParticipantsDocument = async (docId:any) => {
  try {
    const response = await axios.delete(getCarryParticipantDocUrl(docId));
    return { success:true, data: response.data};
  } catch (error: any) {
    return {success: false, data: error?.response?.data}
  }
};

releaseCarryParticipantsDocument = async (docId:any,payload:any) => {
  try {
    const response = await axios.patch(getCarryParticipantDocUrl(docId),payload);
    return { success:true, data: response.data};
  } catch (error: any) {
    return {success: false, data: error?.response?.data}
  }
};

getCarrySigningURL = async (envelopeId: number, returnURL: string) => {
  try {
    const response = await axios.get(getCarryDocumentSigningUrl(envelopeId,returnURL));
    return { success:true, data: response.data};
  } catch (error: any) {
    return {success: false, data: error?.response?.data}
  }
};

saveCarryDocsSigningUrl = async (envelopeId: string) => {
  try {
    const response = await axios.get(getSaveCarryDocsSigningUrl(envelopeId));
    return { success:true, data: response.data};
  } catch (error: any) {
    return {success: false, data: error?.response?.data}
  }
}

 // --------------------------------------- //
//------ /admin/carryManagement?tab=vesting------//

  fetchVestingScheduleById = async (scheduleId: any) => {
    try {
      const response = await axios.get(VestingScheduleByIdUrl(scheduleId));
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, data: error?.response?.data };
    }
  };

  // --------------------------------------- //

  //------ /admin/carryManagement?tab=investments------//

  fetchCarryInvestmentAllocationsById = async (investmentId: string) => {
    try {
      const response = await axios.get(getCarryInvestmentTranchesAllocationsByIdUrl(investmentId));
      return { success:true, data: response.data};
    } catch (error: any) {
      return {success: false, data: error?.response?.data}
    }
  };


  // --------------------------------------- //


//------ /admin/carryManagement?tab=commitments------//
fetchAllCommitments = async () => {
  try {
    const response = await axios.get(CarryCommitmentsUrl);
    return { success: true, data: response.data };
  } catch (error: any) {
    return { success: false, data: error?.response?.data };
  }
};

fetchCommitmentDetail = async (sourceExternalId:any,sourceType:any) => {
  try {
    const response = await axios.get(`${CarryCommitmentsUrl}/detail/${sourceExternalId}/${sourceType}`);
    return { success: true, data: response.data };
  } catch (error: any) {
    return { success: false, data: error?.response?.data };
  }
};

createCommitment = async (payload: any) => {
  try {
    const response = await axios.post(CarryCommitmentsUrl, payload);
    return { success: true, data: response.data };
  } catch (error: any) {
    return { success: false, data: error?.response?.data };
  }
};

editCommitment = async (payload: any) => {
  try {
    const response = await axios.patch(CarryCommitmentsUrl, payload);
    return { success: true, data: response.data };
  } catch (error: any) {
    return { success: false, data: error?.response?.data };
  }
};

deleteCommitment = async (sourceExternalId:any,sourceType:any) => {
  try {
    await axios.delete(`${CarryCommitmentsUrl}/detail/${sourceExternalId}/${sourceType}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, data: error?.response?.data };
  }
};


// --------------------------------------- //



  fetchAllCarryParticipantsUngrouped = async () => {
    try {
      const response = await axios.get(CarryParticipantsUngroupedUrl);
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, data: error?.response?.data };
    }
  };


  //------ /admin/carryManagement?tab=investments------//
  fetchAllDeals = async () => {
    try {
      const response = await axios.get(CarryDealsUrl);
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, data: error?.response?.data };
    }
  };

  fetchCarryDealAllocationsById = async (dealId: string) => {
    try {
      const response = await axios.get(getCarryDealAllocationsByIdUrl(dealId));
      return { success:true, data: response.data};
    } catch (error: any) {
      return {success: false, data: error?.response?.data}
    }
  };

  createDeal = async (payload: any) => {
    try {
      const response = await axios.post(CarryDealsUrl, payload);
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, data: error?.response?.data };
    }
  };

  // --------------------------------------- //
  updateDeal = async (dealId:any,payload: any) => {
    try {
      const response = await axios.patch(getUpdateDealByIdUrl(dealId), payload);
      return { success:true, data: response.data};
    } catch (error: any) {
      return {success: false, data: error?.response?.data}
    }
  };


    // --------------------------------------- //

  //------ /admin/carryManagement?tab=participants------//


  fetchAllCarryUsers = async () => {
    try {
      const response = await axios.get(CarryUsersUrl);
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, data: error?.response?.data };
    }
  };

  fetchAllCarryParticipants = async () => {
    try {
      const response = await axios.get(CarryParticipantsUrl);
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, data: error?.response?.data };
    }
  };

  CreateCarryParticipant = async (payload:any) => {
    try {
      const response = await axios.post(CreateCarryParticipantUrl, payload);
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, data: error?.response?.data };
    }
  };

  fetchCarryParticipantById = async (participantId: string) => {
    try {
      const response = await axios.get(CarryParticipantByIdUrl(participantId));
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, data: error?.response?.data };
    }
  };

  fetchUserAllocationsById = async (participantId: string) => {
    try {
      const response = await axios.get(
        UserAllocationsByIdUrl(participantId)
      );
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, data: error?.response?.data };
    }
  };

  fetchCarryParticipantCompensationHistory = async (participantId: string) => {
    try {
      const response = await axios.get(
        CarryParticipantCompansationHistoryUrl(participantId)
      );
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, data: error?.response?.data };
    }
  };

  updateCarryParticipantForfeitureById = async (
    participantId: string,
    payload: any
  ) => {
    try {
      const response = await axios.post(
        CarryParticipantForfeitureUrl(participantId),
        payload
      );
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, data: error?.response?.data };
    }
  };

  calculateUserAllocationsByIdWithDate = async (
    participantId: string,
    payload: any
  ) => {
    try {
      const response = await axios.post(
        CarryParticipantForfeitureUrl(participantId)+"/calculate",
        payload
      );
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, data: error?.response?.data };
    }
  };

  fetchParticipantNotifications = async (next:any,participantId:any) => {
    try {
      const response = await axios.get(getParticipantNotificationsUrl,{params:{
        cursor:next
      },headers:{
        'VIEW-AS-COMPANY-USER-ID':participantId
      }});
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, data: error?.response?.data };
    }
  };

  fetchParticipantCarryDocs = async (participantId:any) => {
    try {
      const response = await axios.get(getParticipantCarryDocsUrl(participantId));
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, data: error?.response?.data };
    }
  };

  fetchParticipantCommitments = async (participantId:any) => {
    try {
      const response = await axios.get(`${CarryCommitmentsUrl}/${participantId}`);
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, data: error?.response?.data };
    }
  };

  fetchParticipantCoinvestList = async (participantId:any) => {
    try {
      const response = await axios.get(getParticipantCoinvestListUrl(participantId));
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, data: error?.response?.data };
    }
  };

  //------ /admin/carryManagement?tab=funds------//

  createCarryFund = async (payload: any) => {
    try {
      const response = await axios.post(CarryFundsCreateUrl, payload);
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, data: error?.response?.data };
    }
  };

  fetchAllCarryFunds = async () => {
    try {
      const response = await axios.get(CarryFundsListUrl);
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, data: error?.response?.data };
    }
  };

  fetchCarryFundDealsById = async (fundId: string) => {
    try {
      const response = await axios.get(getCarryFundDealsByIdUrl(fundId));
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, data: error?.response?.data };
    }
  };

  fetchCarryFundAllocationsById = async (fundId: string) => {
    try {
      const response = await axios.get(getCarryFundAllocationsByIdUrl(fundId));
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, data: error?.response?.data };
    }
  };

  updateCarryFund = async (fundId:any,payload: any) => {
    try {
      const response = await axios.patch(getUpdateCarryFundByIdUrl(fundId), payload);
      return { success:true, data: response.data};
    } catch (error: any) {
      return {success: false, data: error?.response?.data}
    }
  };

  //------ /admin/carryManagement?tab=carryPlan------//

  createCarryPlan = async (payload: any) => {
    try {
      const response = await axios.post(CarryPlanUrl, payload);
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, data: error?.response?.data };
    }
  };

  createCarryHurdle = async (planId: string,payload:any) => {
    try {
      const response = await axios.post(getCarryPlanUrl(planId)+"/hurdle",payload);
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, data: error?.response?.data };
    }
  };

  fetchCarryHurdles = async (planId: string) => {
    try {
      const response = await axios.get(getCarryPlanUrl(planId)+"/hurdle");
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, data: error?.response?.data };
    }
  };

  deleteHurdleById = async (hurdleId: string) => {
    try {
      const response = await axios.delete(getHurdleUrl(hurdleId));
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, data: error?.response?.data };
    }
  };

  publishCarryPlan = async (planId: string,payload:any) => {
    try {
      const response = await axios.post(getCarryPlanUrl(planId)+"/publish",payload);
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, data: error?.response?.data };
    }
  };

  submitForApprovalCarryPlan = async (planId: string,) => {
    try {
      const response = await axios.post(getCarryPlanUrl(planId)+"/submit-for-approval");
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, data: error?.response?.data };
    }
  };

  updateCarryPlan = async (planId: string, payload: any) => {
    try {
      const response = await axios.patch(getCarryPlanUrl(planId), payload);
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, data: error?.response?.data };
    }
  };

  // fetchFundCarryPlan = async (externalId: string) => {
  //   try {
  //     const response = await axios.get(getCarryPlanUrl(externalId));
  //     return { success:true, data: response.data};
  //   } catch (error: any) {
  //     return {success: false, data: error?.response?.data}
  //   }
  // };

  fetchCarryFundsList = async () => {
    try {
      const response = await axios.get(CarryFundsListUrl);
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, data: error?.response?.data };
    }
  };

  fetchCarryPlans = async () => {
    try {
      const response = await axios.get(CarryPlanUrl);
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, data: error?.response?.data };
    }
  };

  fetchCarryPlanFirmOverview = async () => {
    try {
      const response = await axios.get(CarryPlanFirmOverviewUrl);
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, data: error?.response?.data };
    }
  };

  fetchManagerEmployeeRecord = async (id:any) => {
    try {
      const response = await axios.get(ManagerFirmOverviewUrl+`/${id}`);
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, data: error?.response?.data };
    }
  };

  createCarryPlanAllocations = async (planId: string, payload: any) => {
    try {
      const response = await axios.post(
        getCarryPlanAllocationsUrl(planId),
        payload
      );
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, data: error?.response?.data };
    }
  };

  carryPlanAllocationPointsTransfer = async (planId: string, payload: any) => {
    try {
      const response = await axios.post(
        getCarryPlanTransferUrl(planId),
        payload
      );
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, data: error?.response?.data };
    }
  };

  fetchCarryPlanAndAllocations = async (planId: string) => {
    try {
      const response = await axios.get(getCarryPlanAllocationsUrl(planId));
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, data: error?.response?.data };
    }
  };

  fetchCarryPlanAdjustmentAllocations = async (planId: string) => {
    try {
      const response = await axios.get(getCarryPlanAdjustmentAllocationsUrl(planId));
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, data: error?.response?.data };
    }
  };

  deleteAdjustmentById = async (adjustmentId: string) => {
    try {
      const response = await axios.delete(getAdjustmentAllocationByIdUrl(adjustmentId));
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, data: error?.response?.data };
    }
  };

  fetchCarryPlanCompanyUsers = async (planId: string) => {
    try {
      const response = await axios.get(getCarryPlanCompanyUsersUrl(planId));
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, data: error?.response?.data };
    }
  };

  fetchAllocationsDilutionCalculation = async (planId: string, payload:any) => {
    try {
      const response = await axios.post(getAllocationsDilutionUrl(planId)+"/calculate", payload);
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, data: error?.response?.data };
    }
  };

  createAllocationsDilution = async (planId: string, payload:any) => {
    try {
      const response = await axios.post(getAllocationsDilutionUrl(planId), payload);
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, data: error?.response?.data };
    }
  };

  allocationAction = async (externalId: string, payload: any) => {
    try {
      const response = await axios.post(
        getAllocationActionURL(externalId),
        payload
      );
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, data: error?.response?.data };
    }
  };

  createCarryPool = async (payload: any) => {
    try {
      const response = await axios.post(createCarryPoolUrl, payload);
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, data: error?.response?.data };
    }
  };

  createCarryAllocations = async (payload: any) => {
    try {
      const response = await axios.post(createCarryAllocationsUrl, payload);
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, data: error?.response?.data };
    }
  };

  deleteCarryPool = async (payload: any) => {
    try {
      const response = await axios.post(deleteCarryPoolUrl, payload);
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, data: error?.response?.data };
    }
  };

  fetchCalculatedVestedPoints = async (payload: any) => {
    try {
      const response = await axios.post(CalculateVestedPointsUrl, payload);
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, data: error?.response?.data };
    }
  };

  fetchVestingSchedule = async () => {
    try {
      const response = await axios.get(vestingScheduleUrl);
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, data: error?.response?.data };
    }
  };

  fetchCarryShareClasses = async () => {
    try {
      const response = await axios.get(carryShareClassesUrl);
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, data: error?.response?.data };
    }
  };

  createCarryShareClasses = async (payload: any) => {
    try {
      const response = await axios.post(carryShareClassesUrl, payload);
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, data: error?.response?.data };
    }
  };

  updateCarryShareClasses = async (payload: any) => {
    try {
      const response = await axios.patch(getCarryShareClassesUpdateUrl(payload.id), payload);
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, data: error?.response?.data };
    }
  };

  fetchCarryVehicles = async () => {
    try {
      const response = await axios.get(caryyVehiclesUrl);
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, data: error?.response?.data };
    }
  };

  createCarryVehicle = async (payload: any) => {
    try {
      const response = await axios.post(caryyVehiclesUrl, payload);
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, data: error?.response?.data };
    }
  };

  updateCarryVehicle = async (id: number, payload: any) => {
    try {
      const response = await axios.patch(getCaryyVehiclesUpdateUrl(id), payload);
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, data: error?.response?.data };
    }
  };

  fetchCarryPlanVestingSchedules = async (planId:string) => {
    try {
      const response = await axios.get(getCarryPlanVestingSchedulesUrl(planId));
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, data: error?.response?.data };
    }
  };

  updateCarryPlanMilestoneDate = async (payload:any) => {
    try {
      const response = await axios.patch(CarryPlanMilestoneDateUrl,payload);
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, data: error?.response?.data };
    }
  };

  fetchCarryPools = async (external_id: string) => {
    try {
      const response = await axios.get(getCarryPoolURL(external_id));
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, data: error?.response?.data };
    }
  };

  createParticipantInvite = async (payload: any) => {
    try {
      const response = await axios.post(PARTICIPANTS_INVITE_URL, payload);
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, data: error?.response?.data };
    }
  };

  getParticipants = async () => {
    const response = await axios.get(PARTICIPANTS_LIST_URL);
    return response.data;
  };

  deleteParticipants = async (id: any, deleted: any) => {
    const response = await axios.patch(`${PARTICIPANTS_INVITE_URL}/${id}`, {
      deleted,
    });
    return response.data;
  };

  getNotifications = async (qs: string | null) => {
    const url = `${NOTIFICATIONS_URL}?${qs}`;
    const response = await axios.get(url);
    return response.data;
  };

  getNotificationsPage = async (url?: string | null) => {
    const response = await axios.get(url ? url : NOTIFICATIONS_URL);
    return response.data;
  };

  getNotificationFilters = async () => {
    const response = await axios.get(NOTIFICATIONS_FILTERS_URL);
    return response.data;
  };

  updateNotification = async (notificationId: number, payload: any) => {
    const url = updateNotificationUrl(notificationId);
    const response = await axios.patch(url, payload);
    return response.data;
  };

  getAdminStats = async () => {
    const response = await axios.get(ADMIN_STATS_URL);
    return response.data;
  };

  getFundInvestorDetail = async (fundInvestorId: string) => {
    const url = fundInvestorDetailUrl(fundInvestorId);
    const response = await axios.get(url);
    return response.data;
  };

  getCapitalCallDetails = async (capitalCallUUID: string) => {
    const url = capitalCallDetailUrl(capitalCallUUID);
    const response = await axios.get(url);
    return response.data;
  };

  getCurrencies = async () => {
    const response = await axios.get(CURRENCIES_URL);
    return response.data;
  };

  uploadDocuments = async (payload: any) => {
    const response = await axios.post(DOCUMENTS_URL, payload, {
      headers: {
        "content-type": "multipart/form-data",
      },
    });
    return response.data;
  };

  uploadFundsDocuments = async (externalId: string, payload: any) => {
    const response = await axios.post(createFundDocURL(externalId), payload, {
      headers: {
        "content-type": "multipart/form-data",
      },
    });
    return response.data;
  };

  uploadFundDetailDocument = async (externalId: string, payload: any) => {
    const response = await axios.post(FundDetailDocURL(externalId), payload);
    return response.data;
  };

  fetchFundDetailDocument = async (externalId: string) => {
    const response = await axios.get(FundDetailDocURL(externalId));
    return response.data;
  };

  downloadDocument = async (documentId: string, name: string) => {
    const url = documentDownloadUrl(documentId);
    const response = await axios.get(url, { responseType: "blob" });
    const content = response.headers["content-type"];
    download(response.data, name, content);
  };

  getCompanies = async () => {
    const response = await axios.get(COMPANIES_URL);
    return response.data;
  };

  getCompanyTokens = async () => {
    const response = await axios.get(COMPANY_TOKENS_URL);
    return response.data;
  };

  createCompanyToken = async (payload: any) => {
    const response = await axios.post(COMPANY_TOKENS_URL, payload);
    return response.data;
  };

  deleteToken = async (tokenId: number) => {
    const url = updateCompanyTokenURL(tokenId);
    return await axios.delete(url);
  };

  editToken = async (tokenId: number, payload: any) => {
    const url = updateCompanyTokenURL(tokenId);
    const response = await axios.patch(url, payload);
    return response.data;
  };

  getFundsForEligibilityCriteria = async () => {
    const response = await axios.get(FUNDS_URL);
    return response.data;
  };

  getRegionCountries = async () => {
    const response = await axios.get(COMPANY_REGIONS_URL);
    return response.data;
  };

  getFundTags = async () => {
    const response = await axios.get(FUND_TAGS_URL);
    return response.data;
  };

  createEligibilityCriteria = async (payload: any) => {
    const response = await axios.post(ELIGIBILITY_CRITERIA_URL, payload);
    return response.data;
  };

  getFundEligibilityCriteria = async (fundId: number) => {
    const url = `${ELIGIBILITY_CRITERIA_URL}?fund_id=${fundId}`;
    const response = await axios.get(url);
    return response.data;
  };

  getBlockCategories = async () => {
    const response = await axios.get(ELIGIBILITY_CRITERIA_BLOCKS_URL);
    return response.data;
  };

  getFundCriteriaDetail = async (criteriaId: number) => {
    const url = eligibilityCriteriaDetailUrl(criteriaId);
    const response = await axios.get(url);
    return response.data;
  };

  updateFundCriteria = async (criteriaId: number, payload: any) => {
    const url = eligibilityCriteriaUpdateUrl(criteriaId);
    const response = await axios.patch(url, payload);
    return response.data;
  };

  createCriteriaBlock = async (criteriaId: number, payload: any) => {
    const url = createBlockUrl(criteriaId);
    const response = await axios.post(url, payload);
    return response.data;
  };

  createCriteriaBlockDocument = async (criteriaId: number, payload: any) => {
    const url = createBlockDocumentUrl(criteriaId);
    const response = await axios.post(url, payload);
    return response.data;
  };

  validateCustomExpression = async (payload: any) => {
    const url = validateCustomExpressionUrl();
    const response = await axios.post(url, payload);
    return response.data;
  };

  getCriteriaBlockDocuments = async (criteriaId: number) => {
    const url = getBlockDocumentsUrl(criteriaId);
    const response = await axios.get(url);
    return response.data;
  };

  deleteDocument = async (documentId: number) => {
    const url = deleteDocumentUrl(documentId);
    const response = await axios.delete(url);
    return response.data;
  };

  updateConnector = async (connectorId: number, payload: any) => {
    const url = updateConnectorUrl(connectorId);
    const response = await axios.patch(url, payload);
    return response.data;
  };

  createCustomLogicBlock = async (criteriaId: any) => {
    const url = customLogicBlockUrl(criteriaId);
    const response = await axios.get(url);
    return response.data;
  };

  updateCriteriaBlock = async (criteriaBlockId: number, payload: any) => {
    const url = updateCriteriaBlockUrl(criteriaBlockId);
    const response = await axios.patch(url, payload);
    return response.data;
  };

  deleteCriteriaBlock = async (criteriaBlockId: number) => {
    const url = updateCriteriaBlockUrl(criteriaBlockId);
    const response = await axios.delete(url);
    return response;
  };

  getFundCriteriaPreview = async (criteriaId: number) => {
    const url = eligibilityCriteriaPreviewUrl(criteriaId);
    const response = await axios.get(url);
    return response.data;
  };

  getWorkflowsByFund = async (externalId: string) => {
    const url = getWorkflowsURLByFund(externalId);
    const response = await axios.get(url);
    return response.data as WorkFlow[];
  };

  getKYCRecordsByWorkflow = async (
    workflowSlug: string,
    recordId: number,
    applicationId: number
  ) => {
    const url = `${getKYCRecordsByWorkflow(workflowSlug)}?id=${recordId}${
      applicationId ? `&application_id=${applicationId}` : ""
    }`;
    const response = await axios.get(url);
    return response.data as KYCRecordResponse[];
  };

  getDocumentsInKYCRecord = async (
    recordId: number,
    applicationId: number | undefined
  ) => {
    const url = getKYCDocumentsURL(recordId, applicationId);
    const response = await axios.get(url);
    return response.data as KYCDocument[];
  };

  getParticipantDocuments = async (
    workflowSlug: string,
    kycRecordId: number,
    participantId: number,
    applicationId: number | undefined
  ) => {
    const url = getKYCParticipantDocumentsURL(
      workflowSlug,
      kycRecordId,
      participantId,
      applicationId
    );
    const response = await axios.get(url);
    return response.data as KYCDocument[];
  };

  createComment = async (text: string, payload: any, applicationId: number) => {
    const response = await axios.post(
      `${COMMENTS_URL}?application_id=${applicationId}`,
      payload
    );
    return response.data;
  };

  getKYCCommentsByKycId = async (kycRecordId: number) => {
    const response = await axios.get(`${COMMENTS_URL}?kyc_id=${kycRecordId}`);
    return response.data as Comment[];
  };

  getKYCCommentsByApplicationId = async (applicationId: number) => {
    const response = await axios.get(
      `${COMMENTS_URL}?application_id=${applicationId}`
    );
    return response.data as Comment[];
  };

  updateKYCCommentStatus = async (commentId: number, status: number) => {
    const url = getKYCCommentsUpdateURL(commentId);
    const response = await axios.patch(url, { status });
    return response.data;
  };

  getKYCDocumentAsDataURI = async (documentId: string) => {
    const url = documentDownloadUrl(documentId);
    const response = await axios.get(url, { responseType: "arraybuffer" });
    let raw = Buffer.from(response.data).toString("base64");
    const fileURL =
      "data:" + response.headers["content-type"] + ";base64," + raw;
    const fileType = response.headers["content-type"];
    return { fileURL, fileType };
  };

  getIndicationOfInterestAnalytics = async (externalId: string) => {
    const url = getIndicationOfInterestAnalyticsUrl(externalId);
    const response = await axios.get(url);
    return response.data;
  };

  getEligibilityCriteriaCard = async (responseId: number) => {
    const url = getEligibilityCriteriaCard(responseId);
    const response = await axios.get(url);
    return response.data;
  };

  setKycRiskEvaluation = async (kydId: number, payload: any) => {
    const url = getKYCRiskEvaluationURL(kydId);
    const response = await axios.post(url, payload);
    return response.data;
  };

  exportIndicationOfInterestAnalytics = async (
    externalId: string,
    fundId: number,
    fileName: string
  ) => {
    const url = getIndicationOfInterestAnalyticsExportUrl(externalId, fundId);
    const response = await axios.get(url, { responseType: "blob" });
    const content = response.headers["content-type"];
    download(response.data, fileName, content);
  };

  createTaxRecord = async () => {
    const url = getTaxRecords();
    const response = await axios.post(url);
    return response.data;
  };

  getTaxFormsAdmin = async (recordId: number) => {
    const url = getTaxFormsUrl(recordId);
    const response = await axios.get(url);
    return response.data;
  };

  getTaxRecords = async () => {
    const url = getTaxRecords();
    const response = await axios.get(url);
    return response.data;
  };

  getSigningUrl = async (envelopeId: string, returnUrl: string) => {
    const url = getSigningUrlUrl(envelopeId, returnUrl);
    const response = await axios.get(url);
    return response.data;
  };

  fetchTaxDetailsAdmin = async (record_id: number) => {
    const url = getFetchTaxDetailsUrl(record_id);
    const response = await axios.get(url);
    return response.data;
  };

  getAgreementsSigningUrl = async (envelopeId: string, returnUrl: string) => {
    const url = getUserAgreementSigningUrl(envelopeId, returnUrl);
    const response = await axios.get(url);
    return response.data;
  };

  storeUserResponse = async (envelopeId: string) => {
    const url = storeUserResponseUrl(envelopeId);
    const response = await axios.get(url);
    return response.data;
  };

  getCompanyDocumentSigningUrl = async (
    externalId: string,
    envelopeId: string,
    returnUrl: string
  ) => {
    const url = getCompanyDocumentSigningUrl(externalId, envelopeId, returnUrl);
    const response = await axios.get(url);
    return response.data;
  };

  storeCompanyDocumentUserResponse = async (
    externalId: string,
    envelopeId: string
  ) => {
    const url = storeCompanyDocumentUserResponseUrl(externalId, envelopeId);
    const response = await axios.get(url);
    return response.data;
  };

  saveCompanyInfo = async (payload: any) => {
    const response = await axios.patch(COMPANY_INFO_URL, payload, {
      headers: { "content-type": "multipart/form-data" },
    });
    return response.data;
  };

  saveCompanyDocument = async (payload: any) => {
    const response = await axios.post(COMPANY_INFO_DOC_URL, payload, {
      headers: { "content-type": "multipart/form-data" },
    });
    return response.data;
  };
  updateCompanyDocument = async (id: any, payload: any) => {
    const response = await axios.patch(getCompanyInfoDocURL(id), payload, {
      headers: { "content-type": "multipart/form-data" },
    });
    return response.data;
  };

  saveAdminApplicationDocument = async (
    applicationId: number,
    payload: any
  ) => {
    const url = createApplicationDocumentUrl(applicationId);
    const response = await axios.post(url, payload, {
      headers: { "content-type": "multipart/form-data" },
    });
    return response.data;
  };

  updateAdminApplicationDocument = async (
    applicationId: number,
    id: number,
    payload: any
  ) => {
    const response = await axios.patch(
      updateApplicationDocumentUrl(applicationId, id),
      payload,
      {
        headers: { "content-type": "multipart/form-data" },
      }
    );
    return response.data;
  };

  getEligibilityCriteriaDecision = async (id: number, payload: any) => {
    const response = await axios.post(
      getEligibilityCriteriaDecisionUrl(id),
      payload
    );
    return response.data;
  };

  getEligibilityDecisionById = async (id: number, payload: any) => {
    const response = await axios.post(getDecisionByIdUrl(id), payload);
    return response.data;
  };

  createBlockConnection = async (criteriaId: any, payload: any) => {
    const response = await axios.post(
      getCreateConnectionUrl(criteriaId),
      payload
    );
    return response.data;
  };

  deleteBlockConnection = async (criteriaId: any, payload: any) => {
    const response = await axios.post(
      getDeleteConnectionUrl(criteriaId),
      payload
    );
    return response.data;
  };

  fetchNextBlock = async (payload: any) => {
    const response = await axios.post(getNextBockUrl(), payload);
    return response.data;
  };

  exportIndicationOfInterestAnswers = async (fundExternalId: string) => {
    const response = await axios.get(exportInterestAnswers(fundExternalId));
    return response.data;
  };

  createKycDocument = async (kycRecordId: number, payload: any) => {
    const response = await axios.post(
      createKycDocumentUrl(kycRecordId),
      payload,
      {
        headers: { "content-type": "multipart/form-data" },
      }
    );
    return response.data;
  };

  createTaxDocument = async (payload: any) => {
    const response = await axios.post(createTaxRecordUrl(), payload, {
      headers: { "content-type": "multipart/form-data" },
    });
    return response.data;
  };

  createApplicationProgramDocument = async (
    applicationId: number,
    payload: any
  ) => {
    const url = createProgramDocumentUrl(applicationId);
    const response = await axios.post(url, payload, {
      headers: { "content-type": "multipart/form-data" },
    });
    return response.data;
  };

  createReply = async (commentId: number, payload: any) => {
    const url = getReplyListCreateUrl(commentId);
    const response = await axios.post(url, payload);
    return response.data;
  };

  getGroups = async () => {
    const response = await axios.get(GROUPS_URL);
    return response.data;
  };

  updateUser = async (userId: number, payload: any) => {
    const url = getUpdateUserUrl(userId);
    const response = await axios.patch(url, payload);
    return response;
  };

  getAdminProfile = async () => {
    const url = getAdminProfileUrl();
    const response = await axios.get(url);
    return response.data;
  };

  createFundDocument = async (payload: any) => {
    const response = await axios.post(getCreateFundDocumentUrl(), payload);
    return response.data;
  };

  createNoticeDocument = async (payload: any) => {
    const response = await axios.post(getCreateNoticeDocumentUrl(), payload);
    return response.data;
  };

  createInvestorDocument = async (payload: any) => {
    const response = await axios.post(getCreateInvestorDocumentUrl(), payload);
    return response.data;
  };

  updateInvestorDocument = async (id: string, payload: any) => {
    const response = await axios.post(
      getUpdateInvestorDocumentUrl(id),
      payload
    );
    return response.data;
  };

  fetchInvestorDocuments = async (queryParams:string) => {
    const response = await axios.get(getFetchInvestorDocumentsUrl()+queryParams);
    return response.data;
  };

  fetchInvestorDocumentsFilters = async () => {
    const response = await axios.get(getFetchInvestorDocumentsFiltersUrl);
    return response.data;
  };

  fetchInvestorDocumentsNext = async (url: string) => {
    const response = await axios.get(url);
    return response.data;
  };

  deleteInvestorDocument = async (id: number, type: string) => {
    const response = await axios.delete(getInvestorDocumentDeleteUrl(id, type));
    return response.data;
  };

  saveTemplates = async (eligibilityCriteriaId: number) => {
    const response = await axios.post(
      getEligibilityCriteriaSaveTemplatesListUrl(),
      {
        criteria_id: eligibilityCriteriaId,
      }
    );
    return response.data;
  };

  updateTemplate = async (templateId: number, payload: any) => {
    const response = await axios.put(
      getEligibilityCriteriaSaveTemplatesUrl(templateId),
      payload
    );
    return response.data;
  };

  deleteTemplate = async (templateId: number) => {
    const response = await axios.delete(
      getEligibilityCriteriaSaveTemplatesUrl(templateId)
    );
    return response.data;
  };

  getSavedTemplates = async () => {
    const response = await axios.get(
      getEligibilityCriteriaSaveTemplatesListUrl()
    );
    return response.data;
  };

  createCustomBlockFromTemplate = async (
    eligibilityCriteriaId: number,
    templateId: number
  ) => {
    const response = await axios.post(
      getCreateCustomBlockFromTemplateUrl(eligibilityCriteriaId, templateId)
    );
    return response.data;
  };

  fetchParticipantDetail = async (participantId: string) => {
    const response = await axios.get(getFetchParticipantDetailUrl(participantId));
    return response.data;
  }

  updateParticipantKycRecord = async (recordUUID: string, payload: any) => {
    const response = await axios.patch(getUpdateParticipantKYCUrl(recordUUID), payload);
    return response.data;
  }

  fetchFeatureFlag = async (featureFlag: string) => {
    const response = await axios.get(getFeatureFlagsUrl(featureFlag));
    return response.data;
  }

  isFeatureEnabled = async(featureFlag: string) => {
    const response = await axios.get(getFeatureFlagsUrl(featureFlag));
    return response.data.is_active
  }

  fetchFeatureFlags = async () => {
    const response = await axios.get(FEATURE_FLAGS_URL);
    return response.data;
  }

  activateFeatureFlag = async(featureFlag: string) => {
    const response = await axios.put(`${getFeatureFlagsUrl(featureFlag)}/activate`);
    return response.data.is_active
  }

  deactivateFeatureFlag = async(featureFlag: string) => {
    const response = await axios.put(`${getFeatureFlagsUrl(featureFlag)}/deactivate`);
    return response.data.is_active
  }

  startPushToBooks = async(fundId: number) => {
    const response = await axios.post(START_PUSH_URL, {fund_id: fundId})
    return response.data
  }

  uploadInvestorAccountCodesBulkUpdate = async (externalId: string, payload: object) => {
    const response = await axios.patch(getInvestorAccountCodeUploadURL(externalId), payload)
    return response.data
  }

  uploadEmployeesOnboarding = async (formData: FormData) => {
    const response = await axios.post(getUploadEmployeesOnboardingUrl(), formData);
    return response.data;
  }

  fetchCarryParticipantDetail = async (participantId: string) => {
    const response = await axios.get(getFetchCarryParticipantDetailUrl(participantId));
    return response.data;
  }

  fetchParticipantProfile = async (participantId: string) => {
    const response = await axios.get(getFetchParticipantProfileUrl(participantId));
    return response.data;
  }

  fetchCarryAllocationDetail = async (carryPlanId: string, allocationId: string) => {
    const response = await axios.get(getFetchAllocationDetailsUrl(carryPlanId, allocationId));
    return response.data;
  }

  fetchCarryParticipantsEntityTypes = async() => {
    const response = await axios.get(CARRY_PARTICIPANT_ENTITY_TYPES_URL)
    return response.data;
  }
}

export default new RetailMarketAPI();
