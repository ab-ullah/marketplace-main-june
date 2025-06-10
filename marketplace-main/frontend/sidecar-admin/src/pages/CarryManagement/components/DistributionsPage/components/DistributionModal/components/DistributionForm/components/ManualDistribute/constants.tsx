import get from "lodash/get";
import { CSSProperties } from "react";
import {
  getSumByProperty,
  isAllowedDecimal,
  isValidPositiveDecimal,
  limitCarryDecimalPlaces,
} from "../../../../../../../../../../utils/getValue";
import CurrencyInput from "../../../../../../../../../../components/Form/CurrencyInput";
import { formatCurrencyWithTwoDecimals } from "../../../../../../../../../../utils/currency";
import { FormTextFieldRow } from "../../../../../../../../../../components/Form/TextField";
import { decimalGreaterOrEqual, decimalLessOrEqual } from "../../../../../../../../../../utils/decimal";

const footerRowStyle = {
  borderTop: "1px solid #D5DAE1",
  position: "absolute",
  top: "0px",
  padding: "8px",
  width: "100%",
  fontWeight: 700,
  fontSize: "16px",
  lineHeight: "55px",
  background: "#F5F7F8",
  left: 0,
} as CSSProperties;

const hideTextStyle = { color: "transparent" } as CSSProperties;

const isFooter = (row: any) => get(row, "isFooter") === true;

export const getColumns = (handleUpdateField: any) => [
  {
    title: "Participant",
    dataKey: "full_name",
    width: 180,
    Cell: (row: any) => (
      <span style={isFooter(row) ? footerRowStyle : {}}>
        {get(row, "full_name")}
      </span>
    ),
  },
  {
    title: "Points",
    dataKey: "bps",
    width: 150,
    flexGrow: 1,
    Cell: (row: any) => (
      <span
        style={
          isFooter(row)
            ? { ...footerRowStyle, ...(get(row, "bps") ? {} : hideTextStyle) }
            : {}
        }
      >
        {get(row, "bps") ? limitCarryDecimalPlaces(get(row, "bps")) : "-"}
      </span>
    ),
  },
  {
    title: "Gross Distribution",
    dataKey: "amount",
    width: 300,
    flexGrow: 2,
    Cell: (row: any) => {
     return isFooter(row)? <span style={{ ...footerRowStyle }}> {formatCurrencyWithTwoDecimals(get(row, "amount"))}</span> :
      <CurrencyInput
        name="amount"
        placeholder=""
        onChange={(name: any, value: any) => {
          handleUpdateField(row.allocation_id, { [name]: value });
        }}
        value={get(row, "amount")}
        additionalProps={{
          key: `${row.allocation_id}-amount`,
          isAllowed: (value: any) =>
            value?.value ? isAllowedDecimal(value.value, 11, 2) : true,
          style:{width:"-webkit-fill-available"}
        }}
      />
      },
  },

  {
    title: "Escrow ($)",
    dataKey: "escrow",
    width: 300,
    flexGrow: 2,
    Cell: (row: any) => {
      return isFooter(row)? <span style={{ ...footerRowStyle }}> {formatCurrencyWithTwoDecimals(get(row, "escrow",0))}</span> :
      <CurrencyInput
        name="escrow"
        placeholder=""
        onChange={(name: any, value: any) => {
          handleUpdateField(row.allocation_id, { [name]: value });
        }}
        value={get(row, "escrow")}
        additionalProps={{
          key: `${row.allocation_id}-escrow`,
          disabled: !Boolean(Number(get(row,"amount",0))),
          isAllowed: (value: any) =>
            row.amount ? (value?.value ? isAllowedDecimal(value.value, 11, 2) && decimalGreaterOrEqual(row.amount,value.value) : true) : false,
          style:{width:"-webkit-fill-available"}
        }}
      />
      },
  },
  {
    title: "Escrow %",
    dataKey: "escrow_percentage",
    width: 300,
    flexGrow: 2,
    Cell:(row:any)=>{
      return isFooter(row)? <span style={{ ...footerRowStyle,...hideTextStyle }}> {get(row, "escrow_percentage")}</span> :
      <FormTextFieldRow
      label=""
      placeholder="Escrow %"
      name="escrow_percentage"
      key= {`${row.allocation_id}-escrow_percentage`}
      disabled={!Boolean(Number(get(row,"amount",0)))}
      onChange={(e: any) => {
        const val = e.target.value;
        if (
          (isValidPositiveDecimal(val) && decimalLessOrEqual(val,'100')) ||
          val === ""
        )
        handleUpdateField(row.allocation_id, { escrow_percentage: val });
      }}
      value={get(row, "escrow_percentage")}
    />
    }
  },
  {
    title: "Net Distributions",
    dataKey: "net_distribution",
    width: 300,
    flexGrow: 2,
    Cell: (row: any) => (
      <span
        style={isFooter(row) ? footerRowStyle: {}}
      >
        {formatCurrencyWithTwoDecimals(Number(get(row,"net_distribution",0)),"USD","$0")}
      </span>
    ),
    fixed: "right",
  },
];

export const generateFooter = (allocationsList:any[])=>{
  return {
      full_name: "Total",
      amount: Number(getSumByProperty(allocationsList,'amount')).toFixed(2),
      escrow: Number(getSumByProperty(allocationsList,'escrow')).toFixed(2),
      net_distribution: Number(getSumByProperty(allocationsList,'net_distribution')).toFixed(2),
      isFooter:true
  }
}