/* eslint-disable import/prefer-default-export */
import { FieldType } from 'components/Input'
import { OptionTypeBase } from 'react-select'

import * as Yup from 'yup'

export const LEVERAGE_OPTIONS = [
	{ value: 0, label: 'None' },
	{ value: 3, label: '3:1' },
	{ value: 4, label: '4:1' },
]

export const DESCRIPTION_TEXT =
	'Please enter your requested equity investment amount and select a leverage option to indicate your total requested gross investment. The requested amount can be updated up until the Application Period is closed. After the Application Period is closed, requested amounts and leverage can only be decreased prior to signing the subscription documents.'

export const FIELDS = [
	{
		title: 'How much equity would you like to invest?',
		fieldId: 'amount',
		type: 'text',
		size: 'lg',
		prefix: 'USD',
		// hintText: 'Min. 5,000 ',
		format: 'currency',
	},
	{
		title: 'How much leverage would you like? ',
		fieldId: 'leverage_ratio',
		type: 'radio',
		size: 'md',
		options: LEVERAGE_OPTIONS,
		helperText: 'What is your Co-investment Eligibility limit',
	},
] as FieldType[]

export const VALIDATION_SCHEMA = (_FIELDS => {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const validationObj: Record<string, any | undefined> = {}
	_FIELDS.forEach(
		// eslint-disable-next-line no-return-assign
		f =>
			(validationObj[f.fieldId] =
				f.type !== 'checkbox'
					? Yup.string()
							.trim()
							// .min(3, 'Too short')
							.required('Required')
					: Yup.object().test(
							'at-least-one-true',
							'Must select at least one',
							value => Object.values(value).some(v => v === true),
					  )),
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
				f.type !== 'checkbox' ? '' : generateBlankCheckbox(f.options)),
	)
	return initData
})(FIELDS)
