import React, { FunctionComponent } from 'react';
import { BarChartData } from './interfaces';
import { ChartTitle, Container, HorizontalBarChart, HorizontalBarCharts, BarTitle, BarValue } from './styles'

const HorizontalChartColors: string[] = [
    '#2E86DE', '#FF5722', '#B0BEC5'
]

export const BarChart: FunctionComponent<BarChartData> = ({ colors, data, title }) => {
    return <Container>
        <ChartTitle>{title}</ChartTitle>
        <HorizontalBarCharts>
            {data.map((item, index) =>
                <HorizontalBarChart size={item.count} key={index} color={colors ? colors[index] : HorizontalChartColors[index]} >
                    <BarTitle>{item.answer}</BarTitle>
                    <BarValue>{item.count}</BarValue>
                </HorizontalBarChart>
            )}
        </HorizontalBarCharts>

    </Container>
}