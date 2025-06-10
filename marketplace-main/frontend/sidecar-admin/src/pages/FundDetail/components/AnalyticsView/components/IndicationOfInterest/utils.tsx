import moment from 'moment';
import { PieChartColors } from '../../constants';
import { ChartReference } from '../CustomCharts/interfaces';
import { AnalyticsData, FundAnalytics } from '../../interfaces';
import { BarChartData } from '../../../../../../components/GraphBars/interfaces';

const getTotalInvestment = (analytics: FundAnalytics): string => {
    const { total_equity_investment, total_leverage_requested } = analytics;
    const totalInvestment = getNumberWithSuffix(total_equity_investment! + total_leverage_requested!);
    return '$' + totalInvestment;
}

const getReferenceData = (analytics: FundAnalytics): ChartReference[] => {
    const { total_equity_investment: tei, total_leverage_requested: tlr } = analytics;
    const totalEquityTitle = `Total Equity Investment: $${getNumberWithSuffix(tei)}`;
    const totalLeverageTitle = `Total Leverage Requested: $${getNumberWithSuffix(tlr)}`;
    return [{ title: totalLeverageTitle, color: PieChartColors.leverage },
    { title: totalEquityTitle, color: PieChartColors.equity }]
}

export const getNumberWithSuffix = (number: number | null, fixture: number = 0): string => {
    if (!number) return '0';
    if (number < 1000) {
        return number.toString();
    }
    if (number < 1000000) {
        return (number / 1000).toFixed(fixture) + 'k';
    }
    if (number < 1000000000) {
        return (number / 1000000).toFixed(fixture) + 'mm';
    }
    return (number / 1000000000).toFixed(fixture) + 'b';
}

const getChartData = (analytics: FundAnalytics): AnalyticsData[] => {
    const { total_equity_investment: tei, total_leverage_requested: tlr } = analytics;
    const data = [{ id: 'equity', value: tei || 0 }, { id: 'leverage', value: tlr || 0 }]
    return data;
}

const getFormatedDate = (date: string): string => {
    return moment(date, 'YYYY-MM-DD').format("D MMM YYYY");
}

const getPeriodString = (analytics: FundAnalytics): string => {
    return `${getFormatedDate(analytics.indication_of_interest_start)} - ${getFormatedDate(analytics.indication_of_interest_end)}`
}

const getBarChartData = (analytics: FundAnalytics): BarChartData[] => {
    const { answer_details } = analytics;
    const barChartData: BarChartData[] = Object.entries(answer_details).map(([title, answers]) => {
        const data = Object.entries(answers).map(([answer, count]) => ({ answer, count }));
        return { title, data }
    })
    return barChartData
}

export const parseAnalyticsData = (analytics: FundAnalytics): any => {
    const totalInvestment = getTotalInvestment(analytics);
    const referenceData = getReferenceData(analytics);
    const chartData = getChartData(analytics);
    const periodString = getPeriodString(analytics);
    const barChartData = getBarChartData(analytics);
    return { totalInvestment, referenceData, chartData, periodString, barChartData }
};