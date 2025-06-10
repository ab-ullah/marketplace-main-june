import axios from "axios";
import {
  getApplicantManagementListUrl,
  getApplicantRetrieveUrl,
  getApplicationDocumentRequestCreateUrl,
  getApplicationDocumentRequestListUrl,
  getApplicationDocumentRequestResponseListUrl,
  getAgreementsDocumentUrl,
  getFetchApplicantVehicleUrl,
  getFetchStatuses,
  getApplicantExportUrl,
  getApplicantAmlKycExportUrl
} from "./routes";

class ApplicationsAPI {
  getApplicationManagementList = async (externalId: string) => {
    const url = getApplicantManagementListUrl(externalId)
    const response = await axios.get(url);
    return response.data
  };

  getApplicationsExportList = async (externalId: string) => {
    const url = getApplicantExportUrl(externalId)
    const response = await axios.get(url);
    return response.data
  };

  getApplicationAmlKycData = async (externalId: string) => {
    const url = getApplicantAmlKycExportUrl(externalId)
    const response = await axios.get(url);
    return response.data
  };

  retrieveApplication = async (applicationId: number) => {
    const url = getApplicantRetrieveUrl(applicationId)
    const response = await axios.get(url);
    return response.data
  };

  createApplicationDocumentRequest = async (payload: any) => {
    const url = getApplicationDocumentRequestCreateUrl()
    const response = await axios.post(url, payload);
    return response.data
  };

  fetchApplicationDocumentRequests = async (applicationId: any) => {
    const url = getApplicationDocumentRequestListUrl(applicationId)
    const response = await axios.get(url);
    return response.data
  };

  fetchApplicationDocumentRequestsResponse = async (applicationId: any) => {
    const url = getApplicationDocumentRequestResponseListUrl(applicationId)
    const response = await axios.get(url);
    return response.data
  };

  fetchVehicles = async () => {
    const url = getFetchApplicantVehicleUrl()
    const response = await axios.get(url);
    return response.data
  };

  fetchFundAgreements = async (applicationId: number) => {
    const url = getAgreementsDocumentUrl(applicationId)
    const response = await axios.get(url);
    return response.data
  };

  fetchApplicationStatuses = async (externalId: string) => {
    const url = getFetchStatuses(externalId)
    const response = await axios.get(url);
    return response.data
  };
}

export default new ApplicationsAPI();
