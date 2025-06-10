import {IOwnershipFundInvestor, IInvestmentComposition} from "../../../../interfaces/investorOwnership";
import {IFundInvestorDetail, INavBreakDownSection} from "../../../../interfaces/fundInvestorDetail";
import {each, get, round} from "lodash";
import { getPercentValue } from "../../../../utils/dollarValue";

const SKIP_KEYS = ['id', 'fund', 'currency', 'currency_symbol', 'ownership', 'order', 'investor', 'latest_nav', 'currency_code', 'latest_transaction_date', 'fair_market_value_date']
const PERCENTAGE_KEYS = ['leveraged_irr', 'un_leveraged_irr']

export const TOTAL_ROW_ID = 0

interface PieData {
  name: string;
  value: number
}

export const roundAndAdd = (...args: number[]) => {
  var accumulator = 0;

  for (const arg of args) {
    if(arg) {
      accumulator += round(arg, 0);
    }
  }
  return accumulator;
}

export const createTotalRow = (investedFunds: IOwnershipFundInvestor[], isLegacy: boolean, selectedCurrency: string | null) => {
  const accumulatedRow = {id: TOTAL_ROW_ID, currency: '', 'currency_symbol': '$', fund: {'name': 'Total', 'is_legacy': isLegacy}, ownership: ''} as any;
  investedFunds.forEach((fund) => {
    if(fund.fund.is_legacy === isLegacy) {
      for (const [key, value] of Object.entries(fund)) {
        if (SKIP_KEYS.indexOf(key) > -1) continue
        let accumulateValue = round(value, 0)
        if (PERCENTAGE_KEYS.indexOf(key) === -1) {
          if(selectedCurrency && get(fund, `${selectedCurrency}`)) {
            const conversionRate = get(fund, `${selectedCurrency}.conversion_rate`);
            accumulateValue *=  conversionRate > 0 ? conversionRate : 1;
            accumulatedRow['currency_symbol'] = get(fund, `${selectedCurrency}.symbol`);
          }
          else {
            accumulateValue *= fund.currency.rate;
          }
        }

        if (!(key in accumulatedRow)) accumulatedRow[key] = accumulateValue
        else accumulatedRow[key] += accumulateValue
      }
    }
  })
  const {equity_called, gain, unpaid_interest, loan_balance} = accumulatedRow
  accumulatedRow['total_gross_share_nav'] = roundAndAdd(equity_called, gain, unpaid_interest, loan_balance);
  accumulatedRow['total_leveraged_unleveraged_irr'] = accumulatedRow.leveraged_irr ? `${getPercentValue(accumulatedRow.leveraged_irr)}/${getPercentValue(accumulatedRow.un_leveraged_irr)}` : 'Coming Soon';
  return accumulatedRow;
}

export const getNavPieChartData = (totalRow: IFundInvestorDetail, sectionLabels: INavBreakDownSection[]) => {
  const pieChartData = [] as PieData[];
  each(sectionLabels, (section: INavBreakDownSection) => {
    const value = totalRow[section.field_name as keyof IFundInvestorDetail]
    value && pieChartData.push({name: section.heading, value: Number(totalRow[section.field_name as keyof IFundInvestorDetail])})
  })

  return pieChartData;
}

export const getGainBarChartData = (investedFunds: IOwnershipFundInvestor[]) => {
  const barChartData = {
    realizedGain: 0,
    unrealizedGain: 0
  } as any;
  investedFunds.forEach((fund) => {
    barChartData.unrealizedGain += fund.unrealized_gain
    barChartData.realizedGain += fund.unrealized_gain * 0.75
  })
  return [
    {name: 'Total Realized Gain', value: barChartData.realizedGain},
    {name: 'Total Unrealized Gain', value: barChartData.unrealizedGain},
  ];
}

export const getInvestmentCompositions = (investmentCompositions: IInvestmentComposition) => {
  const activeInvestedCompositions: { [key: string]: any } = {}, legacyInvestmentCompositions: { [key: string]: any } = {};

  for (const [key, value] of Object.entries(investmentCompositions)) {
    value[0].fund.is_legacy 
      ? legacyInvestmentCompositions[key] = value
      : activeInvestedCompositions[key] = value;
  }
  return {activeInvestedCompositions, legacyInvestmentCompositions}
}

export const getInvestedFunds = (investedFunds: IOwnershipFundInvestor[]) => {
  const activeInvestedFunds: any = [], legacyInvestedFunds: any = [];
  
  investedFunds.forEach((fund) => {
    fund.fund.is_legacy 
      ? legacyInvestedFunds.push(fund)
      : activeInvestedFunds.push(fund)
  });

  return {activeInvestedFunds, legacyInvestedFunds}
}