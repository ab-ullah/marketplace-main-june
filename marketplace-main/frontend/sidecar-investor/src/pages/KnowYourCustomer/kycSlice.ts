import cloneDeep from "lodash/cloneDeep";
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Application } from '../../interfaces/application';
import { Comment, KYCDocument, WorkflowAnswerPayload, WorkFlow, WorkFlowStatus, KYCRecordResponse } from '../../interfaces/workflows';
import {
  createFirstParticipant,
  fetchAdditionalCards,
  fetchInitialRecord,
  fetchKYCDocuments,
  fetchKYCParticipantsDocuments,
  fetchKYCRecord,
  fetchWorkflows,
  fetchApplicationDocumentRequests,
  fetchApplicationDocumentRequestResponse, fetchCommentsByApplicationId, fetchCommentsByKycRecordId
} from "./thunks";
import { CommentsByRecord, KYCState } from './interfaces'
import {
  getAMLWorkFlowByTypeSlug,
  parseDocumentsToAnswers,
  parseKYCRecord,
  mergeComments
} from './utils';
import uniqBy from "lodash/uniqBy";
import { initReplyModal } from "./constants";

const initialState: KYCState = {
  answers: null,
  applicationRecord: null,
  investorType: undefined,
  comments: [],
  commentsByRecord: {},
  documentsByRecord: {},
  kycRecordParticipants: null,
  kycParticipantsDocuments: {},
  kycParticipantIds: null,
  didFetch: {
    initialRecord: false,
    kycRecord: false,
    comments: false,
    documents: false,
    fundWorkflows: false,
    workflow: false,
    participantDocuments: false,
  },
  isFetching: {
    firstParticipant: false,
  },
  documents: [],
  kycRecordId: null,
  participantId: null,
  selectedWorkflowSlug: null,
  status: null,
  workflow: undefined,
  recordUUID: null,
  fundWorkflows: [],
  eligibilityCard: null,
  investmentAmountCard: null,
  eligibilityResponseId: null,
  maxLeverageRatio: null,
  minimumInvestment: null,
  offerLeverage: false,
  currentTaskId: null,
  applicationDocumentsRequests: [],
  applicationRequestedDocuments: [],
  replyModal: initReplyModal
};

