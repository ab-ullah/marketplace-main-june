import {ICurrency} from "./currency";

export interface IBaseFund {
  id: number;
  name: string;
  display_name: string | null;
  slug: string;
  external_id: string;
  fund_type: number;
  fund_type_name: string;
  demand: number;
  unsold: number;
  sold: number;
  total: number;
  existing_investors: number;
  company: number;
  is_legacy: boolean;
  logo: string;
}

export interface IOwnershipFundInvestor {
  id: number;
  investor: number;
  purchase_price: number;
  total_distributions: number;
  profit_distributions: number;
  return_of_capital: number;
  pending_distributions: number;
  leverage_used: number;
  order: number | null;
  fund: IBaseFund
  current_net_equity: number;
  loan_commitment: number;
  loan_balance_with_unpaid_interest: number;
  nav_share: number;
  remaining_equity: number;
  unrealized_gain: number;
  gain: number;
  leveraged_irr: number;
  un_leveraged_irr: number;
  unpaid_interest: number;
  remaining_loan: number;
  investor_name: string;
  latest_nav: string;
  currency: ICurrency;
  company_logo: string;
  isSubRow?: boolean
}

export interface IInvestmentComposition {
  [key: number]: IOwnershipFundInvestor[]
}

export interface IOwnershipOrder {
  requested_allocation: number;
  requested_leverage: number;
  investor: number;
  approved_allocation: number | null;
  used_role_leverage: number | null;
  status_name: string;
  status: number;
  id: number;
  ownership: string;
  can_edit: boolean;
  confirmation_date: string;
  fund_slug: string;
  fund_external_id: string;
  investor_name: string;
  currency: ICurrency;
}

export interface IFundSale {
  id: number;
  requested_sale: number;
  fund_name: string;
}

export interface IInvestorOwnership {
  invested_funds: IOwnershipFundInvestor[],
  investment_compositions: IInvestmentComposition,
  invested_orders: IOwnershipOrder[]
  investor_sales: IFundSale[],
  has_data: boolean,
  latest_currency_rate_date: string | null;
}

export interface INotificationDocument {
  document_id: string;
  title: string;
  name: string;
  extension: string;
}

export interface INotification {
  id: number;
  application: number | null;
  notification_type: string;
  document_date: string;
  due_date: string;
  created_at: string;
  fund_name: string;
  fund_external_id: string;
  investor_name: string;
  fund_symbol: string;
  documents: INotificationDocument[];
  is_read: boolean;
  details?: string | null;
}
