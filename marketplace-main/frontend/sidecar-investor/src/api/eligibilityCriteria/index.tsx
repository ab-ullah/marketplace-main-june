import axios from "axios";
import {IBlockResponsePayload} from "./interfaces";
import {
  CREATE_ELIGIBILITY_CRITERIA_RESPONSE_URL,
  CREATE_RESPONSE_BLOCK_DOCUMENT_URL,
  createInvestmentAmountUrl,
  getCountriesRegionsUrl,
  getEligibilityCriteriaResponseDocuments,
  getEligibilityCriteriaResponseUrl,
  getResponseStatus,
  updateEligibilityCriteriaResponse,
  getKycEligibilityCriteriaUrl,
  submitForReviewUrl,
  fetchDataProtectionPolicyUrl,
  dataProtectionPolicyResponseUrl,
  getEligibilityCriteriaUrl,
  getEligibilityCriteriaResponseTaskUrl
} from "./routes";

class EligibilityCriteriaResponseAPI {
  createUpdateResponseBlock = async (payload: IBlockResponsePayload) => {
    const response = await axios.post(CREATE_ELIGIBILITY_CRITERIA_RESPONSE_URL, payload);
    return response.data
  };

  getEligibilityCriteriaResponse = async (externalId: string, countryCode: string, vehicleType: string, payload: any) => {
    const url = getEligibilityCriteriaResponseUrl(externalId, countryCode, vehicleType)
    const response = await axios.post(url, payload);
    return response.data
  };

  getRegionCountries = async (externalId: string) => {
    const url = getCountriesRegionsUrl(externalId)
    const response = await axios.get(url);
    return response.data
  };

  createResponseBlockDocument = async (payload: any) => {
    const response = await axios.post(CREATE_RESPONSE_BLOCK_DOCUMENT_URL, payload);
    return response.data
  };

  getResponseDocuments = async (responseId: number) => {
    const url = getEligibilityCriteriaResponseDocuments(responseId)
    const response = await axios.get(url);
    return response.data
  };

  updateCriteriaResponse = async (responseId: number, payload: any) => {
    const url = updateEligibilityCriteriaResponse(responseId)
    const response = await axios.patch(url, payload);
    return response.data
  };

  createInvestmentAmount = async (responseId: number, payload: any, skipTask?: boolean) => {
    let url = createInvestmentAmountUrl(responseId)
    if (skipTask) url = `${url}?skip_task=true`
    const response = await axios.post(url, payload);
    return response.data
  };

  submitForReview = async (responseId: number) => {
    let url = submitForReviewUrl(responseId)
    const response = await axios.get(url);
    return response.data
  };

  getResponseStatus = async (responseId: number) => {
    const url = getResponseStatus(responseId)
    const response = await axios.get(url);
    return response.data
  };

  fetchEligibilityCriteria = async (externalId: string) => {
    const url = getEligibilityCriteriaUrl(externalId)
    const response = await axios.get(url);
    return response.data
  };


  getApplicationEligibilityCriteria = async (applicationId: number) => {
    const url = getKycEligibilityCriteriaUrl(applicationId)
    const response = await axios.get(url);
    return response.data
  }

  fetchDataProtectionPolicyDocument = async (externalId: string) => {
    const url = fetchDataProtectionPolicyUrl(externalId)
    const response = await axios.get(url);
    return response.data
  }

  updateDataProtectionPolicyResponse = async (externalId: string, payload: any) => {
    const url = dataProtectionPolicyResponseUrl(externalId)
    const response = await axios.post(url, payload);
    return response.data
  }

  createEligibilityCriteriaResponseReviewTask = async (responseId: number) => {
    const url = getEligibilityCriteriaResponseTaskUrl(responseId)
    const response = await axios.post(url, {});
    return response.data
  }
}

export default new EligibilityCriteriaResponseAPI()