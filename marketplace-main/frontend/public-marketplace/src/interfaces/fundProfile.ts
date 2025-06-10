import {ICurrency} from "./currency";

export interface IFundProfile {
  investment_region: string;
  target_size: string;
  target_investment_markets: string;
  target_return: string;
  employee_investment_period: string;
  intro: string;
  description: string;
  allocation_request_dates: string;
  eligibility_criteria: any[];
  eligibility_criteria_headings: string[]
}

export interface IFundWithProfile {
  id: number;
  name: string;
  symbol: string;
  slug: string;
  fund_type: number;
  region_country: number;
  risk_profile: string;
  fund_type_name: string;
  business_line_name: string;
  application_period_start_date: string;
  application_period_end_date: string;
  confirmation_date: string;
  anticipated_first_call_date: string;
  demand: number;
  unsold: number;
  sold: number;
  total: number;
  existing_investors: number;
  minimum_investment: number;
  company: number;
  user_leverage: string;
  indicated_interest: boolean;
  fund_profile: IFundProfile;
  currency: ICurrency;
  // documents: INotificationDocument[];
  external_id?: string;
}