
export interface BarChartData {
    title: string;
    colors?: string[];
    data: Array<BarChartOptions>;
}

export interface BarChartOptions {
    order?: number;
    answer?: string;
    count: number;
}

export interface BarChartProps {
    color: string;
    size: number;
}
