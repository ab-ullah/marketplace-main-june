import { IFundBaseInfo } from '../../../../interfaces/fundDetails'

export interface AnalyticsViewProps {
    fund: IFundBaseInfo
}

export interface ChartData {
    id: string
    value: number
}

export interface AnalyticsData {
    id: string
    value: number
}

export interface FundAnalytics {
    total_equity_investment: null | number
    total_leverage_requested: null | number
    visited_fund_page: number
    visited_interest_page: number
    submitted_interest_form: number
    indication_of_interest_start: string
    indication_of_interest_end: string
    answer_details: AnswerDetails
}

export interface AnswerDetails {
    [key: string]: Answer
}

export interface Answer {
    [key: string]: number
}