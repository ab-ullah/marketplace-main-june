/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable prefer-template */
/* eslint-disable class-methods-use-this */
import axios from 'axios'
import {
	KYCDocument,
	KYCRecordResponse,
	WorkFlow,
	WorkflowAnswerPayload,
	WorkFlowStatus,
} from 'interfaces/workflows'
import {
	APP_RECORDS_URL,
	COMMENTS_URL,
	documentDownloadUrl,
	getApplicationDocumentRequestListUrl,
	getApplicationDocumentRequestResponseDeletetUrl,
	getApplicationDocumentRequestResponseListUrl,
	getApplicationDocumentRequestResponseUrl,
	getAppRecords,
	getCountriesUrl,
	getCreateEnvelopeUrl,
	getCreateTaxReviewTaskUrl,
	getCreateTaxWorkflowUrl,
	getDismissApplicationUpdateNotificationtUrl,
	getFetchTaxDetailsUrl,
	getFundAppRecords,
	getFundTaxFormsUrl,
	getKYCDocumentDeletionURL,
	getKYCDocumentsURL,
	getKycEligibilityCriteriaUrl,
	getKYCParticipantRecordCreateURL,
	getKYCParticipantRecordDocumentsURL,
	getKYCParticipantRecordUpdateURL,
	getKYCRecordCreateURL,
	getKYCRecordFetchURL,
	getKYCRecordUpdateURL, getProgramDocsSigningUrl, getSaveProgramDocsSigningUrl, getResponseStatus,
	getSaveSignedFormUrl,
	getSigningUrlUrl,
	getTaxDocumentDeletionURL,
	getTaxDocumentsListUrl,
	getTaxRecordsCreateUrl, getUpdateProgramDocsUrl,
	getUpdateTaxRecordUrl, getUserAgreementSigningUrl,
	getWorkflowsURLByFund,
	reviewKYCRecordUpdateURL, storeUserResponseUrl, deleteDocumentUrl, getFundProfileURL, USER_INFO_URL, getFeatureFlagsUrl, ADVISOR_USER_URL,
} from 'api/routes'
import { Application } from 'interfaces/KnowYourCustomer'
import { Buffer } from 'buffer'
import download from 'downloadjs'


class MarketplaceAPI {
	getKYCRecord = async (uuid: string) => {
		const url = getKYCRecordFetchURL(uuid)
		const response = await axios.get(url)
		return response.data as KYCRecordResponse
	}

	getDocumentsInKYCRecord = async (recordId: number) => {
		const url = getKYCDocumentsURL(recordId)
		const response = await axios.get(url)
		return response.data as KYCDocument[]
	}

	getKYCParticipantDocuments = async (
		workflowSlug: string,
		kycRecordId: number,
		participantId: number,
	) => {
		const url = getKYCParticipantRecordDocumentsURL(
			workflowSlug,
			kycRecordId,
			participantId,
		)
		const response = await axios.get(url)
		return response.data
	}

	getKYCCommentsByKycId = async (kycRecordId: number) => {
		const response = await axios.get(
			`${COMMENTS_URL}?kyc_id=${kycRecordId}`,
		)
		return response.data as Comment[]
	}

	getKYCCommentsByApplicationId = async (applicationId: number) => {
		const response = await axios.get(
			`${COMMENTS_URL}?application_id=${applicationId}`,
		)
		return response.data as Comment[]
	}

	getFundWorkflows = async (externalId: string) => {
		const url = getWorkflowsURLByFund(externalId)
		const response = await axios.get(url)
		return response.data as WorkFlow[]
	}

	getAppRecords = async (externalId: string) => {
		const url = getFundAppRecords(externalId)
		const response = await axios.get(url)
		return response.data as Application[]
	}

	createAppRecord = async (payload: any) => {
		const response = await axios.post(APP_RECORDS_URL + '/', payload)
		return response.data
	}

	createKYCParticipantRecord = async (
		workflowSlug: string,
		kycRecordId: number,
	) => {
		const url = getKYCParticipantRecordCreateURL(workflowSlug, kycRecordId)
		const response = await axios.post(url)
		return response.data
	}

	getApplicationEligibilityCriteria = async (applicationId: number) => {
		const url = getKycEligibilityCriteriaUrl(applicationId)
		const response = await axios.get(url)
		return response.data
	}

