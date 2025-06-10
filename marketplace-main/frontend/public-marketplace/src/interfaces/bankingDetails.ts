export interface IBankingDetails {
	id: number
	created_at: Date
	modified_at: Date
	bank_name: string
	street_address: string
	city: string
	state: string
	province: string
	postal_code: string
	account_name: string
	account_number: string
	routing_number: string
	swift_code: string
	iban_number: string
	credit_account_name: string
	credit_account_number: string
	reference: string
	have_intermediary_bank: boolean
	intermediary_bank_name: string
	intermediary_bank_swift_code: string
	user: number
	bank_country: number
	currency: number
}
