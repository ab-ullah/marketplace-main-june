export interface IResponseBlock {
  eligibility_criteria_id: number;
  block_id: number;
  response_json: any;
}

export interface IInvestmentAmount {
  final_amount_details?: any;
  amount: number;
  leverage_ratio: number;
  investment_record_id: number | null;
  leverage_option_description: string;
  cashless_commitment?: number
  max_leverage_percentage?: number | null
}

export interface IInvestmentDetail {
  total_investment: number;
  final_entity: number;
  final_leverage_ratio: string;
  final_leverage_amount: number;
  leverage_option_description: string;
  final_leverage_option_description: string;
}

export interface IEligibilityCriteriaResponse {
  user_block_responses: IResponseBlock[];
  id: number;
  last_position: number;
  offer_leverage: boolean;
  max_leverage: number;
  min_investment: number;
  investment_amount: IInvestmentAmount
}