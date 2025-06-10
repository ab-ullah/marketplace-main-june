import _ from "lodash"
import {IFundInvestorDetail} from "../interfaces/fundInvestorDetail";

export const getDollarValue = (value: number) => {
  if (_.isNil(value)) return ''
  return `$${value}`
}

export const getPercentValue = (value: number | null) => {
  if (_.isNil(value)) return ''
  let displayValue: string = ''

  if (value > 0) {
    displayValue = (100.0 * value).toFixed(2)
  } else {
    displayValue = value.toFixed(0)
  }

  return `${displayValue}%`
}

export const getCapitalCallAmount = (investor: IFundInvestorDetail, callAmount: number) => {
  // TODO: get the real fund sold value, also this is better done serverside, I think
  let fundSold = 20_000_000
  // capital_call_amount * (ifo.approved_allocation / ff.demand) * (1 - (ifo.requested_leverage / ifo.approved_allocation))
  let amount = callAmount * (investor.purchase_price / fundSold) * (1 - (investor.initial_leverage_ratio / investor.purchase_price))
  return Math.ceil(amount * 100) / 100
}