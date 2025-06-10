/* eslint-disable @typescript-eslint/no-explicit-any */
import * as Yup from 'yup'
import { Option } from '../../interfaces/workflows'
import { KYC_ENTITY_INVESTORS } from '../KnowYourCustomer/constants'

export const DEFAULT_NON_SELECTABLE_OPTION: Option = {
	label: '-',
	value: '',
}

export const ENITY_CERTIFICATION_DOCUMENT_ID = 'Global-Entity-SC'
export const INDIVIDUAL_CERTIFICATION_DOCUMENT_ID = 'Global-Individual-SC'

export const FORM_FIELDS_OPTIONS = [
	{ value: 'Yes', label: 'I am/We are' },
	{ value: 'No', label: 'I am/We are not' },
]

export const VALIDATION_SCHEMA = Yup.object({
	us_holder: Yup.string().required('Required').nullable(),
	is_tax_exempt: Yup.string().when('us_holder', {
		is: 'Yes',
		then: Yup.string().required('Required').nullable(),
		otherwise: Yup.string().notRequired().nullable(),
	}),
	is_entity: Yup.string().when(['us_holder', 'kyc_investor_type_name'], {
		is: (...fields: any) => {
			const [USHolder, investerType] = fields
			return (
				USHolder === 'Yes' &&
				KYC_ENTITY_INVESTORS.includes(investerType)
			)
		},
		then: Yup.string().required('Required').nullable(),
		otherwise: Yup.string().notRequired().nullable(),
	}),
	is_tax_exempt_in_country: Yup.string().required('Required').nullable(),
	tin_or_ssn: Yup.string().required('Required').nullable(),
	tax_year_end: Yup.date().required('Required').nullable(),
})

export const Tax_FORM_STEPS = {
	COUNTRY_SELECTION: 0,
	TAX_DETAILS: 1,
	INVESTOR_FORMS: 2,
	CERTIFICATION_FORMS: 3,
	DOCUMENTS: 4,
}
