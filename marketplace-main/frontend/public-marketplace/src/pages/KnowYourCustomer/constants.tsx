/* eslint-disable @typescript-eslint/no-explicit-any */
import { WorkFlow, WorkFlowStatus } from 'interfaces/workflows'
import { FormStatus } from './interfaces'

export const INVESTOR_URL_PREFIX = 'investor'

export const FLOW_TYPES = {
	KYC: 1,
	ELIGIBILITY: 2,
	INDICATION_OF_INTEREST: 3,
}

const KYC_AML_FLOW_SLUG_PREFIX = 'kyc-aml'

export const KYC_INDIVIDUAL_INVESTOR = 'INDIVIDUAL'

export const KYC_PARTICIPANT_INVESTOR = 'PARTICIPANT'

export const KYC_ENTITY = 'ENTIRY'

export const KYC_PRIVATE_COMPANY_INVESTOR = 'PRIVATE_COMPANY'

export const KYC_LIMITED_PARTNERSHIP_INVESTOR = 'LIMITED_PARTNERSHIP'

export const KYC_TRUST_INVESTOR = 'TRUST'

export const KYC_INVESTOR_TYPE: { [key: string]: number } = {
	[KYC_INDIVIDUAL_INVESTOR]: 1,
	[KYC_PARTICIPANT_INVESTOR]: 2,
	[KYC_ENTITY]: 3,
	[KYC_PRIVATE_COMPANY_INVESTOR]: 4,
	[KYC_LIMITED_PARTNERSHIP_INVESTOR]: 5,
	[KYC_TRUST_INVESTOR]: 6,
}

export const KYC_ENTITY_INVESTORS = [
	KYC_PRIVATE_COMPANY_INVESTOR,
	KYC_LIMITED_PARTNERSHIP_INVESTOR,
	KYC_TRUST_INVESTOR,
]

export const STATUS_CODES: { [key: string]: WorkFlowStatus } = {
	CREATED: {
		id: 1,
		code: 'CREATED',
		label: 'Created',
	},
	SUBMITTED: {
		id: 2,
		code: 'SUBMITTED',
		label: 'Submitted',
	},
	CHANGE_REQUESTED: {
		id: 3,
		code: 'CHANGE_REQUESTED',
		label: 'Changes Requested',
	},
	APPROVED: {
		id: 4,
		code: 'APPROVED',
		label: 'Approved',
	},
}

export const PARTICIPANT_FORMS_INITIAL_STATE = {
	statuses: {},
	disallowSubmit: false,
	anySubmitting: false,
	anyDirty: false,
}

export const AML_FLOW_SLUGS: { [key: string]: string } = {
	[KYC_INDIVIDUAL_INVESTOR]: `${KYC_AML_FLOW_SLUG_PREFIX}-individual`,
	ENTITY_SELECTION: `${KYC_AML_FLOW_SLUG_PREFIX}-entity`,
	[KYC_PRIVATE_COMPANY_INVESTOR]: `${KYC_AML_FLOW_SLUG_PREFIX}-private-company`,
	[KYC_LIMITED_PARTNERSHIP_INVESTOR]: `${KYC_AML_FLOW_SLUG_PREFIX}-limited-partnership`,
	[KYC_TRUST_INVESTOR]: `${KYC_AML_FLOW_SLUG_PREFIX}-trust`,
}

export const AML_SLUG_SELECTION_ID = 'aml-kyc-type-selection'

export const AML_KYC_ENTITIES_WORKFLOW = (): WorkFlow => ({
	slug: AML_FLOW_SLUGS.ENTITY_SELECTION,
	type: FLOW_TYPES.KYC,
	name: 'KYC / AML Entities',
	cards: [
		{
			id: 'aml-kyc-entities-and-stuff-aml-entity-card',
			name: 'AML Entity Type Selection',
			order: 1,
			schema: [
				{
					id: 'entity_name',
					label: 'What is the name of your entity?',
					type: 'text',
					required: true,
					data: {},
				},
				{
					id: AML_SLUG_SELECTION_ID,
					label: 'What is the type of your entity?',
					type: 'radio-select',
					required: true,
					data: {
						options: [
							{
								label: 'Corporate Entity',
								value: AML_FLOW_SLUGS.PRIVATE_COMPANY,
							},
							{
								label: 'Partnership',
								value: AML_FLOW_SLUGS.LIMITED_PARTNERSHIP,
							},
							{
								label: 'Trust',
								value: AML_FLOW_SLUGS.TRUST,
							},
						],
					},
				},
			],
		},
	],
})

export const AML_KYC_TYPE_WORKFLOW = (): WorkFlow => ({
	type: FLOW_TYPES.KYC,
	slug: 'aml-kyc-flow-selection',
	name: 'KYC / AML ',
	cards: [
		{
			id: 'type-of-aml-kyc-selection',
			name: 'As next steps for your investment application, please complete the required information below.',
			order: 1,
			schema: [
				{
					id: 'aml-kyc-type-selection',
					label: 'Are you investing as an individual or an entity?',
					type: 'radio-select',
					required: true,
					data: {
						options: [
							{
								value: AML_FLOW_SLUGS.INDIVIDUAL,
								label: 'Individual',
							},
							{
								value: AML_FLOW_SLUGS.ENTITY_SELECTION,
								label: 'Entity',
							},
						],
					},
				},
			],
		},
	],
})

export const DEFAULT_NON_SELECTABLE_OPTION: any = {
	label: '-',
	value: '‎',
}

export const MAX_FILE_SIZE = 25000000

export const BASE_FORM_STATUS: FormStatus = {
	dirty: false,
	hasErrors: false,
	isSubmitting: false,
	isValidating: false,
}


export const APPLICATION_STATUSES = {
	CREATED: 'Created',
	SUBMITTED: 'Submitted',
	DENIED: 'Denied',
	APPROVED: 'Approved',
	WITHDRAWN: 'Withdrawn',
	FINALIZED: 'Finalized'
}