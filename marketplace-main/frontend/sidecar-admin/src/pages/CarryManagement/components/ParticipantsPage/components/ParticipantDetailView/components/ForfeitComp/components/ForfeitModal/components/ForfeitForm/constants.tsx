import { CSSProperties } from "react";
import {countDecimalPlaces, getSumByProperty, limitCarryDecimalPlaces} from "../../../../../../../../../../../../utils/getValue";
import get from "lodash/get";
import { FormTextFieldRow } from "../../../../../../../../../../../../components/Form/TextField";
import DateModal from "./components/DateModal";
import { decimalGreaterThan, decimalSubtract } from "../../../../../../../../../../../../utils/decimal";

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

export const getColumns = (
  handleEdit: (allocationId: string, attributes: Record<string,any>) => void,
  showPoints:boolean,
  disabledEdit: boolean
) => {
  const pointsCols =[
  {
    title: "Points To Forfeit",
    dataKey: "points_to_forfeit",
    minWidth: 150,
    flexGrow: 0.75,
    fixed:"right",
    Cell: (row: any) =>
      isFooter(row) ? (
        <span style={footerRowStyle}>{get(row, "points_to_forfeit")}</span>
      ) : (
        <span>
          <FormTextFieldRow
            label=""
            name=""
            placeholder=""
            value={row.points_to_forfeit}
            disabled={disabledEdit || !get(row, "forfeiture_date")}
            onChange={(e: any) =>{
              const val = e.target.value
             if((!isNaN(val) && countDecimalPlaces(val)<=16) || val ===".") handleEdit(row.allocation_id, {points_to_forfeit:e.target.value})}}
            error={
              decimalGreaterThan(row.points_to_forfeit,row.bps)
                ? `Enter from 0 to ${row.bps}`
                : null
            }
          />
        </span>
      ),
  }]
  const cols = [
  {
    title: "Carry Plan",
    fixed: "left",
    dataKey: "carry_plan_name",
    minWidth: 150,
    flexGrow: 0.75,
    Cell: (row: any) => (
      <span style={isFooter(row) ? footerRowStyle : {}}>
        {get(row, "carry_plan_name")}
      </span>
    ),
  },
  {
    title: "Current Points",
    dataKey: "bps",
    minWidth: 150,
    flexGrow: 0.75,
    Cell: (row: any) => (
      <span style={isFooter(row) ? footerRowStyle : {}}>{ limitCarryDecimalPlaces(get(row, "bps")) }</span>
    ),
  },
  {
    title: "Initial Points",
    dataKey: "initial_bps",
    minWidth: 100,
    flexGrow: 0.5,
    Cell: (row: any) => (
      <span style={isFooter(row) ? footerRowStyle : {}}>{limitCarryDecimalPlaces(get(row, "initial_bps"))}</span>
    ),
  },
  {
    title: "Vested",
    dataKey: "vested_bps",
    minWidth: 100,
    flexGrow: 0.5,
    Cell: (row: any) => (
      <span style={isFooter(row) ? footerRowStyle : {}}>
        {limitCarryDecimalPlaces(get(row, "vested_bps"))}
      </span>
    ),
  },
  {
    title: "Unvested",
    dataKey: "unvested_bps",
    minWidth: 100,
    flexGrow: 0.5,
    Cell: (row: any) => (
      <span style={isFooter(row) ? footerRowStyle : {}}>
        {limitCarryDecimalPlaces(decimalSubtract(row.bps , row.vested_bps).toString())}
      </span>
    ),
  },
  {
    title: "Forfeited",
    dataKey: "forfeited_bps",
    minWidth: 100,
    flexGrow: 0.5,
    Cell: (row: any) => (
      <span style={isFooter(row) ? footerRowStyle : {}}>
        {limitCarryDecimalPlaces(get(row, "forfeited_bps"))}
      </span>
    ),
  },
  ...(showPoints? pointsCols:[]),
  {
    title: "Forfeiture Date",
    dataKey: "forfeiture_date",
    minWidth: 150,
    flexGrow: 0.75,
    fixed:"right",
    Cell: (row: any) => (
      <span
        style={isFooter(row) ? { ...footerRowStyle, ...hideTextStyle } : {}}
      >
        {!isFooter(row) ? (
          <DateModal
            title={get(row, "carry_plan_name")}
            selectedDate={get(row, "forfeiture_date")}
            onDateChange={(forfeiture_date: any) =>
              handleEdit(row.allocation_id, { forfeiture_date })
            }
            disabled={showPoints || disabledEdit}
          />
        ) : (
          "-"
        )}
      </span>
    ),
  }
]

return cols
};

export const generateFooterData = (data: any[]) => {
  const footerData = {
    isFooter: true,
    allocation_id: -1,
    carry_plan_name: "Total",
    bps: getSumByProperty(data, "bps"),
    vested_bps: getSumByProperty(data, "vested_bps"),
    forfeited_bps: getSumByProperty(data, "forfeited_bps"),
    points_to_forfeit: getSumByProperty(data, "points_to_forfeit"),
    initial_bps: getSumByProperty(data, "initial_bps"),
    unvested_bps: 0,
  };

  const { bps, vested_bps, forfeited_bps } = footerData;

  footerData.unvested_bps = decimalSubtract( bps ,vested_bps , forfeited_bps).toNumber();

  return footerData;
};
