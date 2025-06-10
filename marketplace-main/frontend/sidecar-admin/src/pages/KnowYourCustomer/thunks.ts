import { createAsyncThunk } from "@reduxjs/toolkit";
import { RootState } from "../../app/store";
import API from '../../api';
import applicationsAPI from '../../api/applicationsAPI';
import { COMMENT_RESOLVED } from "../../constants/commentStatus";
import {fetchTaskDetail} from "../TaskReview/thunks";


export const fetchWorkflows = createAsyncThunk<any, string, { state: RootState }>(
  "knowYourCustomer/fetchWorkflows", async (externalId: string, thunkAPI) => {
    try {
      return await API.getWorkflowsByFund(externalId);
    } catch (error: any) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  });

export const fetchKYCRecords = createAsyncThunk<any, any, { state: RootState }>(
  "knowYourCustomer/fetchKYCRecords", async (payload: any, thunkAPI) => {
    try {
      return await API.getKYCRecordsByWorkflow(payload.workflowSlug, payload.recordId, payload.applicationId);
    } catch (error: any) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  });

export const fetchFund = createAsyncThunk<any, string, { state: RootState }>(
  "knowYourCustomer/fetchFund", async (externalId: string, thunkAPI) => {
    try {
      return await API.getFundDetail(externalId);
    } catch (error: any) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  });

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

export const fetchTaxRecords = createAsyncThunk<any, undefined, { state: RootState }>(
  "fetchTaxRecords", async (_, thunkAPI) => {
    try {
      return await API.getTaxRecords();
    } catch (error: any) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  });

export const createTaxRecord = createAsyncThunk<any, undefined, { state: RootState }>(
  "createTaxRecord", async (_, thunkAPI) => {
    try {
      return await API.createTaxRecord();
    } catch (error: any) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  });

export const fetchGeoSelector = createAsyncThunk(
  "taxModule/fetchGeoSelector", async (_, thunkAPI) => {
    try {
      return await API.getRegionCountries();
    } catch (error: any) {
      return thunkAPI.rejectWithValue({error: error.message});
    }
  });

export const fetchTaxFormsAdmin = createAsyncThunk<any, number, { state: RootState }>(
  "fetchTaxFormsAdmin", async (recordId: number, thunkAPI) => {
    try {
      return await API.getTaxFormsAdmin(recordId);
    } catch (error: any) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  });

export const fetchApplicationInfo = createAsyncThunk<any, number, { state: RootState }>(
  "fetchApplicationInfo", async (applicationId: number, thunkAPI) => {
    try {
      return await applicationsAPI.retrieveApplication(applicationId);
    } catch (error: any) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  });

export const createApplicationDocumentRequest = createAsyncThunk<any, number, { state: RootState }>(
    "createApplicationDocumentRequest", async (payload: any, thunkAPI) => {
      try {
        return await applicationsAPI.createApplicationDocumentRequest(payload);
      } catch (error: any) {
        return thunkAPI.rejectWithValue({ error: error.message });
      }
    });

export const fetchApplicationDocumentRequests = createAsyncThunk<any, number, { state: RootState }>(
      "createApplicationDocumentRequest", async (applicationId: any, thunkAPI) => {
        try {
          return await applicationsAPI.fetchApplicationDocumentRequests(applicationId);
        } catch (error: any) {
          return thunkAPI.rejectWithValue({ error: error.message });
        }
      });

export const fetchApplicationDocumentRequestsResponse = createAsyncThunk<
  any,
  number,
  { state: RootState }
>(
  "applicationDocumentRequestResponse",
  async (applicationId: any, thunkAPI) => {
    try {
      return await applicationsAPI.fetchApplicationDocumentRequestsResponse(
        applicationId
      );
    } catch (error: any) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  }
);

export const fetchFundAgreements = createAsyncThunk<
  any,
  string,
  { state: RootState }
>(
  "fetchFundAgreements",
  async (applicationId: any, thunkAPI) => {
    try {
      return await applicationsAPI.fetchFundAgreements(
        applicationId
      );
    } catch (error: any) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  }
);

export const fetchTaxDetailsAdmin = createAsyncThunk<any, number, { state: RootState }>(
  "fetchTaxDetailsAdmin", async (recordId: number, thunkAPI) => {
    try {
      return await API.fetchTaxDetailsAdmin(recordId);
    } catch (error: any) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  });

export const approveComment = createAsyncThunk<any, number, { state: RootState }>(
    "knowYourCustomer/approveComment", async (commentId: number, thunkAPI) => {
      try {
        const state = thunkAPI.getState();
        const {knowYourCustomerState: {applicationInfo}} = state;
        const {taskReviewState: {task}} = state;
        await API.updateKYCCommentStatus(commentId, COMMENT_RESOLVED)
        if(applicationInfo){
          thunkAPI.dispatch(fetchCommentsByKycRecordId(applicationInfo?.kyc_record));
          thunkAPI.dispatch(fetchCommentsByApplicationId(applicationInfo?.id))
        }
        if (task) {
          thunkAPI.dispatch(fetchTaskDetail(task.id));
        }
      } catch (error: any) {
        return thunkAPI.rejectWithValue({ error: error.message });
      }
    });