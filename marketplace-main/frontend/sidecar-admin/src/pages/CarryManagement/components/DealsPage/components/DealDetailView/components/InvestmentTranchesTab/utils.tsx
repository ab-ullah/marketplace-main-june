import { formatCurrencyWithTwoDecimals } from "../../../../../../../../utils/currency";
import { standardizeDate } from "../../../../../../../../utils/dateFormatting";

export const columns = [
    {
        title: "Tranche Name",
        dataKey: "name",
        flexGrow: 0.5,
        minWidth: 250,
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
]