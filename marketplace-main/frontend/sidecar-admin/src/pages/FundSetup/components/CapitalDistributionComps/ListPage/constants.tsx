import FormattedCurrency from "../../../../../utils/FormattedCurrency";
import { get } from "lodash";
import { Link } from "./styles";
import { standardizeDate } from "../../../../../utils/dateFormatting";
import { TAB_NAME as capitalCallsSection } from "../../CapitalCallsSection/constants";
import { TAB_NAME as distributionNoticesSection } from "../../DistributionNoticesSection/constants";

const formatCurrency = (row: any, column: string, symbol: string) => {
  const val = get(row, column, "");
  return (
    <>
      {val ? <FormattedCurrency value={val} symbol={symbol} /> : <span>-</span>}
    </>
  );
};

export const getCapitalCallColumns = (handleSelectRow: any) => [
  {
    title: "Created On",
    fixed: "left",
    dataKey: "created_timestamp",
    minWidth: 200,
    flexGrow: 1,
    Cell: (row: any) => <span>{standardizeDate(row.created_timestamp)}</span>,
  },
  {
    title: "Approved On",
    dataKey: "approved_at",
    minWidth: 200,
    flexGrow: 1,
    Cell: (row: any) => <span>{standardizeDate(row.approved_at)}</span>,
  },
  {
    title: "Total Capital Called",
    dataKey: "total_capital_called",
    minWidth: 200,
    flexGrow: 1,
    Cell: (row: any) =>
      formatCurrency(row, "total_capital_called", row?.currency?.symbol),
  },
  {
    title: "Amount Received",
    dataKey: "total_amount_received",
    minWidth: 200,
    flexGrow: 1,
    Cell: (row: any) =>
      formatCurrency(row, "total_amount_received", row?.currency?.symbol),
  },
  {
    title: "",
    dataKey: "action",
    fixed: "right",
    minWidth: 153,
    flexGrow: 1,
    Cell: (row: any) => (
      <Link onClick={() => handleSelectRow(row)}>View Details</Link>
    ),
  },
];

export const getDistributionNoticesColumns = (handleSelectRow: any) => [
  {
    title: "Created On",
    fixed: "left",
    dataKey: "created_timestamp",
    minWidth: 200,
    flexGrow: 1,
    Cell: (row: any) => <span>{standardizeDate(row.created_timestamp)}</span>,
  },
  {
    title: "Approved On",
    dataKey: "approved_at",
    minWidth: 200,
    flexGrow: 1,
    Cell: (row: any) => <span>{standardizeDate(row.approved_at)}</span>,
  },
  {
    title: "Total Distributed",
    dataKey: "total_distributed",
    minWidth: 200,
    flexGrow: 1,
    Cell: (row: any) =>
      formatCurrency(row, "total_distributed", row?.currency?.symbol),
  },
  {
    title: "",
    dataKey: "action",
    fixed: "right",
    minWidth: 153,
    flexGrow: 1,
    Cell: (row: any) => (
      <Link onClick={() => handleSelectRow(row)}>View Details</Link>
    ),
  },
];

export const getColumns = (section: string, handleSelectRow: any) => {
  switch (section) {
    case capitalCallsSection:
      return getCapitalCallColumns(handleSelectRow);
    case distributionNoticesSection:
      return getDistributionNoticesColumns(handleSelectRow);
    default:
      break;
  }
};
