import {ICurrency} from "./currency";


export interface IFundDetail {
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
  company: number;
  user_leverage: string,
  currency: ICurrency;
  enable_internal_tax_flow: boolean;
  wait_for_approval: boolean;
  skip_tax: boolean;
}