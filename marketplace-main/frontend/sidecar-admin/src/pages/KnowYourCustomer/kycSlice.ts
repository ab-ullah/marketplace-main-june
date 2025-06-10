import {createSlice} from '@reduxjs/toolkit';
import {
  fetchApplicationDocumentRequests,
  fetchApplicationDocumentRequestsResponse,
  fetchFundAgreements,
  fetchApplicationInfo, fetchCommentsByApplicationId, fetchCommentsByKycRecordId,
  fetchFund,
  fetchKYCRecords,
  fetchWorkflows
} from "./thunks";
import {KYCState, RecordsByWorkflow} from './interfaces';
import {FLOW_TYPES} from './constants';
import {Comment, KYCRecordResponse, WorkFlow} from '../../interfaces/workflows';
import uniqBy from 'lodash/uniqBy';
import {mergeComments} from "./utils";


const initialState: KYCState = {
  amlKYCWorkflows: [],
  comments: [],
  commentsByRecord: {},
  documents: {},
  didFetch: {
    workflows: false,
    kycRecords: false,
    fund: false,
    comments: false,
  },
  fund: null,
  kycRecords: {},
  kycRecordsById: {},
  kycRecordParticipants: null,
  kycParticipantsDocuments: {},
  kycWorkflow: null,
  workflows: null,
  applicationInfo: null,
  applicationDocumentsRequests: [],
  applicationDocumentsRequestsResponse: [],
  fundAgreements: [],
  isApproveButtonDisabled: false,
};

export const kycSlice = createSlice({
  name: 'knowYourCustomerSlice',
  initialState,
  reducers: {
    addRecordDocuments(state, action) {
      const {recordId, documents} = action.payload;
      state.documents[recordId] = documents;
    },
    setKycRiskValuation(state, action) {
      state.kycRecordsById[action.payload.recordId].risk_evaluation = action.payload.riskEvaluation
    },
    clearKYCState(){
      return initialState;
    },
    setIsApproveButtonDisabled(state, action){
      state.isApproveButtonDisabled = action.payload
    }
  },
  extraReducers: (builder) => {
    builder.addCase(
      fetchWorkflows.fulfilled, (state, {payload}) => {
        state.didFetch.workflows = true;
        if (payload && Array.isArray(payload)) {
          const workflows = payload as WorkFlow[];
          state.workflows = workflows;
          const amlKYCWorkflows = workflows.filter(wf => wf.type === FLOW_TYPES.KYC);
          state.amlKYCWorkflows = amlKYCWorkflows;
        }
      }
    );
    builder.addCase(
      fetchWorkflows.pending, (state) => {
        state.didFetch.workflows = false;
      },
    );
    builder.addCase(
      fetchKYCRecords.fulfilled, (state, {payload}) => {
        state.didFetch.kycRecords = true;
        if (payload && Array.isArray(payload) && payload.length > 0) {
          const kycRecords = payload as KYCRecordResponse[];
          const recordsByWorkflow = kycRecords.reduce((acc, curr) => {
            acc[curr.workflow.slug] = [...(acc[curr.workflow.slug] || []), curr];
            return acc;
          }, {} as RecordsByWorkflow);
          state.kycRecords = {...state.kycRecords, ...recordsByWorkflow};
          state.kycRecordsById = Object.values(state.kycRecords).flat(1).reduce((acc, curr) => {
            acc[curr.id] = curr;
            return acc;
          }, {} as { [key: string]: KYCRecordResponse });
          kycRecords.forEach((record) => {
            if (record.kyc_participants && record.kyc_participants.length > 0) {
              state.kycRecordParticipants = record.kyc_participants;
            }
          })
        }
      }
    );
    builder.addCase(
      fetchKYCRecords.pending, (state) => {
        state.didFetch.kycRecords = false;
      }
    );
    builder.addCase(
      fetchFund.fulfilled, (state, {payload}) => {
        state.didFetch.fund = true;
        state.fund = payload;
      }
    );
    builder.addCase(
      fetchApplicationInfo.fulfilled, (state, {payload}) => {
        state.applicationInfo = payload;
      }
    );
    builder.addCase(
      fetchFund.pending, (state) => {
        state.didFetch.fund = false;
      }
    );
    builder.addCase(
      fetchCommentsByKycRecordId.fulfilled, (state, {payload}) => {
        state.didFetch.comments = true;
        const comments = payload as Comment[];
        state.comments = uniqBy([...comments, ...state.comments], (comment) => comment.id);
        state.commentsByRecord = mergeComments(state.commentsByRecord, comments);
      });
    builder.addCase(
      fetchCommentsByKycRecordId.pending, (state) => {
        state.didFetch.comments = false;
      }
    );
    builder.addCase(
      fetchCommentsByApplicationId.fulfilled, (state, {payload}) => {
        state.didFetch.comments = true;
        const comments = payload as Comment[];
        state.comments = uniqBy([...comments, ...state.comments], (comment) => comment.id);
        state.commentsByRecord = mergeComments(state.commentsByRecord, comments);
      });
    builder.addCase(
      fetchCommentsByApplicationId.pending, (state) => {
        state.didFetch.comments = false;
      }
    );
    builder.addCase(
      fetchApplicationDocumentRequests.fulfilled, (state, {payload}) => {
        state.applicationDocumentsRequests = payload;
      }
    );
    builder.addCase(
      fetchApplicationDocumentRequestsResponse.fulfilled, (state, {payload}) => {
        state.applicationDocumentsRequestsResponse = payload;
      }
    );
    builder.addCase(
      fetchFundAgreements.fulfilled, (state, {payload}) => {
        state.fundAgreements = payload;
      }
    );
  }
});

export const {addRecordDocuments, setKycRiskValuation, clearKYCState, setIsApproveButtonDisabled} = kycSlice.actions;
export default kycSlice.reducer;