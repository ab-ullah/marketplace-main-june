import { get } from "lodash";
import { limitCarryDecimalPlaces } from "../../../../../../../../utils/getValue";
import {formatCurrencyWithTwoDecimals} from "../../../../../../../../utils/currency";
import { standardizeDate } from "../../../../../../../../utils/dateFormatting";
import { carryTooltip } from "../../../../../../../../interfaces/company";
import { getTooltip } from "../../../../../FundsPage/components/FundsListView/constants";

export const getCarryPlansColumns = ( hasEntity: boolean, tooltips: carryTooltip[]) => {
  let columns = [
    {
      title: "Grant Date",
      dataKey: 'grant_date',
      width: 80,
      flexGrow: 0.8,
      Cell: (row: any) => (
          <span>
        {standardizeDate(get(row, "grant_date"))}
      </span>
      ),
    },
    {
      title: "Carry Plan",
      dataKey: "carry_plan_name",
      minWidth: 180,
      flexGrow: 1,
    },
    {
      title: "Vesting Schedule",
      dataKey: "vesting_schedule_id.name",
      minWidth: 180,
      flexGrow: 1,
      Cell: (row: any) => (
          <span>
          {get(row, "vesting_schedule_id.name")}
      </span>
      ),
    },
    {
      title: "Vesting Start Date",
      dataKey: "vesting_start_date",
      width: 200,
      flexGrow: 1.5,
      Cell: (row: any) => (
          <span>
        {standardizeDate(get(row, "vesting_start_date"))}
      </span>
      ),
    },
    {
      title: "Vested Percentage",
      dataKey: 'percentage_vested',
      width: 200,
      flexGrow: 1.5,
      Cell: (row: any) => (
          <span>{limitCarryDecimalPlaces(get(row, "percentage_vested"))} %</span>
      ),
    },
    {
      title: "Points",
      dataKey: 'bps',
      minWidth: 100,
      flexGrow: 0.6,
      Cell: (row: any) => (
          <span>{limitCarryDecimalPlaces(get(row, "bps"))}</span>
      ),
    },
    {
      title: "Vested",
      dataKey: 'vested_bps',
      minWidth: 100,
      flexGrow: 0.6,
      Cell: (row: any) => (
          <span>{limitCarryDecimalPlaces(get(row, "vested_bps"))}</span>
      ),
    },
    {
      title: "Unvested",
      dataKey: "un_vested_bps",
      minWidth: 100,
      flexGrow: 0.6,
      Cell: (row: any) => (
          <span>{limitCarryDecimalPlaces(get(row, "un_vested_bps"))}</span>
      ),
    },
    {
      title: "Estimated Value",
      dataKey: "participant_estimated_carry",
      tooltip: getTooltip('estimated_value', tooltips),
      minWidth: 180,
      flexGrow: 1,
      Cell: (row: any) => (
          <span>
        {formatCurrencyWithTwoDecimals(get(row, "participant_estimated_carry"),get(row,'carry_plan_currency_code'))}
      </span>
      ),
    },
    {
      title: "Estimated Value As Of",
      dataKey: "estimated_value_date",
      minWidth: 220,
      flexGrow: 1,
      Cell: (row: any) => (
          <span>
        {get(row, "estimated_value_date") ? standardizeDate(get(row, "estimated_value_date")) : '-'}
      </span>
      ),
    },
    {
      title: "Vested Value",
      dataKey: "participant_estimated_carry_vested",
      minWidth: 120,
      flexGrow: 0.8,
      Cell: (row: any) => (
          <span>
        {formatCurrencyWithTwoDecimals(get(row, "participant_estimated_carry_vested"),get(row,'carry_plan_currency_code'))}
      </span>
      ),
    },

    {
      title: "Unvested Value",
      dataKey: "participant_estimated_carry_un_vested",
      minWidth: 150,
      flexGrow: 1,
      Cell: (row: any) => (
          <span>
        {formatCurrencyWithTwoDecimals(get(row, "participant_estimated_carry_un_vested"),get(row,'carry_plan_currency_code'))}
      </span>
      ),
    },
    {
      title: "Fair Market Value",
      dataKey: 'participant_fair_market_value',
      tooltip: getTooltip('fair_market_value', tooltips),
      minWidth: 180,
      flexGrow: 1,
      Cell: (row: any) => (
          <span>{formatCurrencyWithTwoDecimals(get(row, "participant_fair_market_value"),get(row,'carry_plan_currency_code'))}</span>
      ),
    },
    {
      title: "Fair Market Value As Of",
      dataKey: "fair_market_value_date",
      minWidth: 220,
      flexGrow: 1,
      Cell: (row: any) => (
          <span>
        {get(row, "fair_market_value_date") ? standardizeDate(get(row, "fair_market_value_date")) : '-'}
      </span>
      ),
    },
    {
      title: "Distributions",
      dataKey: 'distributions',
      minWidth: 110,
      flexGrow: 0.6,
      Cell: (row: any) => (
          <span>{formatCurrencyWithTwoDecimals(get(row, "distributions"),get(row,'carry_plan_currency_code'))}</span>
      ),
    }
  ]
  if(hasEntity){
    columns.splice(2, 0,      {
      title: "Entity",
      dataKey: "entity_name",
      minWidth: 150,
      flexGrow: 1,
      Cell: (row: any) => <span>{get(row, 'entity_name')}</span>
    },)
  }
  return columns;
}