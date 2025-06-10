import { carryTooltip } from "../../../../../../interfaces/company";
import {formatCurrencyWithTwoDecimals} from "../../../../../../utils/currency";
import { standardizeDate } from "../../../../../../utils/dateFormatting";

export const getColumns = (onSelectTranche:any) => [
    {
      title: "Investment Tranche Name",
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
          onClick={()=>onSelectTranche(row)}
        >
          {row.name}
        </span>
      ),
    },
    {
        title: "Deal",
        dataKey: "deal_name",
        minWidth: 150,
        flexGrow: 1,
        Cell: (row: any) => (
          <span>{row.deal_name? row.deal_name : '-'}</span>
        ),
      },
    {
      title: "Estimated Value",
      dataKey: "estimated_value",
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
    }
  ];