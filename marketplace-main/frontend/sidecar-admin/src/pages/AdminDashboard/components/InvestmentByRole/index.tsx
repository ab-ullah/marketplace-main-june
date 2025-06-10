import React, {FunctionComponent} from 'react';
import {Cell, Pie, PieChart, ResponsiveContainer, Tooltip} from 'recharts';
import {useAppSelector} from "../../../../app/hooks";
import {selectAdminStat} from "../../selectors";
import {roleColors} from "../../roleColors";



interface RoleInvestmentPieChartProps {

}

const RADIAN = Math.PI / 180;

const RoleInvestmentPieChart: FunctionComponent<RoleInvestmentPieChartProps> = () => {
  const adminStats = useAppSelector(selectAdminStat);
  if (!adminStats) return <></>

  const data = adminStats.investment_by_role;

  const renderCustomizedLabel = ({cx, cy, midAngle, innerRadius, outerRadius, percent, index}: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize={12}>
        {`${data[index].name}(${(percent * 100).toFixed(0)}%)`}
      </text>
    );
  };

  return <ResponsiveContainer width="99%" height="100%">
    <PieChart width={400} height={400}>
      <Pie
        data={data}
        cx="50%"
        cy="50%"
        labelLine={false}
        outerRadius={120}
        fill="#8884d8"
        dataKey="value"
        label={renderCustomizedLabel}
      >
        {data.map((entry, index) => {
          const name = data[index].name
          // @ts-ignore
          return <Cell key={`cell-${index}`} fill={roleColors[name]}/>
        })}
      </Pie>
      <Tooltip/>
    </PieChart>
  </ResponsiveContainer>
};

export default RoleInvestmentPieChart;
