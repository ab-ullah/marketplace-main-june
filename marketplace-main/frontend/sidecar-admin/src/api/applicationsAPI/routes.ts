import { FUNDS_URL } from "../routes"

const API_BASE = process.env.REACT_APP_API_URL

export const APPLICATIONS_BASE_URL = `${API_BASE}/api/admin/applications`
export const AGREEMENTS_BASE_URL = `${API_BASE}/api/admin/agreements`
export const getApplicantRetrieveUrl = (applicationId: number) => `${APPLICATIONS_BASE_URL}/${applicationId}`
export const getApplicantManagementListUrl = (externalId: string) => `${APPLICATIONS_BASE_URL}/fund/${externalId}/applicant-management-list`
export const getApplicantExportUrl = (externalId: string) => `${APPLICATIONS_BASE_URL}/fund/${externalId}/export`
export const getApplicationDocumentRequestCreateUrl = () => `${APPLICATIONS_BASE_URL}/application-document-request`
export const getApplicationDocumentRequestListUrl = (applicationId: number) => `${APPLICATIONS_BASE_URL}/application-document-request/${applicationId}`
export const getApplicationDocumentRequestResponseListUrl = (applicationId: number) => `${APPLICATIONS_BASE_URL}/application-document-request/response/${applicationId}`
export const getAgreementsDocumentUrl = (applicationId: number) => `${AGREEMENTS_BASE_URL}/${applicationId}`
export const getFetchApplicantVehicleUrl = () => `${API_BASE}/api/companies/vehicles`
export const getFetchStatuses = (externalId: string) => `${FUNDS_URL}${externalId}/applicants/status`
export const getApplicantAmlKycExportUrl = (externalId: string) => `${APPLICATIONS_BASE_URL}/fund/${externalId}/aml-kyc-export`
