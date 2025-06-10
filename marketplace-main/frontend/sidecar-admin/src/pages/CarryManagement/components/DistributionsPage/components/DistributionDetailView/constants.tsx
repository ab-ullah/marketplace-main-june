import { formatCurrencyWithTwoDecimals } from "../../../../../../utils/currency";
import { limitCarryDecimalPlaces } from "../../../../../../utils/getValue";

export const getColumns = () => [
  {
    title: "Participant",
    dataKey: "full_name",
    width: 150,
    flexGrow: 1,
    Cell: (row: any) => <span>{row.full_name}</span>,
    fixed: "left",
  },
  {
    title: "Points",
    dataKey: "points",
    width: 150,
    flexGrow: 1,
    Cell: (row: any) => <span>{limitCarryDecimalPlaces(row.points)}</span>,
  },
  {
    title: "Gross Distribution",
    dataKey: "amount",
    width: 150,
    flexGrow: 1,
    Cell: (row: any) => <span>{formatCurrencyWithTwoDecimals(row.amount)}</span>,
  },
  {
    title: "Carry in Escrow",
    dataKey: "escrow",
    width: 150,
    flexGrow: 1,
    Cell: (row: any) => <span>{formatCurrencyWithTwoDecimals(row.escrow)}</span>,
  },
  {
    title: "Net Distribution",
    dataKey: "net_distribution",
    width: 150,
    flexGrow: 1,
    Cell: (row: any) => (
      <span>{formatCurrencyWithTwoDecimals(row.net_distribution)}</span>
    ),
  },
  {
    title: "% Escrow",
    dataKey: "escrow_percentage",
    width: 150,
    flexGrow: 1,
    Cell: (row: any) => (
      <span>{limitCarryDecimalPlaces(row.escrow_percentage)} %</span>
    ),
  },
];
