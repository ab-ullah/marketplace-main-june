import styled from 'styled-components';
import { BarChartProps } from './interfaces';

export const HorizontalBarChart: any = styled.div`
    background-color: ${({ color }: BarChartProps) => color};
    height: 40px;
    flex: ${({ size }: BarChartProps) => size};
    transition: all 2s;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 10px;
    :first-child {
        border-top-left-radius: 4px;
        border-bottom-left-radius: 4px;
    }
    :last-child {
        border-top-right-radius: 4px;
        border-bottom-right-radius: 4px;
    }
`;
export const BarTitle = styled.div`
    color: white;
    font-size: 14px;
    font-weight: 700;
    text-overflow: ellipsis;
    white-space: nowrap;
    padding-right: 10px;
`;

export const BarValue = styled.div`
    color: white;
    font-size: 24px;
    font-weight: 400;
    
`;

export const Container = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
`;

export const ChartTitle = styled.h2`
    font-size: 15px;
    line-height: 21px;
    font-weight: 700;
    align-self: flex-start;
`;

const HorizontalBarChartContainer = styled.div`
    margin: 0 auto;
    margin-bottom: 32px;
    height: 40px;
    width: 100%;
    
`;

const HorizontalBarInner = styled.div`
    align-items: center;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    width: 100%;
`;


export const HorizontalBarCharts = ({ children }: any) => {
    return <HorizontalBarChartContainer>
        <HorizontalBarInner>
            {children}
        </HorizontalBarInner>
    </HorizontalBarChartContainer>
}