/* eslint-disable @typescript-eslint/no-explicit-any */
import { AnswerTypes, Question } from '../../interfaces/workflows'
import { GeoSelector } from '../../interfaces/common'

export type FieldComponent = {
	question: Question<AnswerTypes>
}

export interface Params {
	externalId: string
	company: string
}

export interface Link {
	status: string
	envelope_id: string
	documentName: string
	disabled: boolean
	isCreatingEnvelop: boolean
	checked: boolean
	document_id: string
	record_id: number
	inputType: string
}

export interface LinkByTaxForm {
	[key: string]: Link
}

export interface TaxState {
	taxForms: any
	taxDocumentsList: any
	appRecords: any
	checkedForms: any
	geoSelector: GeoSelector[]
	signUrl: { [key: string]: string }
	hasFetchedAppRecords: boolean
	taxDocumentsListExist: boolean
	taxFormsAdmin: any
	taxFormsLinks: any
	taxDetails: any
}
