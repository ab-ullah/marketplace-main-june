import {ICurrency} from "../../interfaces/currency";


export interface IOrder {
  requested_allocation: number;
  requested_leverage: number;
  approved_allocation: number | null;
  status_name: string;
  id: number;
}

export interface IOpportunity {
  id: number;
  name: string;
  slug: string;
  type: string;
  external_id: string;
  company_logo: string;
  fund_type: number;
  fund_type_name: string;
  risk_profile: string;
  region: string;
  investment_period: string;
  fund_page: string;
  demand: number;
  unsold: number;
  sold: number;
  total: number;
  existing_investors: number;
  company: number;
  deadline: string;
  interest_rate: number | null;
  leverage_ratio: number | null;
  currency: ICurrency;
  application_link: string;
}
