/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from 'react'
import { IDocument } from '../OpportunityOnboarding/criteria'
import {
	AnswerTypes,
	Card,
	Comment,
	KYCDocument,
	Question,
	WorkFlow,
	WorkFlowStatus,
} from '../../interfaces/workflows'
import {OptionTypeBase} from "react-select";
import {ChangeEvent} from "react";

export interface Application {
	id: number
	status: number
	status_display: string
	kyc_record: {
		uuid: string
		status: number
		id: number
		status_display: string
	}
	tax_record: {
		uuid: string
		status: number
		status_display: string
	}
	uuid: string
	fund: {
		slug: string
		name: string
	}
	created_at: string
	eligibility_response: number
	is_application_updated: boolean
	update_comment: string
	withdrawn_comment: string
	max_leverage_ratio: number
	has_custom_equity: boolean
	has_custom_leverage: boolean
	has_custom_total_investment: boolean
}

export interface FormValues {
	[key: string]: any
}

export interface FormErrors {
	[key: string]: string
}

export type FieldComponent = {
	question: Question<AnswerTypes>
	comments?: Comment[]
	documentComments?: any

	customOnBlur?: (e?: ChangeEvent<HTMLInputElement> | OptionTypeBase | null) => any;
}

export interface Params {
	externalId: string
}

export interface CommentsByRecord {
	[key: number]: {
		[key: number]: {
			[key: string]: {
				[key: string]: Comment[]
			}
		}
	}
}

export interface RecordDocument {
	pendingUploads: File[]
	documentsInRecord: KYCDocument[]
}

export interface DocumentsByParticipant {
	[key: string]: KYCDocument[]
}

export interface DocumentsByRecord {
	[key: string]: RecordDocument
}

export interface RecordsByParticipant {
	[key: string]: FormValues
}
export interface FormStatus {
	dirty?: boolean
	isSubmitting?: boolean
	isValidating?: boolean
	hasErrors?: boolean
}
export interface FormStatusByParticipant {
	[key: string]: FormStatus
}

export type DispatchStatus = React.Dispatch<{
	newStatus: FormStatus
	participantId: number
}>

export interface IApplicationDocumentsRequest {
	document_name: string
	document_description: string
	id: number
	uuid: string
	application: Application | null
}

export interface IApplicationRequestedDocument {
	id: number
	application_document_request: number
	document: IDocument
}

export interface KYCState {
	applicationRecord: Application | null
	comments: Comment[]
	commentsByRecord: CommentsByRecord
	documents: KYCDocument[]
	documentsByRecord: DocumentsByRecord
	kycRecordId: number | null
	kycRecordParticipants: RecordsByParticipant | null
	kycParticipantsDocuments: DocumentsByParticipant
	kycParticipantIds: number[] | null
	participantId: null | number
	fundWorkflows: WorkFlow[]
	workflow: WorkFlow | undefined
	selectedWorkflowSlug: string | null
	status: WorkFlowStatus | null
	answers: FormValues | null
	investorType: string | undefined
	recordUUID: string | null
	didFetch: {
		kycRecord: boolean
		initialRecord: boolean
		comments: boolean
		documents: boolean
		fundWorkflows: boolean
		participantDocuments: boolean
		workflow: boolean
	}
	isFetching: {
		firstParticipant: boolean
	}
	eligibilityCard: Card | null
	investmentAmountCard: Card | null
	eligibilityResponseId: number | null
	maxLeverageRatio: number | null
	minimumInvestment: number | null
	offerLeverage: boolean
	currentTaskId: number | null
	applicationDocumentsRequests: IApplicationDocumentsRequest[]
	applicationRequestedDocuments: IApplicationRequestedDocument[]
	IsEligible: boolean
}
