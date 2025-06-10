import {IBaseFund} from "../pages/Funds/interfaces";
import {ICurrency} from "./currency";

export interface IPortfolioCurrency {
  conversion_rate: number;
  currency: string;
  symbol: string;
}

export interface IOwnershipFundInvestor {
  id: number;
  investor: number;
  purchase_price: number;
  total_distributions: number;
  pending_distributions: number;
  leverage_used: number;
  order: number | null;
  fund: IBaseFund
  current_net_equity: number;
  loan_balance_with_unpaid_interest: number;
  nav_share: number;
  remaining_equity: number;
  unrealized_gain: number;
  leveraged_irr: number;
  un_leveraged_irr: number;
  unpaid_interest: number;
  remaining_loan: number;
  investor_name: string;
  currency: ICurrency;
  company_currency: IPortfolioCurrency | null;
  investor_investment_currency: IPortfolioCurrency | null;
  investor_currency: IPortfolioCurrency | null;
  fund_currency: IPortfolioCurrency | null;
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
  investor_sales: IFundSale[]
}
