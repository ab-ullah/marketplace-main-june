import { carryTooltip } from "../../../../../../interfaces/company";
import {formatCurrencyWithTwoDecimals} from "../../../../../../utils/currency";
import { standardizeDate } from "../../../../../../utils/dateFormatting";
import { getTooltip } from "../../../FundsPage/components/FundsListView/constants";

export const getColumns = (handleSelectDealToView:any, tooltips: carryTooltip[]) => [
    {
      title: "Deal Name",
      fixed: "left",
      dataKey: "name",
      minWidth: 200,
      flexGrow: 1.3,
      Cell: (row: any) => (
        <span
          style={{
            cursor: "pointer",
            fontWeight: 900,
            textDecoration: "underline",
          }}
          onClick={()=>handleSelectDealToView(row.id)}
        >
          {row.name}
        </span>
      ),
    },
    {
      title: "Carry Plan",
      dataKey: "carry_plan_name",
      minWidth: 200,
      flexGrow: 1.3,
      Cell: (row: any) => (
        <span >
          {row.carry_plan_name}
        </span>
      ),
    },
    {
      title: "Fund Name",
      dataKey: "fund_name",
      minWidth: 200,
      flexGrow: 1.3,
    },
    {
      title: "Estimated Value",
      dataKey: "estimated_value",
      tooltip: getTooltip('estimated_value', tooltips),
      minWidth: 150,
      flexGrow: 1,
      Cell: (row: any) => (
        <span>{formatCurrencyWithTwoDecimals(row.estimated_value)}</span>
      ),
    },
    {
      title: "Estimated Value As Of",
      dataKey: "estimated_value_date",
      minWidth: 150,
      flexGrow: 1,
      Cell: (row: any) => <span>{row.estimated_value_date ? standardizeDate(row.estimated_value_date) : '-'}</span>,
    },
    {
        title: "Fair Market Value",
        dataKey: 'fair_market_value',
        tooltip: getTooltip('fair_market_value', tooltips),
        minWidth: 150,
        flexGrow: 1,
        Cell: (row: any) => (
            <span>{formatCurrencyWithTwoDecimals(row.fair_market_value)}</span>
        ),
    },
    {
      title: "Fair Market Value As Of",
      dataKey: "fair_market_value_date",
      minWidth: 150,
      flexGrow: 1,
      Cell: (row: any) => <span>{row.fair_market_value_date ? standardizeDate(row.fair_market_value_date) : '-'}</span>,
    },
    {
        title: "Distributions",
        dataKey: 'distributions',
        minWidth: 150,
        flexGrow: 1,
        Cell: (row: any) => (
            <span>{formatCurrencyWithTwoDecimals(row.distributions)}</span>
        ),
    }
  ];