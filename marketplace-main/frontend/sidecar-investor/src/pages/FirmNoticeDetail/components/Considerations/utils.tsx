import {IOwnershipFundInvestor} from "../../../../interfaces/investorOwnership";
import React from "react";
import styled from "styled-components";
import {INVESTOR_URL_PREFIX} from "../../../../constants/routes";
import {FundDetailLink, FundInvestmentLinks} from "../../../../presentational/Links";

import {IInvestmentStat} from "../../../../interfaces/PageConfigs/investmentDashboard";

import {get, isEmpty} from "lodash";
import {INotice} from "../../../../interfaces/notices";
import {getDisplayValue} from "../../../Notices/components/utils/RenderTablesDynamically";
import {TOTAL_ROW_ID} from "../../../Notices/components/Considerations/computations";
import classNames from "classnames";


const LogoImg = styled.img`
    width: 80px;
    margin-right: 10px;
`

const FirstColSpan = styled.span`
    display: inline-flex;
`

const TableLogo = styled.img`
    margin-right: 10px;
    width: 80px;
    height: 100%;
    max-height: 46px;
`

const calculateMinWidth=(_minWidth=130,isSortable=false,tooltip:any)=>{
  let minWidth=_minWidth
  if(isSortable) minWidth+=13
  if(!isEmpty(tooltip)) minWidth+=22
  return minWidth
}

export const getDynamicNoticeColumns = (
  showUSD: boolean,
  columns: IInvestmentStat[],
  companyPrefix: string
) => {


  const filteredColumns: any[] = [
    // {
    //   title: "",
    //   dataKey: "company_logo",
    //   flexGrow: 1.5,
    //   minWidth: 130,
    //   Cell: (row: IOwnershipFundInvestor) => {
    //     if (row.isSubRow) return <></>
    //     const isTotalRow = row.id === TOTAL_ROW_ID;
    //     const logo = row.fund?.logo ? row.fund.logo : row.company_logo;
    //     return <>
    //       {isTotalRow ? <div className={'bold'}>Total</div> : <FirstColSpan>
    //         {logo && <TableLogo src={logo} alt=""/>}
    //       </FirstColSpan>}
    //     </>
    //   },
    // },
  ]
  columns.forEach((investmentDetailCol: IInvestmentStat) => {
    filteredColumns.push({
      title: investmentDetailCol.heading,
      dataKey: investmentDetailCol.field_name,
      flexGrow: 1.5,
      minWidth: calculateMinWidth(investmentDetailCol.minWidth,investmentDetailCol.is_sortable,investmentDetailCol.tooltip),
      isSortable: investmentDetailCol.is_sortable,
      tooltip: investmentDetailCol.tooltip,
      Cell: (row: INotice) => {
        const isTotalRow = row.id === TOTAL_ROW_ID;
        if (investmentDetailCol.link_to_investment_detail) {
          if (row.isSubRow) return <>{row.fund_name}</>

          if (isTotalRow) return <div className={'bold'}>Total</div>
          return <FundDetailLink
            to={`${companyPrefix}/${INVESTOR_URL_PREFIX}/firms/${row.firm.id}/detail`}>{get(row, investmentDetailCol.field_name)}
          </FundDetailLink>
        }
        const currencySymbol = showUSD ? '$' : row.currency.symbol;
        const currencyRate = showUSD ? row.conversion_rate : 1;
        return <div className={classNames({'bold': isTotalRow})}>{getDisplayValue(
          row,
          investmentDetailCol,
          currencySymbol,
          currencyRate
        )}</div>
      }
    })
  })
  return filteredColumns;
}
