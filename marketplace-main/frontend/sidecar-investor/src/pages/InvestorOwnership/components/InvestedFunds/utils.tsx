import {IOwnershipFundInvestor} from "../../../../interfaces/investorOwnership";
import {TOTAL_ROW_ID} from "./computations";
import React from "react";
import styled from "styled-components";
import {INVESTOR_URL_PREFIX} from "../../../../constants/routes";
import {FundDetailLink} from "../../../../presentational/Links";
import {DASH_DEFAULT_VALUE, NA_DEFAULT_VALUE} from "../../../../constants/defaultValues";
import {IInvestmentStat} from "../../../../interfaces/PageConfigs/investmentDashboard";
import {filterColumns, getDisplayValue} from "../../../../utils/RenderTablesDynamically";
import { get } from "lodash";


const FirstColSpan = styled.span`
  display: inline-flex;
`

const TableLogo = styled.img`
  margin-right: 10px;
  width: 80px;
  height: 100%;
  max-height: 46px;
`

const getSubColumns = (subColumnsConfig: any[]) => {
  return subColumnsConfig.map((subCol) => ({
    title: subCol.heading,
    dataKey: subCol.field_name,
    flexGrow: 1.5,
    minWidth: 180,
    tooltip: subCol.tooltip,
    Cell: (row: IOwnershipFundInvestor) => {
      return "$250,000"
    },
  }))
}

export const getDynamicActiveInvestmentColumns = (
  showUSD: boolean,
  isLegacy: boolean,
  columns: IInvestmentStat[],
  companyPrefix: string,
  hideLogo: boolean = false,
  selectedCurrency: string | null
) => {

  const filteredData = filterColumns(columns, isLegacy)
  const filteredColumns: any[] = [
    {
      title: "",
      dataKey: "company_logo",
      flexGrow: 1.5,
      minWidth: 130,
      Cell: (row: IOwnershipFundInvestor) => {
        if (row.isSubRow) return <></>
        const isTotalRow = row.id === TOTAL_ROW_ID;
        if (hideLogo && !isTotalRow) return <></>
        const logo = row.fund?.logo ? row.fund.logo : row.company_logo;
        return <>
          {isTotalRow ? 'Total' : <FirstColSpan>
            {logo && <TableLogo src={logo} alt=""/>}
          </FirstColSpan>}
        </>
      },
    },
  ]
  filteredData.forEach((investmentDetailCol: IInvestmentStat) => {
    filteredColumns.push({
      title: investmentDetailCol.heading,
      dataKey: investmentDetailCol.field_name,
      flexGrow: 1.5,
      minWidth: 130,
      isSortable: investmentDetailCol.is_sortable,
      tooltip: investmentDetailCol.tooltip,
      subColumns: investmentDetailCol.sub_colums ? getSubColumns(investmentDetailCol.sub_colums) : null,
      Cell: (row: IOwnershipFundInvestor) => {
        const isTotalRow = row.id === TOTAL_ROW_ID;
        if (investmentDetailCol.link_to_investment_detail) {
          if (row.isSubRow) return <>{row.investor_name}</>
          if (isTotalRow) return <></>
          return <FundDetailLink
            to={`${companyPrefix}/${INVESTOR_URL_PREFIX}/funds/${row.fund.external_id}/detail`}>{get(row,investmentDetailCol.field_name)}
          </FundDetailLink>
        }
        let currencySymbol = showUSD ? '$' : row.currency.symbol;
        let currencyRate = showUSD ? row.currency.rate : 1;
        let currencyCode = showUSD ? 'USD' : row.currency.code;

        if(selectedCurrency)  {
          if (get(row, `${selectedCurrency}`)) {
          const conversionRate = get(row, `${selectedCurrency}.conversion_rate`);
          currencySymbol = get(row, `${selectedCurrency}.symbol`)
          currencyCode = get(row, `${selectedCurrency}.currency`)
          currencyRate = conversionRate > 0 ? conversionRate : 1
        }
          else  {
            currencySymbol = row.currency.symbol
            currencyCode = row.currency.code
            currencyRate = 1
          }
        }
        // this handles the currency symbol for the total row, Rate for the
        // total is already applied on values in total row
        if(get(row, 'currency_symbol')) {
          currencySymbol = get(row, 'currency_symbol');
        }

        if (!isTotalRow && investmentDetailCol.heading.toLowerCase() === 'currency') {
          return <>{currencyCode}</>
        }

        return getDisplayValue(
          row,
          investmentDetailCol,
          currencySymbol,
          currencyRate
        )
      }
    })
  })
  return filteredColumns;
}
