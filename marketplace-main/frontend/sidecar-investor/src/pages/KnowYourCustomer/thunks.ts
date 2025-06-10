import { createAsyncThunk } from "@reduxjs/toolkit";
import { RootState } from "../../app/store";
import { KYCDocument } from '../../interfaces/workflows';
import API from '../../api';
import eligibilityAPI from '../../api/eligibilityCriteria';

export const fetchKYCRecord = createAsyncThunk<any, string, { state: RootState }>(
  "knowYourCustomer/fetchKYCRecordId", async (recordUuid, thunkAPI) => {
    try {
      return await API.getKYCRecord(recordUuid, undefined);
    } catch (error: any) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  });

  export const fetchApplicationKYCRecord = createAsyncThunk<any, any, { state: RootState }>(
    "knowYourCustomer/fetchKYCRecordId", async (payload, thunkAPI) => {
      try {
        const { recordUUID, applicationId } = payload
        return await API.getKYCRecord(recordUUID, applicationId);
      } catch (error: any) {
        return thunkAPI.rejectWithValue({ error: error.message });
      }
    });

export const fetchKYCDocuments = createAsyncThunk<any, number, { state: RootState }>(
  "knowYourCustomer/fetchKYCDocuments", async (recordId, thunkAPI) => {
    try {
      return await API.getDocumentsInKYCRecord(recordId, undefined);
    } catch (error: any) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  });

  export const fetchApplicationKYCDocuments = createAsyncThunk<any, any, { state: RootState }>(
    "knowYourCustomer/fetchKYCDocuments", async (payload, thunkAPI) => {
      try {
        const { recordId, applicationId } = payload;
        return await API.getDocumentsInKYCRecord(recordId, applicationId);
      } catch (error: any) {
        return thunkAPI.rejectWithValue({ error: error.message });
      }
    });

export const fetchKYCParticipantsDocuments = createAsyncThunk<any, number, { state: RootState }>(
  "knowYourCustomer/fetchKYCParticipantDocuments", async (participantId, thunkAPI) => {
    try {
      const workflow = thunkAPI.getState().knowYourCustomerState.workflow;
      const kycRecordId = thunkAPI.getState().knowYourCustomerState.kycRecordId;
      if (!workflow || kycRecordId === null) return;
      const documents = await API.getKYCParticipantDocuments(workflow.slug, kycRecordId, participantId) as KYCDocument[];
      return { participantId, documents };
    } catch (error: any) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  });

  export const fetchApplicationKYCParticipantsDocuments = createAsyncThunk<any, number, { state: RootState }>(
    "knowYourCustomer/fetchKYCParticipantDocuments", async (participantId, thunkAPI) => {
      try {
        const workflow = thunkAPI.getState().knowYourCustomerState.workflow;
        const kycRecordId = thunkAPI.getState().knowYourCustomerState.kycRecordId;
        const applicationId = thunkAPI.getState().knowYourCustomerState.applicationRecord?.id;
        if (!workflow || kycRecordId === null) return;
        const documents = await API.getKYCParticipantDocuments(workflow.slug, kycRecordId, participantId, applicationId) as KYCDocument[];
        return { participantId, documents };
      } catch (error: any) {
        return thunkAPI.rejectWithValue({ error: error.message });
      }
    });

// export const fetchComments = createAsyncThunk<any, number, { state: RootState }>(
//   "knowYourCustomer/fetchComments", async (kycRecordId, thunkAPI) => {
//     try {
//       return await API.getActiveKYComments(kycRecordId);
//     } catch (error: any) {
//       return thunkAPI.rejectWithValue({ error: error.message });
//     }
//   });

export const fetchCommentsByKycRecordId = createAsyncThunk<any, number, { state: RootState }>(
  "knowYourCustomer/fetchCommentsByKycId", async (kycRecordId, thunkAPI) => {
    try {
      return await API.getKYCCommentsByKycId(kycRecordId);
    } catch (error: any) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  });

export const fetchCommentsByApplicationId = createAsyncThunk<any, number, { state: RootState }>(
  "knowYourCustomer/fetchCommentsByApplicationId", async (applicationId, thunkAPI) => {
    try {
      return await API.getKYCCommentsByApplicationId(applicationId);
    } catch (error: any) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  });

