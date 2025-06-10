import React from "react";
import {Comment, KYCDocument, KYCRecordResponse, WorkFlow} from '../../interfaces/workflows';
import {IDocument} from "../../interfaces/FundMarketingPage/fundMarketingPage";
import {IBaseApplication} from "../../interfaces/application";


export interface CommentsByRecord {
    [key: number]: {
        [key: number]: {
            [key: string]: {
                [key: string]: Comment[]
            }
        };
    }
}

export interface RecordsByWorkflow {
    [key: string]: KYCRecordResponse[]
}

export type LookupOptions = 'lookup_value' | 'direct_answer' | 'file' | 'eligibility_criteria_response' | 'investment_amount_response' | 'investment_amount_response_no_flag' | 'cashless_commitment' | 'leverage_amount';
export type NoLookup = 'none';

export type ValueLookup = {
    LOOKUP_VALUE: 'lookup_value',
    DIRECT_ANSWER: 'direct_answer',
    FILE: 'file',
    ELIGIBILITY_CRITERIA: 'eligibility_criteria_response',
    INVESTMENT_AMOUNT_RESPONSE: 'investment_amount_response',
    INVESTMENT_AMOUNT_RESPONSE_NO_FLAG: 'investment_amount_response_no_flag',
    CASHLESS_COMMITMENT: 'cashless_commitment',
    LEVERAGE_AMOUNT: 'leverage_amount',
    [key: string]: LookupOptions | NoLookup
}

export interface IApplicationDocumentsRequest {
    document_name: string;
    document_description: string;
    id: number;
    application: IBaseApplication;
    uuid: string;
}

export interface KYCState {
    amlKYCWorkflows: WorkFlow[],
    comments: Comment[];
    commentsByRecord: CommentsByRecord;
    documents: {
        [key: string]: KYCDocument[]
    };
    fund: any,
    didFetch: {
        comments: boolean,
        workflows: boolean;
        kycRecords: boolean;
        fund: boolean;
    };
    kycWorkflow: WorkFlow | null;
    kycRecords: RecordsByWorkflow;
    kycRecordParticipants: any;
    kycParticipantsDocuments: any;
    kycRecordsById: {
        [key: string]: KYCRecordResponse
    };
    workflows: WorkFlow[] | null;
    applicationInfo: IBaseApplication | null;
    applicationDocumentsRequests: any;
    applicationDocumentsRequestsResponse: any;
    fundAgreements: any;
    isApproveButtonDisabled: boolean;
}


export interface IEligibilityCriteriaAnswer {
    answer_values: string[],
    documents: IDocument[],
    approval_documents?: IDocument[]
}


export type ParsedQuestion = {
    data: any;
    id: string;
    label: string;
    description: string;
    required: boolean;
    type: LookupOptions | NoLookup;
    submitted_answer: IEligibilityCriteriaAnswer;
}

export interface TaxState {
    taxForms: any,
    taxDocumentsList: any,
    taxRecords: any,
    checkedForms: any,
    geoSelector: any,
    signUrl: {[key: string]: string},
    taxRecordsExist: boolean,
    taxDocumentsListExist: boolean,
    taxFormsAdmin: any,
    taxDetails: any,
  }
export interface INotificationConfig {
    show: boolean;
    title: string;
    msg: React.ReactNode | string;
}