export const kycSlice = createSlice({
  name: 'kycSlice',
  initialState,
  reducers: {
    setKYCRecordId: (state, action: PayloadAction<number | null>) => {
      state.kycRecordId = action.payload;
    },
    setKYCAnswers: (state, action: PayloadAction<WorkflowAnswerPayload>) => {
      state.answers = action.payload;
    },
    setSelectedWorkflowSlug: (state, action: PayloadAction<string | null>) => {
      const slug = action.payload as string;
      state.selectedWorkflowSlug = slug;
    },
    setWorkflow: (state, { payload }: PayloadAction<WorkFlow | undefined>) => {
      state.workflow = payload;
    },
    setApplicationStatus: (state, { payload }: PayloadAction<WorkFlowStatus | null>) => {
      state.status = payload;
    },
    setRecordUUID: (state, { payload }: PayloadAction<string | null>) => {
      state.recordUUID = payload;
    },
    setCurrentTaskId: (state, { payload }: PayloadAction<number | null>) => {
      state.currentTaskId = payload;
    },
    setIsReplyModalOpen: (state, { payload }: PayloadAction<any>) => {
      state.replyModal = payload;
    },
    resetToDefault: () => initialState
  },
  extraReducers: (builder) => {
    builder.addCase(
      fetchKYCRecord.fulfilled, (state, actions) => {
        state.didFetch.kycRecord = true;
        const record = actions.payload as KYCRecordResponse;
        const {
          id,
          status,
          answers,
          investorType,
          participants,
          participantsIds,
          workflowSlug,
        } = parseKYCRecord(record, state.documents);
        state.kycRecordId = id;
        state.status = status;
        state.answers = answers;
        state.selectedWorkflowSlug = workflowSlug;
        state.kycParticipantIds = participantsIds;
        state.investorType = investorType;
        state.workflow = getAMLWorkFlowByTypeSlug(state.fundWorkflows, workflowSlug);
        if (participants === null) {
          state.kycRecordParticipants = null;
        } else {
          if (state.kycRecordParticipants === null) {
            state.kycRecordParticipants = {}
          }
          participants.forEach(participantRecord => {
            const { answers } = parseKYCRecord(participantRecord, state.kycParticipantsDocuments[participantRecord.id]);
            state.kycRecordParticipants![participantRecord.id] = answers;
          });
        }
      }
    );
    builder.addCase(
      fetchKYCDocuments.fulfilled, (state, actions) => {
        const documents = actions.payload as KYCDocument[]
        state.documents = documents;
        state.didFetch.documents = true;
        if (state.answers !== null) {
          const docAnswers = parseDocumentsToAnswers(documents);
          state.answers = Object.assign({}, state.answers, docAnswers);
        }
      }
    );
    builder.addCase(
      fetchCommentsByKycRecordId.fulfilled, (state, {payload}) => {
        state.didFetch.comments = true;
        const comments = payload as Comment[];
        state.comments = uniqBy([...comments, ...cloneDeep(state.comments)], (comment) => comment.id);
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
        state.comments = uniqBy([...comments, ...cloneDeep(state.comments)], (comment) => comment.id);
        state.commentsByRecord = mergeComments(state.commentsByRecord, comments);
      });
    builder.addCase(
      fetchCommentsByApplicationId.pending, (state) => {
        state.didFetch.comments = false;
      }
    );
    builder.addCase(
      fetchWorkflows.fulfilled, (state, { payload }) => {
        const fundWorkflows = (payload as WorkFlow[]).map(workflow => ({
          ...workflow,
          cards: workflow.cards.sort((a, b) => a.order - b.order),
        }));
        state.fundWorkflows = fundWorkflows;
        state.didFetch.fundWorkflows = true;
        state.workflow = getAMLWorkFlowByTypeSlug(fundWorkflows, state.selectedWorkflowSlug);
      }
    );
    builder.addCase(
      fetchAdditionalCards.fulfilled, (state, { payload }) => {
        state.eligibilityCard = payload.eligibility_card;
        state.investmentAmountCard = payload.investment_card;
        state.eligibilityResponseId = payload.response_id;
        state.maxLeverageRatio = payload.max_leverage_ratio;
        state.minimumInvestment = payload.minimum_investment;
        state.offerLeverage = payload.offer_leverage;
      }
    );
    builder.addCase(
      fetchInitialRecord.fulfilled, (state, { payload }) => {
        const { application, kyc_record } = payload as {
          application: Application,
          kyc_record: KYCRecordResponse | undefined,
        };
        state.applicationRecord = application;
        if (kyc_record) {
          state.recordUUID = kyc_record.uuid;
          const {
            id,
            status,
            answers,
            investorType,
            participants,
            participantsIds,
            workflowSlug,
          } = parseKYCRecord(kyc_record, state.documents);
          state.kycRecordId = id;
          state.status = status;
          state.answers = answers;
          state.selectedWorkflowSlug = workflowSlug;
          state.workflow = getAMLWorkFlowByTypeSlug(state.fundWorkflows, workflowSlug);
          state.kycParticipantIds = participantsIds;
          if (participants === null) {
            state.kycRecordParticipants = null;
          } else {
            if (state.kycRecordParticipants === null) {
              state.kycRecordParticipants = {}
            }
            participants.forEach(participantRecord => {
              const { answers } = parseKYCRecord(participantRecord, state.kycParticipantsDocuments[participantRecord.id]);
              state.kycRecordParticipants![participantRecord.id] = answers;
            });
          }
          state.didFetch.kycRecord = true;
          state.investorType = investorType;
        } else {
          state.answers = {};
        }
        state.didFetch.initialRecord = true;
      });
    builder.addCase(
      fetchKYCParticipantsDocuments.fulfilled, (state, { payload }) => {
        if (!payload) return
        const { participantId, documents } = payload;
        state.didFetch.participantDocuments = true;
        state.kycParticipantsDocuments[participantId] = documents as KYCDocument[];
        const docAnswers = parseDocumentsToAnswers(documents);
        if (state.kycRecordParticipants !== null) {
          //TODO : reconsider this
          state.kycRecordParticipants[participantId] = Object.assign({}, state.kycRecordParticipants[participantId], docAnswers);
        }
      }
    );
    builder.addCase(
      createFirstParticipant.fulfilled, (state, { payload }) => {
        const { id } = payload;
        const { answers } = parseKYCRecord(payload, state.kycParticipantsDocuments[id]);
        state.kycRecordParticipants![id] = answers;
        state.kycParticipantIds!.push(id);
      }
    )
    builder.addCase(
      createFirstParticipant.pending, (state) => {
        state.isFetching.firstParticipant = true;
      }
    )
    builder.addCase(
      fetchWorkflows.pending, (state) => {
        state.didFetch.fundWorkflows = false;
      }
    )
    builder.addCase(
      fetchWorkflows.rejected, (state) => {
        state.didFetch.fundWorkflows = true;
      }
    )
    builder.addCase(
      fetchKYCRecord.rejected, (state) => {
        state.didFetch.kycRecord = true;
        state.answers = {};
      }
    );
    builder.addCase(
      createFirstParticipant.rejected, (state) => {
        state.isFetching.firstParticipant = false;
      }
    );
    builder.addCase(
      fetchKYCDocuments.pending, (state) => {
        state.didFetch.documents = false;
      }
    );
    builder.addCase(
      fetchApplicationDocumentRequests.fulfilled, (state, {payload}) => {
        state.applicationDocumentsRequests = payload
      }
    );
    builder.addCase(
      fetchApplicationDocumentRequestResponse.fulfilled, (state, {payload}) => {
        state.applicationRequestedDocuments = payload
      }
    );

  }
});

export const { setSelectedWorkflowSlug } = kycSlice.actions;
export const { setApplicationStatus } = kycSlice.actions;
export const { setKYCRecordId } = kycSlice.actions;
export const { setRecordUUID } = kycSlice.actions;
export const { setKYCAnswers } = kycSlice.actions;
export const { setWorkflow } = kycSlice.actions;
export const { setCurrentTaskId } = kycSlice.actions;
export const { setIsReplyModalOpen } = kycSlice.actions;
export const { resetToDefault } = kycSlice.actions;

export default kycSlice.reducer;