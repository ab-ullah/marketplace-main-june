import {ICurrency} from "./currency";

export interface IActiveFund{
  id: number;
  name: string;
  type: string;
  employees_count: number;
  total_committed: number;
  nav_share: number;
  commitment_to_date: number;
  leverage_used: number;
  interest_accrued: number;
  unrealized_gain: number;
  total_distributions: number;
  close_date: string;
  total_available: number;
  sold: number;
  currency: ICurrency;
}

export interface IGraphData {
  name: string;
  value: number;
}

export interface IFundTask {
  id: number;
  name: string;
  slug: string;
  external_id: string;
  deadline: string | null;
  task_date: string | null;
}

export interface IAdminStats {
  active_funds: IActiveFund[],
  total_row: IActiveFund,
  fund_raising: IActiveFund[],
  investment_by_role: IGraphData[],
  fund_tasks: IFundTask[]
}