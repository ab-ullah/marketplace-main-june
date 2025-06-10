import React from "react";
import get from "lodash/get";
import FormattedCurrency from "./FormattedCurrency";
import {TOTAL_ROW_ID} from "../Considerations/computations";
import {DASH_DEFAULT_VALUE, NA_DEFAULT_VALUE} from "../../../../constants/defaultValues";
import {getPercentValue} from "../../../../utils/dollarValue";
import {standardizeDate} from "../../../../utils/dateFormatting";
import {IInvestmentStat, IInvestmentTable} from "../../../../interfaces/PageConfigs/investmentDashboard";


export const filterColumns = (columns: IInvestmentStat[], isLegacyFund: boolean, hideLeverageColumns?: boolean) => {
  return columns.filter((row) => {
    if (!row.enabled) return false;
    if (hideLeverageColumns && row.isLeverageField) {
      return false;
    }
    return !(isLegacyFund && row.hideForLegacy);

  })
}


export const filterTables = (tables: IInvestmentTable[], data: any, isLegacy: boolean) => {
  return tables.filter((table) => {
    if (!table.enabled) return false;
    if (table.hideForLegacy && isLegacy) return false
    return !(table.hide_if_field && get(data, table.hide_if_field));
  })
}


export const getDisplayValue = (
  data: any,
  column: IInvestmentStat,
  currencySymbol?: string,
  currencyRate?: number,
  fundNameCell?: any,
) => {
  const value = get(data, column.field_name);
  if (column.depends_on_field && column.depended_field_default) {
    if (!get(data, column.depends_on_field))
      return <>{column.depended_field_default}</>
  }
  if (column.link_to_investment_detail) return <>{fundNameCell}</>
  if (!value && column.default_value) return <>{column.default_value}</>

  if (data.id !== TOTAL_ROW_ID && !get(data, 'fund.offer_leverage') && column.isLeverageField) {
    return DASH_DEFAULT_VALUE
  }

  switch (column.field_type) {
    case 'string':
      return <>{value}</>
    case 'currency':
      const isUsdField = column.field_name.endsWith('_usd')
      return <FormattedCurrency
        value={value}
        symbol={isUsdField ? '$' : currencySymbol}
        rate={isUsdField ? 1 : currencyRate}
        replaceZeroWith={DASH_DEFAULT_VALUE}
      />
    case 'percentage':
      return <>{
        getPercentValue(value, DASH_DEFAULT_VALUE, DASH_DEFAULT_VALUE)}
      </>
    case 'date':
      return <>{standardizeDate(value)}</>
    default:
      return <>{value}</>
  }
}

export const getTableDataRow = (
  columns: IInvestmentStat[],
  isLegacyFund: boolean,
  data: any,
  currencySymbol: string,
  currencyRate: number,
  fundNameCell?: any
) => {
  const filteredData = filterColumns(columns, isLegacyFund)
  return filteredData.map((investmentDetailCol: IInvestmentStat) => {
    return getDisplayValue(
      data,
      investmentDetailCol,
      currencySymbol,
      currencyRate,
      fundNameCell
    )
  })
}

export const VALUATION_TABLE_ID = 'valuation'