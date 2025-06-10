import {ICurrency} from "./currency";

export interface ICapitalCall {
  uuid: string;
  due_date: string;
  fund_name: string;
  call_amount: number;
  invested_amount: number;
  currency: ICurrency;
}