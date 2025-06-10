import {IOwnershipFundInvestor} from "../../../../interfaces/investorOwnership";
import {TOTAL_ROW_ID} from "./computations";
import React from "react";
import styled from "styled-components";
import {INVESTOR_URL_PREFIX} from "../../../../constants/routes";
import {FundDetailLink, FundInvestmentLinks} from "../../../../presentational/Links";

import {IInvestmentStat} from "../../../../interfaces/PageConfigs/investmentDashboard";

import {get, isEmpty} from "lodash";
import {INotice} from "../../../../interfaces/notices";
import {getDisplayValue} from "../utils/RenderTablesDynamically";
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
    {
      title: "",
      dataKey: "tree",
      width: 30,
      Cell: () => {
        return <></>;
      },
    },
  ];
  
  columns.forEach((investmentDetailCol: IInvestmentStat) => {
    filteredColumns.push({
      title: investmentDetailCol.heading,
      dataKey: investmentDetailCol.field_name,
      flexGrow: ["quarter", "currency_code", "non_taxable", "dividend", "total_taxable"].includes(investmentDetailCol.field_name)  ? 0 : 1,
      minWidth: calculateMinWidth(["notice_date"].includes(investmentDetailCol.field_name)? 110: investmentDetailCol.minWidth,investmentDetailCol.is_sortable,investmentDetailCol.tooltip),
      isSortable: investmentDetailCol.is_sortable,
      tooltip: investmentDetailCol.tooltip,
      Cell: (row: INotice) => {
        if (investmentDetailCol.link_to_investment_detail) {
          if (row.isSubRow) return <>{row.fund_name}</>
          const isTotalRow = row.id === TOTAL_ROW_ID;
          if (isTotalRow) return <div className={'bold'}>Total</div>
          return <FundDetailLink
            to={`${companyPrefix}/${INVESTOR_URL_PREFIX}/firms/${row.firm.id}/detail`}>
            <div className={'bold'}>
              {get(row, investmentDetailCol.field_name)}
            </div>
          </FundDetailLink>
        }
        if (['notice_date', 'quarter', 'currency_code'].indexOf(investmentDetailCol.field_name) > -1 && !row.isSubRow) {
          return <></>
        }
        const currencySymbol = showUSD ? '$' : row.currency.symbol;
        const currencyRate = showUSD ? row.conversion_rate : 1;
        const isBold = !row.isSubRow;

        return <div className={classNames({'bold': isBold})}>{getDisplayValue(
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

export const mergeChildRecords = (data: any) => {
  if(!data.length) return [];
  let mergedRecords: any[] = [];
  data.forEach((record: any) => {
    mergedRecords = [
      ...mergedRecords,
      ...record?.children ?? []
    ]
  });
  return mergedRecords;
}
