import { FieldType } from 'components/Input'

import { OptionTypeBase } from 'react-select'

import * as Yup from 'yup'

export const INVESTOR_TYPE_OPTIONS = [
	{ label: 'As an Individual', value: 'INDIVIDUAL' },
	{ label: 'As a Corporate Entity', value: 'PRIVATE_COMPANY' },
	{ label: 'As a Partnership', value: 'LIMITED_PARTNERSHIP' },
	{ label: 'As a Trust', value: 'TRUST' },
]

export const DEPARTMENTS = [
	{
		label: 'General Management / Business Operations',
		value: 'general-management-business-operations',
	},
	{
		label: 'Portfolio & Fund Management',
		value: 'portfolio-&-fund-management',
	},
	{
		label: 'Transactions / Acquisitions',
		value: 'transactions-acquisitions',
	},
	{ label: 'Asset Management', value: 'asset-management' },
	{ label: 'Research & Strategy', value: 'research-strategy' },
	{ label: 'Investor Accounting & Finance', value: 'accounting-&-finance' },
	{
		label: 'Investor Relations - Relationship Managers',
		value: 'investor-relations/relationship-managers',
	},
	{
		label: 'Investor Relations - Project Management',
		value: 'investor-relations/pm',
	},
	{ label: 'PWG', value: 'pwg' },
	{ label: 'Investor Services', value: 'investor-services' },
	{ label: 'Tax', value: 'tax' },
	{ label: 'Legal & Compliance', value: 'legal-&-compliance' },
	{ label: 'Technology', value: 'technology' },
	{
		label: 'Corporate Accounting & Finance',
		value: 'corporate-accounting-&-finance',
	},
	{ label: 'Marketing & Communications', value: 'marketing-communications' },
	{ label: 'Human Resources', value: 'hr' },
	{ label: 'ESG / Sustainability', value: 'esg' },
	{ label: 'Administration (assistants & office managers)', value: 'admin' },
	{ label: 'Other', value: 'other' },
]

export const JOB_BANDS = [
	{ label: 'Business Support 1', value: 'Business Support 1' },
	{ label: 'Business Support 2', value: 'Business Support 2' },
	{ label: 'Business Support 3', value: 'Business Support 3' },
	{ label: 'Business Support 4', value: 'Business Support 4' },
	{ label: 'Business Support 5', value: 'Business Support 5' },
	{
		label: 'Portfolio and Fund Investment 1',
		value: 'Portfolio and Fund Investment 1',
	},
	{
		label: 'Portfolio and Fund Investment 2',
		value: 'Portfolio and Fund Investment 2',
	},
	{
		label: 'Portfolio and Fund Investment 3',
		value: 'Portfolio and Fund Investment 3',
	},
	{
		label: 'Portfolio and Fund Investment 4',
		value: 'Portfolio and Fund Investment 4',
	},
	{
		label: 'Portfolio and Fund Investment 5',
		value: 'Portfolio and Fund Investment 5',
	},
	{ label: 'Leadership 1', value: 'Leadership 1' },
	{ label: 'Leadership 2', value: 'Leadership 2' },
	{ label: 'Leadership 3', value: 'Leadership 3' },
	{ label: 'Leadership 4', value: 'Leadership 4' },
	{ label: 'Management 1', value: 'Management 1' },
	{ label: 'Management 2', value: 'Management 2' },
	{ label: 'Management 3', value: 'Management 3' },
	{ label: 'Management 4', value: 'Management 4' },
	{ label: 'Management 5', value: 'Management 5' },
	{ label: 'Professional 1', value: 'Professional 1' },
	{ label: 'Professional 2', value: 'Professional 2' },
	{ label: 'Professional 3', value: 'Professional 3' },
	{ label: 'Professional 4', value: 'Professional 4' },
	{ label: 'Professional 5', value: 'Professional 5' },
	{ label: 'Professional 6', value: 'Professional 6' },
	{ label: 'Producer 1', value: 'Producer 1' },
	{ label: 'Producer 2', value: 'Producer 2' },
	{ label: 'Producer 3', value: 'Producer 3' },
	{ label: 'Producer 4', value: 'Producer 4' },
	{ label: 'Producer 5', value: 'Producer 5' },
	{ label: 'Producer 6', value: 'Producer 6' },
	{ label: 'Producer 7', value: 'Producer 7' },
	{ label: 'Specialist 1', value: 'Specialist 1' },
	{ label: 'Specialist 2', value: 'Specialist 2' },
	{ label: 'Specialist 3', value: 'Specialist 3' },
	{ label: 'Specialist 4', value: 'Specialist 4' },
]

export const FIELDS = [
	{
		title: 'First name',
		fieldId: 'first_name',
		type: 'text',
		size: 'md',
	},
	{
		title: 'Last name',
		fieldId: 'last_name',
		type: 'text',
		size: 'md',
	},
	{
		title: 'How will you be investing?',
		fieldId: 'entity_type',
		type: 'radio',
		options: INVESTOR_TYPE_OPTIONS,
		size: 'md',
	},
	{
		title: 'Where were you when you decided to invest?',
		fieldId: 'origin_country',
		type: 'dropdown',
		size: 'md',
	},
] as FieldType[]

export const VALIDATION_SCHEMA = (_FIELDS => {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const validationObj: Record<string, any | undefined> = {}
	_FIELDS.forEach(
		// eslint-disable-next-line no-return-assign
		f =>
			(validationObj[f.fieldId] =
				f.type === 'checkbox'
					? Yup.object().test(
							'at-least-one-true',
							'Must select at least one',
							value => Object.values(value).some(v => v === true),
					  )
					: f.type === 'dropdown'
					? Yup.object().test(
							'at-least-one-true',
							'Must select at least one',
							value =>
								Object.values(value).some(v => !!v === true),
					  )
					: Yup.string().trim().required('Required')),
	)
	return Yup.object(validationObj)
})(FIELDS)

const generateBlankCheckbox = (options?: OptionTypeBase[]) => {
	const checkboxes: Record<string, boolean> = {}
	// eslint-disable-next-line no-return-assign
	options?.forEach((opt: OptionTypeBase) => (checkboxes[opt.value] = false))
	return checkboxes
}

export const INITIAL_VALUES = ((_FIELDS: FieldType[]) => {
	const initData: Record<string, string | Record<string, boolean>> = {}
	_FIELDS.forEach(
		// eslint-disable-next-line no-return-assign
		f =>
			(initData[f.fieldId] =
				f.type === 'checkbox' || f.type === 'dropdown'
					? generateBlankCheckbox(f.options)
					: ''),
	)
	return initData
})(FIELDS)

export const ONBOARDING_DEFAULTS = {
	job_title: null,
	job_band: null,
	department: null,
}
