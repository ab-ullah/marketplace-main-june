export interface ICriteriaFund {
  id: number;
  name: string;
  symbol: string;
  partner_id: string;
  investment_product_code: string;
  slug: string;
  fund_type_name: string;
  demand: number;
  unsold: number;
  sold: number;
  total: number;
  existing_investors: number;
  company: number;
  application_period_start_date: string;
  application_period_end_date: string;
  confirmation_date: string;
  anticipated_first_call_date: string;
}
