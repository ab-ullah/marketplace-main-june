import { ICurrency } from 'interfaces/common/currency'
import { OptionTypeBase } from 'react-select'

export interface IOrder {
	requested_allocation: number
	requested_leverage: number
	approved_allocation: number | null
	status_name: string
	id: number
}

export interface IFundTag {
	id: number
	name: string
	slug: string
}

export interface IFundManager {
	bio: string
	company: number
	designation: string
	full_name: string
	id: number
	profile_image: string
	uuid: string
}

export interface IOpportunity {
	id: number
	name: string
	slug: string
	type: string
	external_id: string
	logo: string
	company_logo: string
	investment_description: string | null
	fund_type: number
	fund_type_name: string
	risk_profile: string
	region: string
	investment_period: string
	fund_page: string
	demand: number
	unsold: number
	sold: number
	total: number
	existing_investors: number
	company: number
	deadline: string
	interest_rate: number | null
	leverage_ratio: number | null
	currency: ICurrency
	application_link: string
	focus_region: string
	minimum_investment: number
	close_applications: boolean
	accept_applications: boolean
	tags: [IFundTag]
	stats_json: OptionTypeBase[]
	managers: IFundManager[]
	short_description: string
	long_description: string
	banner_image: string
	has_active_application?: boolean
}
