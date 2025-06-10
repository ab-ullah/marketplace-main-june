import React, { FunctionComponent } from 'react';
import {Cell, Pie, PieChart, ResponsiveContainer, Tooltip} from 'recharts';
import { INoticeResponse } from '../../../../interfaces/notices';
import { getChartData, getColor } from './utils';
import { CustomToolTipDiv, TotalCount, TotalHeading, TotalParentDiv } from './styles';
import FormattedCurrency from '../utils/FormattedCurrency';

interface ValuationChartProps {
    notices: INoticeResponse | null
}

interface payload {
    name: string;
    value: number;
  }

interface TooltipProps {
    active?: boolean
    payload?: payload[];
    label?: string;
}

const NO_DATA_CHART_INFO = [{'name': '', value: 100}]
const NO_DATA_CHART_COLOR = '#CFD8DC'

const CustomTooltip = ({active, payload, label}: TooltipProps) => {
    if (active && payload && payload.length) {
      return (
        <CustomToolTipDiv valueColor={'#AD62AA'}>
          <div>
            <span className={'label'}>{`${payload[0].name} :`}</span>
            <span className={'value'}><FormattedCurrency value={payload[0].value}/></span></div>
        </CustomToolTipDiv>
      );
    }
    return null;
  };


const ValuationChart: FunctionComponent<ValuationChartProps> = ({notices}) => {
    const { data, total } = getChartData(notices?.transactions);
    const hasNoData = notices?.transactions.length === 0;
  
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
              value={total}
            />
          </TotalCount>
        </TotalParentDiv>
      </>
    </ResponsiveContainer>
  };
  
  export default ValuationChart;