import React, {FunctionComponent} from 'react';


import {SideCarStyledTable} from "../../../../presentational/StyledTableContainer";
import Table from "react-bootstrap/Table";
import GlossaryToolTip from "../../../../components/GlossaryToolTip";
import {IInvestmentStat} from "../../../../interfaces/PageConfigs/investmentDashboard";
import {filterColumns, getDisplayValue} from "../../../../utils/RenderTablesDynamically";
import {IFundInvestorDetail} from "../../../../interfaces/fundInvestorDetail";
import { map } from 'lodash';


interface InfoObject {
  heading: string;
  value: string | number | React.ReactNode;
  glossaryKey?: string;
  omitDisplay?: boolean;
}

interface InfoTableProps {
  infoRows: IFundInvestorDetail[];
  colWidth?: string;
  columnConfigs: IInvestmentStat[]
  currencySymbol: string;
  currencyRate: number;
}


const InfoTable: FunctionComponent<InfoTableProps> = ({infoRows, colWidth, columnConfigs, currencySymbol, currencyRate}) => {
  const isLegacy = infoRows[0]?.is_legacy;
  return <SideCarStyledTable>
    <Table responsive>
      <thead>
      <tr>
        {filterColumns(columnConfigs, isLegacy).map((columnConfig) => {
          return (
            <th style={{width: colWidth ? colWidth : "auto"}}>
              {columnConfig.tooltip ? <GlossaryToolTip
                header={columnConfig.heading}
                heading={columnConfig.tooltip.heading}
                description={columnConfig.tooltip.description}/> : columnConfig.heading}
            </th>
          )
        })}
      </tr>
      </thead>
      <tbody>
        {map(infoRows,row=>(
      <tr>
        {filterColumns(columnConfigs, isLegacy).map((columnConfig) => <td>{getDisplayValue(row, columnConfig, currencySymbol, currencyRate)}</td>)}
      </tr>
      ))}
      </tbody>
    </Table>
  </SideCarStyledTable>
};

export default InfoTable;
