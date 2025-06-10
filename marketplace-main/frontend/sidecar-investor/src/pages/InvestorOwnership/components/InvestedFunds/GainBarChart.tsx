import React, {FunctionComponent} from 'react';
import {Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis,} from 'recharts';
import {IOwnershipFundInvestor} from "../../../../interfaces/investorOwnership";
import {getGainBarChartData} from "./computations";


interface GanBarChartProps {
  investedFunds: IOwnershipFundInvestor[]
}


const GanBarChart: FunctionComponent<GanBarChartProps> = ({investedFunds}) => {
  const data = getGainBarChartData(investedFunds);

  return <ResponsiveContainer width="100%" height="100%">
    <BarChart width={300} height={300} data={data}>
      <Bar dataKey="value" fill="#8884d8" label/>
      <XAxis dataKey={'name'}/>
      <YAxis dataKey={'value'}/>
      <Tooltip/>
    </BarChart>
  </ResponsiveContainer>
};

export default GanBarChart;