	fetchApplicationDocumentRequests = async (applicationId: any) => {
		const url = getApplicationDocumentRequestListUrl(applicationId)
		const response = await axios.get(url)
		return response.data
	}

	uploadApplicationDocumentRequestResponse = async (payload: FormData) => {
		const url = getApplicationDocumentRequestResponseUrl()
		const response = await axios.post(url, payload, {
			headers: { 'content-type': 'multipart/form-data' },
		})
		return response.data
	}

	fetchApplicationDocumentRequestResponse = async (applicationId: any) => {
		const url = getApplicationDocumentRequestResponseListUrl(applicationId)
		const response = await axios.get(url)
		return response.data
	}

	deleteApplicationDocumentRequestResponse = async (applicationId: any) => {
		const url =
			getApplicationDocumentRequestResponseDeletetUrl(applicationId)
		const response = await axios.delete(url)
		return response.data
	}

	dismissApplicationUpdateNotification = async (payload: {
		application_id: string
		application_fields: { is_application_updated: boolean }
	}) => {
		const { application_id, application_fields } = payload
		const url = getDismissApplicationUpdateNotificationtUrl(application_id)
		const response = await axios.patch(url, application_fields)
		return response.data
	}

	createKYCRecord = async (
		workflowSlug: string,
		status: WorkFlowStatus,
		payload: WorkflowAnswerPayload,
	) => {
		const url = getKYCRecordCreateURL(workflowSlug)
		const response = await axios.post(url, {
			status: status.id,
			...payload,
		})
		return response.data
	}

	updateAppRecord = async (uuid: string, payload: any) => {
		const url = getAppRecords(uuid)
		const response = await axios.patch(url, payload)
		return response.data
	}

	createKYCEntityRecord = async (workflowSlug: string, payload: any) => {
		const url = getKYCRecordCreateURL(workflowSlug)
		const response = await axios.post(url, payload)
		return response.data
	}

	getKYCDocumentAsDataURI = async (documentId: string) => {
		const url = documentDownloadUrl(documentId)
		const response = await axios.get(url, { responseType: 'arraybuffer' })
		const raw = Buffer.from(response.data).toString('base64')
		const fileURL = `data:${response.headers['content-type']};base64,${raw}`
		const fileType = response.headers['content-type']
		return { fileURL, fileType }
	}

	deleteKYCDocument = async (kycRecordId: number, documentId: string) => {
		const url = getKYCDocumentDeletionURL(kycRecordId, documentId)
		const response = await axios.delete(url)
		return response.data
	}

	uploadDocumentToKYCRecord = async (
		recordId: number,
		formData: FormData,
	) => {
		const url = getKYCDocumentsURL(recordId)
		const response = await axios.post(url, formData, {
			headers: {
				'content-type': 'multipart/form-data',
			},
		})
		return response.data
	}

	updateKYCRecord = async (
		workflowSlug: string,
		recordId: number,
		payload: WorkflowAnswerPayload,
	) => {
		const url = getKYCRecordUpdateURL(workflowSlug, recordId)
		const response = await axios.patch(url, payload)
		return response.data
	}

	uploadKYCParticipantDocument = async (
		workflowSlug: string,
		kycRecordId: number,
		participantId: number,
		formData: FormData,
	) => {
		const url = getKYCParticipantRecordDocumentsURL(
			workflowSlug,
			kycRecordId,
			participantId,
		)
		const response = await axios.post(url, formData, {
			headers: { 'content-type': 'multipart/form-data' },
		})
		return response.data
	}

	updateParticipantRecord = async (
		workflowSlug: string,
		kycRecordId: number,
		participantId: number,
		payload: any,
	) => {
		const url = getKYCParticipantRecordUpdateURL(
			workflowSlug,
			kycRecordId,
			participantId,
		)
		const response = await axios.patch(url, payload)
		return response.data
	}

	reviewKYCRecord = async (externalId: string, recordId: number) => {
		const url = reviewKYCRecordUpdateURL(recordId, externalId)
		const response = await axios.get(url)
		return response.data
	}

	updateKYCParticipantStatus = async (
		workflowSlug: string,
		recordId: number,
		participantId: number,
		status: WorkFlowStatus,
	) => {
		const url = getKYCParticipantRecordUpdateURL(
			workflowSlug,
			recordId,
			participantId,
		)
		const response = await axios.patch(url, {
			status: status.id,
		})
		return response.data
	}

