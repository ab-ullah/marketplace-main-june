import { formatCurrencyWithTwoDecimals } from "../../../../../../utils/currency"
import { standardizeDate } from "../../../../../../utils/dateFormatting"
import { limitCarryDecimalPlacesString } from "../../../../../../utils/getValue"

export const processAllocationData = (data: any) => {
    return data.map((allocation: any) => {
        return {
            ...allocation,
            grant_date: standardizeDate(allocation.grant_date),
            name: allocation.carry_plan_name,
            participant_estimated_carry: formatCurrencyWithTwoDecimals(allocation.participant_estimated_carry, allocation.carry_plan_currency_code),
            estimated_value_date: allocation.estimated_value_date ? standardizeDate(allocation.estimated_value_date) : "-",
            participant_estimated_carry_vested: formatCurrencyWithTwoDecimals(
                allocation.participant_estimated_carry_vested, allocation.carry_plan_currency_code
            ),
            participant_estimated_carry_un_vested: formatCurrencyWithTwoDecimals(
                allocation.participant_estimated_carry_un_vested, allocation.carry_plan_currency_code
            ),
            un_vested_bps: limitCarryDecimalPlacesString(allocation.un_vested_bps),
            vesting_start_date: standardizeDate(allocation.vesting_start_date),
            percentage_vested: limitCarryDecimalPlacesString(allocation.percentage_vested),
            unvested_bps: (allocation.bps - allocation.vested_bps),
            participant_fair_market_value: formatCurrencyWithTwoDecimals(allocation.participant_fair_market_value, allocation.carry_plan_currency_code),
            fair_market_value_date: allocation.fair_market_value_date ? standardizeDate(allocation.fair_market_value_date) : '-',
            percent_pool: (allocation.percent_pool * 100),
            bps: limitCarryDecimalPlacesString(allocation.bps),
            vested_bps: limitCarryDecimalPlacesString(allocation.vested_bps),
            distributions: limitCarryDecimalPlacesString(allocation.distributions)
        }
    })
}

export const processOverviewAllocationData = (data: any) => {
    return data.map((allocation: any) => {
        return {
            ...allocation,
            bps: (allocation.bps),
            forfeited_bps: (allocation.forfeited_bps),
            vested_bps: (allocation.vested_bps),
            vested_value: formatCurrencyWithTwoDecimals(allocation.vested_value),
            unvested_value: formatCurrencyWithTwoDecimals(allocation.unvested_value),
            distributions: formatCurrencyWithTwoDecimals(allocation.distributions)
        }
    })
}

export const getEmployeeStatus = (status: string) => {
    if(status === 'inactive') return 'Inactive Employee';
    if(status === 'active') return 'Active Employee';
    return 'No Status'
}