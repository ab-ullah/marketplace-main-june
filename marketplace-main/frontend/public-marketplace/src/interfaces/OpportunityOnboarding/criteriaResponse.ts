export interface IResponseBlock {
	eligibility_criteria_id: number
	block_id: number
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	response_json: any
}

export interface IInvestmentAmount {
	amount: number
	leverage_ratio: number
	investment_record_id: number | null
}

export interface IInvestmentDetail {
	total_investment: number
	final_entity: number
	final_leverage_ratio: string
	final_leverage_amount: number
}

export interface IEligibilityCriteriaResponse {
	user_block_responses: IResponseBlock[]
	id: number
	last_position: number
	offer_leverage: boolean
	max_leverage: number
	min_investment: number
	investment_amount: IInvestmentAmount
}
