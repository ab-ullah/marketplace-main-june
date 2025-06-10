import React, { FunctionComponent } from 'react';
import { useWindowWidth, getChartCalcs } from "./utils";
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';
import { PieChartColors } from '../../constants';
import { ChartData, ChartReferenceProps } from './interfaces';
import { PieChartInsideContent, Container, PieReferencesContainer, PieReferenceContainer, PieReferenceDot } from './styles';

export const Charts: FunctionComponent<ChartData> = ({ data, insideContent }) => {
    const windowWidth = useWindowWidth();
    const { containerWidth, innerRadius, outerRadius } = getChartCalcs(windowWidth);
    return <Container>
        <ResponsiveContainer width={containerWidth} aspect={1}>
            <PieChart>
                <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    innerRadius={innerRadius}
                    outerRadius={outerRadius}
                    fill="#ECA106"
                    dataKey="value"
                    startAngle={360}
                    minAngle={4}
                    endAngle={0}
                >
                    {data.map((entry, index) => <Cell key={index} fill={PieChartColors[entry.id]} />)}
                </Pie>
            </PieChart>
        </ResponsiveContainer>
        <PieChartInsideContent>
            <h1>{insideContent.title}</h1>
            {insideContent.subtitle}
        </PieChartInsideContent>
    </Container>
}

export const ChartReferences: FunctionComponent<ChartReferenceProps> = ({ data }) => {
    return <PieReferencesContainer>
        {data.map((item, index) =>
            <PieReferenceContainer key={index}>
                <PieReferenceDot color={item.color} />
                <h4>{item.title}</h4>
            </PieReferenceContainer>
        )}
    </PieReferencesContainer>
}