export const fetchWorkflows = createAsyncThunk<any, string, { state: RootState }>(
  "knowYourCustomer/fetchWorkflows", async (externalId, thunkAPI) => {
    try {
      return await API.getFundWorkflows(externalId);
    } catch (error: any) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  });

export const fetchInitialRecord = createAsyncThunk<any, string, { state: RootState }>(
  "knowYourCustomer/fetchInitialRecord", async (externalId, thunkAPI) => {
    try {
      const applicationRecords = await API.getAppRecords(externalId);
      const application = applicationRecords[0];
      if (application) {
        if (application.kyc_record) {
          const kyc_record = await API.getKYCRecord(application.kyc_record.uuid, undefined);
          return { application, kyc_record };
        }
        return { application };
      } else {
        const application = await API.createAppRecord({ fund_external_id: externalId });
        return { application };
      }
    } catch (error: any) {
      console.error(error)
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  });

  export const fetchInitialApplicationRecord = createAsyncThunk<any, string, { state: RootState }>(
    "knowYourCustomer/fetchInitialRecord", async (externalId, thunkAPI) => {
      try {
        const applicationRecords = await API.getAppRecords(externalId);
        const application = applicationRecords[0];
        if (application) {
          if (application.kyc_record) {
            // update it before commit
            const kyc_record = await API.getKYCRecord(application.kyc_record.uuid, application.id);
            return { application, kyc_record };
          }
          return { application };
        } else {
          const application = await API.createAppRecord({ fund_external_id: externalId });
          return { application };
        }
      } catch (error: any) {
        console.error(error)
        return thunkAPI.rejectWithValue({ error: error.message });
      }
    });

export const createFirstParticipant = createAsyncThunk<any, undefined, { state: RootState }>(
  "knowYourCustomer/createFirstParticipant", async (_, thunkAPI) => {
    try {
      const { workflow, kycRecordId } = thunkAPI.getState().knowYourCustomerState;
      return await API.createKYCParticipantRecord(workflow!.slug, kycRecordId!);
    } catch (error: any) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  });

export const fetchAdditionalCards = createAsyncThunk<any, number, { state: RootState }>(
  "knowYourCustomer/fetchAdditionalCards", async (applicationId: number, thunkAPI) => {
    try {
      return await eligibilityAPI.getApplicationEligibilityCriteria(applicationId);
    } catch (error: any) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  });

  export const fetchApplicationDocumentRequests = createAsyncThunk<any, number, { state: RootState }>(
    "fetchApplicationDocumentsRequests", async (applicationId: number, thunkAPI) => {
      try {
        return await API.fetchApplicationDocumentRequests(applicationId);
      } catch (error: any) {
        return thunkAPI.rejectWithValue({ error: error.message });
      }
    });

  export const uploadApplicationDocumentsRequestResponse = createAsyncThunk<any, FormData, { state: RootState }>(
      "uploadApplicationDocumentsRequestsResponse", async (payload: FormData, thunkAPI) => {
        try {
          return await API.uploadApplicationDocumentRequestResponse(payload);
        } catch (error: any) {
          return thunkAPI.rejectWithValue({ error: error.message });
        }
      });

  export const fetchApplicationDocumentRequestResponse = createAsyncThunk<any, number, { state: RootState }>(
        "fetchApplicationDocumentsRequestsResponse", async (payload: any, thunkAPI) => {
          try {
            return await API.fetchApplicationDocumentRequestResponse(payload);
          } catch (error: any) {
            return thunkAPI.rejectWithValue({ error: error.message });
          }
        });

  export const deleteApplicationDocumentRequestResponse = createAsyncThunk<any, number, { state: RootState }>(
          "deleteApplicationDocumentsRequestsResponse", async (responseId: number, thunkAPI) => {
            try {
              return await API.deleteApplicationDocumentRequestResponse(responseId);
            } catch (error: any) {
              return thunkAPI.rejectWithValue({ error: error.message });
            }
          });

export const dismissApplicationUpdateNotification = createAsyncThunk<
  any,
  any,
  { state: RootState }
>("dismissApplicationUpdateNotification", async (payload: any, thunkAPI) => {
  try {
    return await API.dismissApplicationUpdateNotification(payload);
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ error: error.message });
  }
});

