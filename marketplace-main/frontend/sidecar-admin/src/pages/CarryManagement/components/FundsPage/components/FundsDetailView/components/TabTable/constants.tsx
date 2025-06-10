import {SUB_TABS} from "../../constants";
import {formatCurrencyWithTwoDecimals} from "../../../../../../../../utils/currency";
import {limitCarryDecimalPlaces} from "../../../../../../../../utils/getValue";
import { carryTooltip } from "../../../../../../../../interfaces/company";
import { getTooltip } from "../../../FundsListView/constants";
import { standardizeDate } from "../../../../../../../../utils/dateFormatting";
import { PARTICIPANT_ID_PARAM, PARTICIPANT_NAME_PARAM, TABS } from "../../../../../../constants";
import get from "lodash/get";
import { isEmpty } from "lodash";

export const getColumns=(tab:string, tooltips: carryTooltip[],history:any,showGpCommit:boolean)=>{
    switch (tab) {
        case SUB_TABS.OVERVIEW:
            return getOverviewSectionColumns(history,showGpCommit)
        case SUB_TABS.DEALS:
            return getDealsSectionColumns(tooltips)
        case SUB_TABS.COMMITMENTS:
            return getCommitmentsColumns()
        default:
            return []
    }
}


const getOverviewSectionColumns = (history:any,showGpCommit:boolean) => {
    const handleViewParticipantDetails=(id:string, name:string)=>{
    
    const searchParams = new URLSearchParams();
    searchParams.set("tab", TABS.PARTICIPANTS);
    searchParams.set(PARTICIPANT_ID_PARAM, id);
    searchParams.set(PARTICIPANT_NAME_PARAM, name);

    history.replace(`${window.location.pathname}?${searchParams.toString()}`);
    }
    return[
    {
        title: "Participant",
        fixed: "left",
        dataKey: "full_name",
        minWidth: 200,
        flexGrow: 1.3,
        Cell: (row: any)=> <span style={{textDecoration:'underline', cursor:'pointer'}} onClick={()=>handleViewParticipantDetails(row.user_id,row.user_name)}>{get(row,"full_name")}</span>
    },
    {
        title: "Points",
        dataKey: "bps",
        minWidth: 150,
        flexGrow: 1,
        Cell: (row: any) => <span>{limitCarryDecimalPlaces(row.bps)}</span>,
    },
    {
        title: "Unvested",
        minWidth: 200,
        flexGrow: 1.3,
        Cell: (row: any) => <span>{limitCarryDecimalPlaces(row.un_vested_bps)}</span>,
    },
    {
        title: "Vested Points",
        minWidth: 150,
        flexGrow: 1,
        Cell: (row: any) => <span>{limitCarryDecimalPlaces(row.vested_bps)}</span>,
    },
    {
        title: "% Vested",
        minWidth: 130,
        flexGrow: 1,
        Cell: (row: any) => <span>{(limitCarryDecimalPlaces(row.vested_percentage))}</span>,
    },
    {
        title: "Estimated Value",
        minWidth: 150,
        flexGrow: 1,
        Cell: (row: any) => <span>{formatCurrencyWithTwoDecimals(row.estimated_value)}</span>,
    },
    {
        title: "Estimated Value As Of",
        minWidth: 150,
        flexGrow: 1,
        Cell: (row: any) => <span>{standardizeDate(row.estimated_value_date)}</span>,
    },
    {
        title: "Fair Market Value",
        minWidth: 150,
        flexGrow: 1,
        Cell: (row: any) => <span>{formatCurrencyWithTwoDecimals(row.fair_market_value)}</span>,
    },
    {
        title: "Fair Market Value As Of",
        minWidth: 150,
        flexGrow: 1,
        Cell: (row: any) => <span>{standardizeDate(row.fair_market_value_date)}</span>,
    },
    showGpCommit?
    {
        title: "Total Commitment",
        minWidth: 150,
        flexGrow: 1,
        Cell: (row: any) => <span>{formatCurrencyWithTwoDecimals(row.total_gp_commitment)}</span>,
    }:{},
    {
        title: "Distributions",
        minWidth: 150,
        flexGrow: 1,
        Cell: (row: any) => <span>{formatCurrencyWithTwoDecimals(row.distributions)}</span>,
    }
].filter(elem=>!isEmpty(elem))};


const getDealsSectionColumns = (tooltips: carryTooltip[]) => [
    {
        title: "Deal Name",
        fixed: "left",
        dataKey: "name",
        minWidth: 200,
        flexGrow: 1.3,
    },
    {
        title: "Estimated Value",
        minWidth: 150,
        tooltip: getTooltip('estimated_value', tooltips),
        flexGrow: 1,
        Cell: (row: any) => <span>{formatCurrencyWithTwoDecimals(row.estimated_value)}</span>,
    },
    {
        title: "Estimated Value As Of",
        minWidth: 150,
        flexGrow: 1,
        Cell: (row: any) => <span>{standardizeDate(row.estimated_value_date)}</span>,
    },
    {
        title: "Fair Market Value",
        tooltip: getTooltip('fair_market_value', tooltips),
        minWidth: 150,
        flexGrow: 1,
        Cell: (row: any) => (
            <span>{formatCurrencyWithTwoDecimals(row.fair_market_value)}</span>
        ),
    },
    {
        title: "Fair Market Value As Of",
        minWidth: 150,
        flexGrow: 1,
        Cell: (row: any) => <span>{standardizeDate(row.fair_market_value_date)}</span>,
    },
    {
        title: "Distributions",
        minWidth: 150,
        flexGrow: 1,
        Cell: (row: any) => (
            <span>{formatCurrencyWithTwoDecimals(row.distributions)}</span>
        ),
    }
];

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