import {round} from "lodash";
import {INotice} from "../../../../interfaces/notices";

const SKIP_KEYS = ['id', 'fund_name', 'firm_name', 'notice_date', 'conversion_rate', 'quarter', 'currency_code', 'fair_market_value_date']

export const TOTAL_ROW_ID = 0



export const createTotalRow = (investedFunds: INotice[]) => {
  const accumulatedRow = {id: TOTAL_ROW_ID, currency: '', fund: {'name': 'Total'}, ownership: ''} as any;
  investedFunds.forEach((fund) => {
    for (const [key, value] of Object.entries(fund)) {
      console.log(key, value)
      if (SKIP_KEYS.indexOf(key) > -1) continue
      let accumulateValue = 0;
      if (key.endsWith('_usd')){
        accumulateValue = round(value, 0)
      }
      else {
        accumulateValue = round(value, 0) * fund.conversion_rate;
      }
      if (!(key in accumulatedRow)) accumulatedRow[key] = accumulateValue
      else accumulatedRow[key] += accumulateValue
    }

  })
  return accumulatedRow;
}

