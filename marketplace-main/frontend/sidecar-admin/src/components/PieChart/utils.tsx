import { handleFormatToCurrency } from "../../utils/currency";
import { ChartLabel } from "./styles";

export const getCustomLabel = (chartParams: any, chartData: any) => {
    const RADIAN = Math.PI / 180;
    const { cx, cy, midAngle, innerRadius, outerRadius, index } = chartParams;
    const radius = innerRadius + (outerRadius - innerRadius) * 1.75;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    if(!chartData[index].value) return <></>
    return (
      <text x={x} y={y} fill="black" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
        <ChartLabel x={x} y={y} fontWeight="500">{`${chartData[index].label}`}</ChartLabel>
        <ChartLabel x={x} y={y + 20} fontWeight="700">{handleFormatToCurrency(chartData[index].value)}</ChartLabel>
      </text>
    );
  }