import {ICurrency} from "./currency";

export interface IFirm {
  id: number;
  name: string;
  slug: string;
}

export interface INotice {
  id: number;
  fund_name: string;
  firm_name: string;
  notice_date: string;
  quarter: number;
  capital_called: number;
  distributed: number;
  other_activity: number;
  net_transaction: number;
  non_taxable: number;
  ltcg: number;
  stcg: number;
  ordinary: number;
  dividend: number;
  character_unknown: number;
  conversion_rate: number;
  isSubRow: boolean;
  firm: IFirm;
  currency: ICurrency;
}

export interface ITransactionComposition {
  [key: number]: INotice[]
}

export interface INoticeResponse {
  transactions: INotice[],
  transactions_compositions: ITransactionComposition
}