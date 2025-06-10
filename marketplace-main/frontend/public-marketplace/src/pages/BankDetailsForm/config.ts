/* eslint-disable @typescript-eslint/no-explicit-any */
import * as Yup from 'yup'

export const initValues = {
	bank_country: null,
	bank_name: '',
	street_address: '',
	city: '',
	state: '',
	province: '',
	postal_code: '',
	account_name: '',
	account_number: '',
	routing_number: '',
	swift_code: '',
	iban_number: '',
	credit_account_name: '',
	credit_account_number: '',
	currency: null,
	reference: '',
	have_intermediary_bank: false,
	intermediary_bank_name: '',
	intermediary_bank_swift_code: '',
	enhancements: '',
}

export const getSchema = (USBankId: number) =>
	Yup.object({
		bank_country: Yup.object()
			.shape({
				label: Yup.string().required('Required'),
				value: Yup.string().required('Required'),
			})
			.required('Required')
			.nullable(),
		bank_name: Yup.string().required('Required'),
		street_address: Yup.string().required('Required'),
		city: Yup.string().required('Required'),
		state: Yup.string().when(['bank_country'], {
			is: (bank_country: any) =>
				bank_country && `${bank_country.value}` === `${USBankId}`,
			then: Yup.string().required('Required'),
		}),
		province: Yup.string().optional().nullable(),
		postal_code: Yup.string().required('Required'),
		account_name: Yup.string().required('Required'),
		account_number: Yup.string().required('Required'),
		routing_number: Yup.string().when(['bank_country'], {
			is: (bank_country: any) =>
				bank_country && `${bank_country.value}` === `${USBankId}`,
			then: Yup.string()
				.required('Required')
				.test(
					'Digits only',
					'Routing numbers should have 9 digits',
					value => {
						if (!value) return false
						return /^\d{9}$/.test(value)
					},
				),
		}),
		swift_code: Yup.string().when(['bank_country'], {
			is: (bank_country: any) =>
				bank_country && `${bank_country.value}` !== `${USBankId}`,
			then: Yup.string().required('Required'),
		}),
		iban_number: Yup.string().when(['bank_country'], {
			is: (bank_country: any) =>
				bank_country && `${bank_country.value}` !== `${USBankId}`,
			then: Yup.string().required('Required'),
		}),
		credit_account_name: Yup.string().optional(),
		credit_account_number: Yup.string().optional(),
		currency: Yup.object()
			.shape({
				label: Yup.string().required('Required'),
				value: Yup.string().required('Required'),
			})
			.required('Required')
			.nullable(),
		reference: Yup.string().optional(),
		have_intermediary_bank: Yup.boolean(),
		intermediary_bank_name: Yup.string().when(['have_intermediary_bank'], {
			is: (have_intermediary_bank: any) => have_intermediary_bank,
			then: Yup.string().required('Required'),
		}),
		intermediary_bank_swift_code: Yup.string().when(
			['have_intermediary_bank'],
			{
				is: (have_intermediary_bank: any) => have_intermediary_bank,
				then: Yup.string().required('Required'),
			},
		),
	})
