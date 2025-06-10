import { get, isEmpty, truncate } from "lodash";
import { CSSProperties } from "react";
import { standardizeDate } from "../../../../../../../../utils/dateFormatting";
import {
  getSumByProperty,
  limitCarryDecimalPlaces,
} from "../../../../../../../../utils/getValue";
import TooltipWrapper from "../../../../../../../../components/Tooltip";
import { createDecimal, decimalSubtract } from "../../../../../../../../utils/decimal";

const footerRowStyle = {
  borderTop: "1px solid #D5DAE1",
  position: "absolute",
  top: "0px",
  padding: "8px",
  width: "100%",
  fontWeight: 700,
  fontSize: "16px",
  lineHeight: "28px",
  background: "#F5F7F8",
  left: 0,
} as CSSProperties;

const hideTextStyle = { color: "transparent" } as CSSProperties;

const isFooter = (row: any) => get(row, "isFooter") === true;

export const formatInfoTableData = (data: any, dilutePoints:number | string) => {
  const { default_vesting_schedule, bps, allocations, name, funds_and_deals } =
    data;
    const allocationSum = getSumByProperty(allocations || [], "bps");
  return {
    name,
    defaultVestingScheduleName: default_vesting_schedule?.label,
    totalPoints: bps ? createDecimal(bps).toString() : 0,
    participantsWithPoints: (allocations || []).filter(
      (allocation: any) => allocation.bps
    ).length,
    fundsAndDealsName: funds_and_deals.map((elem: any) => elem.name).join(", "),
    allocatedPoints: decimalSubtract(allocationSum ,dilutePoints).toString(),
  };
};

export const getColumns = (showPool:boolean) => [
  {
    title: "Participant",
    dataKey: "name",
    width: 150,
    Cell: (row: any) => (
        <TooltipWrapper enable={!isFooter(row)} text={get(row,'name')}>
           <span style={isFooter(row) ? footerRowStyle : {}}>
              {truncate(get(row,'name'))}
           </span>
        </TooltipWrapper>
    ),
  },
  {
    title: "Existing Points",
    dataKey: "bps",
    width: 150,
    flexGrow: 1,
    Cell: (row: any) => (
      <span style={isFooter(row) ? footerRowStyle : {}}>
        {limitCarryDecimalPlaces(get(row, "bps"))}
      </span>
    ),
  },
  showPool? 
  {
    title: "Pool",
    dataKey: "sub_pool_name",
    width: 150,
    flexGrow: 1
  }:{},
  {
    title: "Pts Reduced",
    dataKey: "points_reduced",
    width: 150,
    flexGrow: 1,
    Cell: (row: any) => (
      <span style={isFooter(row) ? footerRowStyle : {}}>
        {limitCarryDecimalPlaces(get(row, "points_reduced") || 0)}
      </span>
    ),
  },

  {
    title: "New Pts",
    dataKey: "bps",
    width: 150,
    flexGrow: 1,
    Cell: (row: any) => (
      <span style={isFooter(row) ? footerRowStyle : {}}>
        {get(row,'points_reduced') ? limitCarryDecimalPlaces(decimalSubtract(get(row, "bps"),get(row,'points_reduced')).toString()) :"-" }
      </span>
    ),
  },
].filter(elem=>!isEmpty(elem));

export const DILUTE_MODE={
  PRO_RATA:'pro-rata',
  EVENLY:'evenly'
}

export const diluteModeOptions =[
  {label:'Pro-rata',value:DILUTE_MODE.PRO_RATA},
  {label: 'Evenly', value: DILUTE_MODE.EVENLY}
]