	getTaxForms = async (fundExternalId: string) => {
		const url = getFundTaxFormsUrl(fundExternalId)
		const response = await axios.get(url)
		return response.data
	}

	getTaxDocumentsList = async (tax_record_id: string) => {
		const url = getTaxDocumentsListUrl(tax_record_id)
		const response = await axios.get(url)
		return response.data
	}

	getRegionCountries = async (externalId: string) => {
		const url = getCountriesUrl(externalId)
		const response = await axios.get(url)
		return response.data
	}

	updateTaxRecord = async (recordUUI: string, payload: any) => {
		const url = getUpdateTaxRecordUrl(recordUUI)
		const response = await axios.patch(url, payload)
		return response.data
	}

	fetchTaxDetails = async (record_id: string) => {
		const url = getFetchTaxDetailsUrl(record_id)
		const response = await axios.get(url)
		return response.data
	}

	createTaxWorkflow = async (fund_external_id: string) => {
		const url = getCreateTaxWorkflowUrl(fund_external_id)
		const response = await axios.post(url)
		return response.data
	}

	createTaxReviewTask = async (
		fund_external_id: string,
		recordUUID: string,
	) => {
		const url = getCreateTaxReviewTaskUrl(fund_external_id, recordUUID)
		const response = await axios.post(url)
		return response.data
	}

	createTaxRecord = async (externalId: string) => {
		const url = getTaxRecordsCreateUrl(externalId)
		const response = await axios.post(url)
		return response.data
	}

	saveSignedForm = async (fundExternalId: string, envelopeId: string) => {
		const url = getSaveSignedFormUrl(fundExternalId, envelopeId)
		const response = await axios.put(url)
		return response.data
	}

	getSigningUrl = async (envelopeId: string, returnUrl: string) => {
		const url = getSigningUrlUrl(envelopeId, returnUrl)
		const response = await axios.get(url)
		return response.data
	}

	deleteTaxDocument = async (recordId: number, documentId: string) => {
		const url = getTaxDocumentDeletionURL(recordId, documentId)
		const response = await axios.delete(url)
		return response.data
	}

	createEnvelope = async (taxRecordUUID: string, payload: any) => {
		const url = getCreateEnvelopeUrl(taxRecordUUID)
		const response = await axios.post(url, payload)
		return response.data
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
	downloadDocument = async (documentId: string, name: string) => {
		const url = documentDownloadUrl(documentId);
		const response = await axios.get(url, {responseType: 'blob'})
		const content = response.headers['content-type'];
		download(response.data, name, content)
	}

	saveProgramDocsSigningUrl = async (fundSlug: string, envelopeId: string) => {
		const url = getSaveProgramDocsSigningUrl(fundSlug, envelopeId);
		const response = await axios.get(url);
		return response.data;
	}

	updateProgramDocs = async (externalId: string, documentId: string, payload: FormData) => {
		const url = getUpdateProgramDocsUrl(externalId, documentId);
		const response = await axios.patch(url, payload, {
			headers: {'content-type': 'multipart/form-data'}
		});
		return response.data
	};

	getProgramDocsSigning = async (externalId: string, programDocId: number, returnUrl: string) => {
		const url = getProgramDocsSigningUrl(externalId, programDocId, returnUrl);
		const response = await axios.get(url);
		return response.data;
	}

	getResponseStatus = async (responseId: number) => {
		const url = getResponseStatus(responseId)
		const response = await axios.get(url);
		return response.data
	};

	updateKYCRecordStatus = async (workflowSlug: string, recordId: number, status: WorkFlowStatus) => {
		const url = getKYCRecordUpdateURL(workflowSlug, recordId)
		const response = await axios.patch(url, {
			status: status.id
		})
		return response.data;
	}

	deleteDocument = async (documentId: number) => {
		const url = deleteDocumentUrl(documentId)
		const response = await axios.delete(url);
		return response.data
	};

	getFundProfile = async (externalId: string) => {
		const url = getFundProfileURL(externalId)
		const response = await axios.get(url)
		return response.data;
	}

	getUserInfo = async () => {
		const response = await axios.get(USER_INFO_URL);
		return response.data
	};

	getFeatureFlag = async (featureFlag: string) => {
		const response = await axios.get(getFeatureFlagsUrl(featureFlag));
		return response.data
	};

	getAdvisorUsers = async () => {
		const response = await axios.get(ADVISOR_USER_URL);
		return response.data
	  };
}

export default new MarketplaceAPI()
