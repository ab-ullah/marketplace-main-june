export interface IToolTipInfo {
  heading: string;
  description: string;
}


export interface IInvestmentStat {
  id: number;
  heading: string;
  field_name: string;
  field_type: string;
  enabled: boolean;
  isLeverageField?: boolean;
  tooltip?: IToolTipInfo
  hideForLegacy?: boolean;
  default_value?: any;
  preserve_zero?: boolean;
  link_to_investment_detail?: boolean;
  depends_on_field?: string;
  depended_field_default?: string;
  tile_type?: string;
  is_sortable?: boolean;
  minWidth?: number,
  sub_colums?: any[]
}


export interface IInvestmentTable {
  id: number | string;
  heading: string;
  rows: IInvestmentStat[];
  enabled: boolean;
  hide_if_field?: string;
  hideForLegacy?: boolean;
  nested_key?: string;
}
