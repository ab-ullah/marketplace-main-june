import { formatCurrencyWithTwoDecimals } from "../../../../../../../../utils/currency";

export const getColumns = () => [
    {
      title: "Source",
      fixed: "left",
      dataKey: "source_name",
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