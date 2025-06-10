import { formatCurrencyWithTwoDecimals } from "../../../../../../utils/currency";
import { standardizeDate } from "../../../../../../utils/dateFormatting";

export const getColumns = (handleSelectDistToView: any) => [
  {
    title: "Date",
    dataKey: "date",
    width: 150,
    flexGrow: 1,
    Cell: (row: any) => <span>{standardizeDate(row.date)}</span>,
    fixed: "left",
  },
  {
    title: "Source",

    dataKey: "source",
    width: 150,
    flexGrow: 1,
    Cell: (row: any) => (
      <span
        style={{ cursor: "pointer", textDecoration:'underline' }}
        onClick={() => handleSelectDistToView(row.id)}
      >
        {row.source}
      </span>
    ),
  },
  {
    title: "Amount",
    dataKey: "amount",
    width: 150,
    flexGrow: 1,
    Cell: (row: any) => <span>{formatCurrencyWithTwoDecimals(row.amount)}</span>,
  },
  {
    title: "Escrow",
    dataKey: "escrow",
    width: 150,
    flexGrow: 1,
    Cell: (row: any) => <span>{formatCurrencyWithTwoDecimals(row.escrow)}</span>,
  },
];
