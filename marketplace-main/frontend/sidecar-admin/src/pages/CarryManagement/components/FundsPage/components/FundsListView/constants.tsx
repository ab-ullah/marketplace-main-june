import {formatCurrencyWithTwoDecimals} from "../../../../../../utils/currency";
import {ICurrency} from "../../../../../../interfaces/currency";
import { carryTooltip } from "../../../../../../interfaces/company";
import { standardizeDate } from "../../../../../../utils/dateFormatting";
import TooltipWrapper from "../../../../../../components/Tooltip";
import get from "lodash/get";
import truncate from "lodash/truncate";
import { isEqual } from "lodash";

export enum FundStatus {
  ACTIVE  = 'active',
  DRAFT   = 'draft',
  REVIEW  = 'review',
  INACTIVE  = 'inactive'
}

export interface ICarryFund {
  name: string
  fund_currency: ICurrency | number | null,
  target_fund_size: number
  fund_id: string
  participants: number
  fund_size: number
  estimated_value: number
  estimated_value_date: string
  fair_market_value: number
  fair_market_value_date: string
  total_distributions: number
  deal_distributions: number
  carry_plan_name?: string
  estimated_value_from_deal: boolean
  fair_market_value_from_deal: boolean
}

// export interface ICarryFundPayload {
//   id: string,
//   name: string,
//   fund_currency: ICurrency | number,
//   target_fund_size: number,
//   estimated_value: number,
//   estimated_value_date: string | null,
//   fair_market_value: number,
//   fair_market_value_date: string | null
// }

export const getTooltip = (key: string, tooltips: carryTooltip[]) => {
  return tooltips.find((tooltip) => tooltip.key === key);
}


export const getColumns = (selectFundToView: (arg1: string, arg2: any) => void, tooltips: carryTooltip[]) => [
  {
    title: "Name of Fund",
    fixed: "left",
    dataKey: "name",
    minWidth: 200,
    flexGrow: 1,
    Cell: (row: ICarryFund) => (
      <TooltipWrapper enable={!isEqual(truncate(get(row,'name')),get(row,'name'))} text={get(row,'name')}>
      <span
        style={{
          cursor: "pointer",
          fontWeight: 900,
          textDecoration: "underline",
        }}
        onClick={() => selectFundToView(row.fund_id, row)}
      >
       {truncate(get(row,'name'))}
      </span>
      </TooltipWrapper>
    ),
  },
  {
    title: "Carry Plan",
    dataKey: "carry_plan_name",
    minWidth: 200,
    flexGrow: 1,
    Cell: (row: ICarryFund) => (
      <span 
      >
        {row.carry_plan_name}
      </span>
    ),
  },
  {
    title: "Target Fund Size",
    dataKey: "target_fund_size",
    minWidth: 170,
    flexGrow: 1.25,
    Cell: (row: ICarryFund) => (
      <span
        style={{
        textAlign:"right"
      }}>
          {formatCurrencyWithTwoDecimals(row.target_fund_size)}</span>
    ),
  },
  {
    title: "Estimated Carry Value",
    dataKey: "estimated_value",
    minWidth: 170,
    flexGrow: 1.25,
    tooltip: getTooltip('estimated_value', tooltips),
    Cell: (row: ICarryFund) => (
      <span>
        {formatCurrencyWithTwoDecimals(row.estimated_value)}
        {/* {getTooltip('estimated_value', tooltips)?.tooltip.description} */}
        </span>
    ),
  },
  {
    title: "Estimated Carry Value As Of",
    dataKey: "estimated_value_date",
    minWidth: 170,
    flexGrow: 1.25,
    Cell: (row: ICarryFund) => (
      <span>
        {standardizeDate(row.estimated_value_date)}
        </span>
    ),
  },
  {
    title: "Fair Market Value",
    dataKey: "fair_market_value",
    tooltip: getTooltip('fair_market_value', tooltips),
    minWidth: 150,
    flexGrow: 1,
    Cell: (row: ICarryFund) => {
      return (
          <div style={{
            textAlign:"right"
          }}>{formatCurrencyWithTwoDecimals(row.fair_market_value)}</div>
      )
    },
  },
  {
    title: "Fair Market Value As Of",
    dataKey: "fair_market_value_date",
    minWidth: 170,
    flexGrow: 1.25,
    Cell: (row: ICarryFund) => (
      <span>
        {standardizeDate(row.fair_market_value_date)}
        </span>
    ),
  },
  {
    title: "Distributions",
    dataKey: "total_distributions",
    minWidth: 150,
    flexGrow: .8,
    Cell: (row: ICarryFund) => <div >{formatCurrencyWithTwoDecimals(row.total_distributions)}</div>,
  },
];
