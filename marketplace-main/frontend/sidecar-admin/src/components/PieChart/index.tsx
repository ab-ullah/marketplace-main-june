import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { CenterSection, CustomTooltip } from "./styles";
import { getCustomLabel } from "./utils";

export interface DataItem {
  key: string;
  label: string;
  value: number;
}

interface CustomPieChartProps {
  data: DataItem[];
  colors: Record<string, any>;
  centerContent: React.ReactNode;
}

const CustomPieChart = ({
  data,
  colors,
  centerContent,
}: CustomPieChartProps) => {
  if (!data?.length) return <p>No data to display</p>;

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            cx="50%"
            cy="50%"
            labelLine={false}
            innerRadius={104}
            outerRadius={150}
            fill="#8884d8"
            startAngle={360}
            minAngle={6}
            endAngle={0}
            paddingAngle={2}
            label={(params: any) => getCustomLabel(params, data)}
          >
            {data.map((entry) => (
              <Cell key={`cell-${entry.key}`} fill={colors[entry.key] || 'black'} />
            ))}
          </Pie>
          {!!data?.length && (
            <Tooltip content={<CustomTooltip colorMap={colors} />} />
          )}
        </PieChart>
      </ResponsiveContainer>
      <CenterSection>{centerContent}</CenterSection>
    </div>
  );
};

export default CustomPieChart;
