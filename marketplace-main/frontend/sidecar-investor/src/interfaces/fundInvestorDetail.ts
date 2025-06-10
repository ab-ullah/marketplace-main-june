import { IInvestmentStat } from "./PageConfigs/investmentDashboard";
import {ICurrency} from "./currency";

export interface IFundInvestorDetail {
  id: number;
  investor: number;
  fund: number;
  purchase_price: number;
  total_distributions: number;
  distributions_used_for_loan: number;
  distributions_used_for_interest: number,
  distributions_recallable: number,
  gross_distributions_recallable_to_date: number,
  distributions_to_employee: number,
  capital_distributions_since_inception: number;
  capital_distributions_since_last_nav: number;
  income_distributions_since_inception: number;
  income_distributions_since_last_nav: number;
  pending_distributions: number;
  leverage_used: number;
  order: number | null;
  current_net_equity: number;
  loan_balance_with_unpaid_interest: number;
  loan_balance: number;
  nav_share: number;
  remaining_equity: number;
  unrealized_gain: number; // This is deprecated DO NOT USE!
  leveraged_irr: number;
  un_leveraged_irr: number;
  investor_name: string;
  fund_name: string;
  fund_display_name: string | null;
  currency: ICurrency;
  years_invested: number;
  unpaid_interest: number;
  equity_remaining: number;
  initial_leverage_ratio: number;
  current_leverage_ratio: number;
  commitment_to_date: number;
  uncalled_amount: number;
  current_interest_rate: number;
  interest_accrued: number;
  interest_paid: number;
  equity_commitment: number;
  equity_called: number;
  fund_ownership_percent: number;
  capital_calls_since_last_nav: number;
  distributions_calls_since_last_nav: number;
  fund_nav_date: string;
  created_at: string;
  commitment_amount: number;
  loan_commitment: number;
  gross_share_of_investment_product: number;
  called_to_date: number;
  net_commitment_called_to_date: number;
  percent_of_account: number;
  invested_since: string;
  latest_transaction_date: string;
  fund_nav: number;
  loan_to_value: number;
  gain: number;
  loan_drawn: number;
  loan_repayment: number;
  has_data: boolean;
  is_legacy: boolean;
  offer_leverage: boolean;
  is_nav_disabled: boolean;
  total_gross_share_nav?: number;
  name?: string;
  currency_symbol?: string;
}

export interface INavBreakDownSection {
  field_name: string;
  heading: string;
  color: string;
  enabled: boolean;
}

export interface IOwnershipConfig {
  right_section_stats: INavBreakDownSection[];
  page_headline: string;
  chart_stats_heading: string;
  use_custom_chart_total?: boolean;
  tiles: IInvestmentStat[]
}

export interface IInvestorProfile {
  id: number;
  name: string;
}