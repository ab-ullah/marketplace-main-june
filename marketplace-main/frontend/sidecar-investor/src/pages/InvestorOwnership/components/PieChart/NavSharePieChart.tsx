import React, {FunctionComponent} from 'react';
import {round} from "lodash";
import {Cell, Pie, PieChart, ResponsiveContainer, Tooltip} from 'recharts';
import {getColor} from "./colors";
import {getNavPieChartData, roundAndAdd} from "../InvestedFunds/computations";
import {IFundInvestorDetail, INavBreakDownSection, IOwnershipConfig} from "../../../../interfaces/fundInvestorDetail";
import FormattedCurrency from "../../../../utils/FormattedCurrency";
import styled from "styled-components";
import {useAppSelector} from "../../../../app/hooks";
import {selectInvestorOwnership} from "../../selectors";
import get from "lodash/get";


const NO_DATA_CHART_INFO = [{'name': '', value: 100}]
const NO_DATA_CHART_COLOR = '#CFD8DC'

interface colorMap {
  [key: string]: any
}

const VALUE_COLOR_MAP: colorMap = {
  'Total Net Equity': '#AD62AA',
  'Total Loan Balance': '#03145E',
  'Total Unpaid Interest': '#610094',
};


const TotalHeading = styled.div`
  font-style: normal;
  font-weight: 500;
  font-size: 15px;
  line-height: 19px;
  text-align: center;
  color: #192433;
`

const TotalCount = styled.div`
  text-align: center;
  font-weight: bold;
  font-size: 32px;
  line-height: 45px;
  letter-spacing: 0.02em;
  color: #03145E;
`

const TotalParentDiv = styled.div`
  position: absolute;
  top: 200px;
  width: 280px;
`


const CustomToolTipDiv = styled.div<{ valueColor: string }>`
  background-color: #FFFFFF;
  padding: 10px;
  border-radius: 20px;
  box-shadow: 0 0 9px 10px rgba(0, 0, 0, 0.15);

  .label {
    font-family: Quicksand;
    font-weight: bold;
    font-size: 17px;
  }

  .value {
    font-family: Quicksand;
    font-size: 17px;
    margin-left: 5px;
    color: ${props => props.valueColor};
  }
`

interface payload {
  name: string;
  value: number;
}

interface TooltipProps {
  active?: boolean
  payload?: payload[];
  label?: string;
}


const CustomTooltip = ({active, payload, label}: TooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <CustomToolTipDiv valueColor={VALUE_COLOR_MAP[payload[0].name]}>
        <div>
          <span className={'label'}>{`${payload[0].name} :`}</span>
          <span className={'value'}><FormattedCurrency value={payload[0].value}/></span></div>
      </CustomToolTipDiv>
    );
  }
  return null;
};


interface NavSharePieChartProps {
  totalRow: IFundInvestorDetail,
  sectionLabels: INavBreakDownSection[],
  ownershipConfig: IOwnershipConfig,
}


const NavSharePieChart: FunctionComponent<NavSharePieChartProps> = ({totalRow, sectionLabels, ownershipConfig}) => {
  const data = getNavPieChartData(totalRow, sectionLabels);
  let total = totalRow.total_gross_share_nav
  const investorOwnership = useAppSelector(selectInvestorOwnership);
  const hasNoData = investorOwnership && !investorOwnership.has_data;
  if (ownershipConfig?.use_custom_chart_total) {
    total = 0
    sectionLabels.forEach((section) => {
      const value = get(totalRow, section.field_name, 0)
      if (value){
        total += value
      }
    })
  }

  const chartData = hasNoData ? NO_DATA_CHART_INFO : data;

  return <ResponsiveContainer width="100%" height="100%">
    <>
      <PieChart width={280} height={300}>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          innerRadius={96}
          outerRadius={124}
          fill="#8884d8"
          dataKey="value"
          startAngle={360}
          minAngle={4}
          endAngle={0}
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={hasNoData ? NO_DATA_CHART_COLOR : getColor(index)}/>
          ))}
        </Pie>
        {!hasNoData && <Tooltip content={<CustomTooltip/>}/>}

      </PieChart>
      <TotalParentDiv>
        <TotalHeading>
          Total
        </TotalHeading>
        <TotalCount className="chart-value">
          <FormattedCurrency
            value={total ? total : null}
            symbol={totalRow['currency_symbol']}
          />
        </TotalCount>
      </TotalParentDiv>
    </>
  </ResponsiveContainer>
};

export default NavSharePieChart;
