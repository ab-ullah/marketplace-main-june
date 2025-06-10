/* eslint-disable @typescript-eslint/no-explicit-any */
import { AnswerTypes, KYCDocument, Question } from 'interfaces/workflows'
import * as React from 'react'
import {OptionTypeBase} from "react-select";
import {ChangeEvent} from "react";

export interface Comment {
	id: number
	question_text: string
	created_at: string
	text: string
	status: 1 | 2 | 3
	module: number
	module_id: number
	question_identifier: string
	document_identifier: string
	company: number
	commented_by: number
	comment_for: number
}

export interface FormValues {
	[key: string]: any
}

export interface Params {
	externalId: string
}

export interface RecordDocument {
	pendingUploads: File[]
	documentsInRecord: KYCDocument[]
}

export interface FormStatus {
	dirty?: boolean
	isSubmitting?: boolean
	isValidating?: boolean
	hasErrors?: boolean
}

export type FieldComponent = {
	question: Question<AnswerTypes>
	comments?: Comment[]
	documentComments?: any

	customOnBlur?: (e?: ChangeEvent<HTMLInputElement> | OptionTypeBase | null) => any;
}

export interface IUploadDocDetails {
	files: File[]
	recordId: number
	questionId: string
}

export interface ICommentsContext {
	comments: any
	recordId: null | number
	recordUUID: null | string
	callbackDocumentUpload: null | ((data: IUploadDocDetails) => void)
	fetchKYCRecord: null | (() => void)
}

export type DispatchStatus = React.Dispatch<{
	newStatus: FormStatus
	participantId: number
}>


export interface CommentsByRecord {
	[key: number]: {
		[key: number]: {
			[key: string]: {
				[key: string]: Comment[]
			}
		};
	}
}
