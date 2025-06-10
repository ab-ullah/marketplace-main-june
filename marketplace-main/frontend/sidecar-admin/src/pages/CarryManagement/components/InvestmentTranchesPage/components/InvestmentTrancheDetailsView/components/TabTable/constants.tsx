import {limitCarryDecimalPlaces} from "../../../../../../../../utils/getValue";
import { SUB_TABS } from "../../constants";
import {formatCurrencyWithTwoDecimals} from "../../../../../../../../utils/currency";
import { standardizeDate } from "../../../../../../../../utils/dateFormatting";


export const getColumns=(tab:string)=>{
    switch (tab) {
        case SUB_TABS.OVERVIEW:
            return getOverviewSectionColumns()
            break;
        case SUB_TABS.COMMITMENTS:
            return getCommitmentsColumns()
        default:
            return []
            break;
    }
}

export const getOverviewSectionColumns = () => [
  {
    title: "Participant",
    fixed: "left",
    dataKey: "name",
    minWidth: 200,
    flexGrow: 1.3,
  },
  {
    title: "Points",
    dataKey: "bps",
    minWidth: 150,
    flexGrow: 1,
    Cell: (row:any)=> <span>{limitCarryDecimalPlaces(row.bps)}</span>
  },
  {
    title: "Vested",
    dataKey: "vested_bps",
    minWidth: 150,
    flexGrow: 1,
    Cell: (row:any)=> <span>{limitCarryDecimalPlaces(row.vested_bps)}</span>
  },
  {
    title: "Unvested",
    dataKey: "un_vested_bps",
    minWidth: 150,
    flexGrow: 1,
    Cell: (row:any)=> <span>{limitCarryDecimalPlaces(row.un_vested_bps)}</span>
  },
  {
    title: "% Vested",
    dataKey: "vested_percentage",
    minWidth: 150,
    flexGrow: 1,
    Cell: (row:any)=> <span> {limitCarryDecimalPlaces(row.vested_percentage)}</span>
  },
  {
    title: "Estimated Value",
    dataKey: "estimated_value",
    minWidth: 150,
    flexGrow: 1,
    Cell: (row: any) => <span>{formatCurrencyWithTwoDecimals(row.estimated_value)}</span>,
},
{
    title: "Estimated Value As Of",
    minWidth: 150,
    dataKey: "estimated_value_date",
    flexGrow: 1,
    Cell: (row: any) => <span>{standardizeDate(row.estimated_value_date)}</span>,
},
{
    title: "Fair Market Value",
    dataKey: "fair_market_value",
    minWidth: 150,
    flexGrow: 1,
    Cell: (row: any) => <span>{formatCurrencyWithTwoDecimals(row.fair_market_value)}</span>,
},
{
    title: "Fair Market Value As Of",
    dataKey: "fair_market_value_date",
    minWidth: 150,
    flexGrow: 1,
    Cell: (row: any) => <span>{standardizeDate(row.fair_market_value_date)}</span>,
},
  {
    title: "Distributions",
    dataKey: "distributions",
    minWidth: 150,
    flexGrow: 1,
    Cell: (row:any)=> <span> {formatCurrencyWithTwoDecimals(row.distributions)}</span>
  },
];

export const getDealParticipantsExportData = (data: any[]) => {
  return data.map((participant) => ({
    ...participant,
    estimated_value: formatCurrencyWithTwoDecimals(participant.estimated_value),
    estimated_value_date: standardizeDate(participant.estimated_value_date),
    fair_market_value: formatCurrencyWithTwoDecimals(participant.fair_market_value),
    fair_market_value_date: standardizeDate(participant.fair_market_value_date),
    vested_bps: participant.vested_bps,
    unvested_bps: participant.bps - participant.vested_bps,
    percent: participant.vested_bps/participant.bps*100,
    distributions: formatCurrencyWithTwoDecimals(participant.distributions)
  }))
}

export const getCommitmentsColumns = () => [
  {
    title: "Participant",
    fixed: "left",
    dataKey: "participant_full_name",
    minWidth: 200,
    flexGrow: 1.3,
  },
  {
    title: "Total Capital Commit",
    dataKey: "total_capital_commit",
    minWidth: 150,
    flexGrow: 1,
    Cell: (row: any) => (
      <span>{formatCurrencyWithTwoDecimals(row.total_capital_commit)}</span>
    ),
  },
  {
      title: "Cashless Commit",
      dataKey: "cashless_commit",
      minWidth: 150,
      flexGrow: 1,
      Cell: (row: any) => (
        <span>{formatCurrencyWithTwoDecimals(row.cashless_commit)}</span>
      ),
    },
    {
      title: "Management Fee Offset",
      dataKey: "management_fee_offset",
      minWidth: 200,
      flexGrow: 1.3,
      Cell: (row: any) => (
        <span>{formatCurrencyWithTwoDecimals(row.management_fee_offset)}</span>
      ),
    },
    {
      title: "Salary Reduction",
      dataKey: "salary_reduction",
      minWidth: 150,
      flexGrow: 1,
      Cell: (row: any) => (
        <span>{formatCurrencyWithTwoDecimals(row.salary_reduction)}</span>
      ),
    },
];
