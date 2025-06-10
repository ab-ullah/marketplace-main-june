import {ICompanyUser} from "./userInterfaces";
import {IFundInvestorDetail} from "./fundInvestorDetail";
import {IOwnershipOrder} from "./investorOwnership";
import {ICurrency} from "./currency";


export interface IOrder {
  requested_allocation: number;
  requested_leverage: number;
  approved_allocation: number | null;
  status_name: string;
  status: number;
  id: number;
  ordered_by_name: string;
}

export interface IRoleOption {
  value: string;
  label: string;
  multiplier: number;
}

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
  fund_investors: IFundInvestorDetail[];
  fund_orders: IOrder[],
  leverage_options: IRoleOption[],
  user_leverage: string,
  requested_allocations: IOwnershipOrder[] | null;
  currency: ICurrency;
  enable_internal_tax_flow: boolean;
  skip_tax: boolean;
  wait_for_approval: boolean;
}

export interface IFundBaseInfo {
  id: number;
  name: string;
  slug: string;
  is_published: boolean;
}
