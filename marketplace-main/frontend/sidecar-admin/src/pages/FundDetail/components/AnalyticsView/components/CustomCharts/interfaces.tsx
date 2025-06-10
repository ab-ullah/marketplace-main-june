import { AnalyticsData } from '../../interfaces';

export interface PieChartContent {
    title: string;
    subtitle: string;
}

export interface ChartData {
    data: AnalyticsData[];
    insideContent: PieChartContent;
}

export interface ChartReference {
    title: string;
    color: string;
}

export interface ChartReferenceProps {
    data: ChartReference[];
}

