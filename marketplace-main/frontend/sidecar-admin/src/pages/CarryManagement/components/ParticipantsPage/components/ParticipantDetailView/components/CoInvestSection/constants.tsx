import get from "lodash/get";
import { standardizeDate } from "../../../../../../../../utils/dateFormatting";
import { formatCurrencyWithTwoDecimals } from "../../../../../../../../utils/currency";
import { CSSProperties } from "react";

const isFooter = (row: any) => Boolean(get(row, "isFooter"));

const displayAmount = (row: any, dataKey: string, showUSD: boolean) => {
  const dat = get(row, dataKey);
  if (isFooter(row)) return dat;
  const rate = showUSD ? get(row, "currency.rate") : 1;
  const currencyCode = showUSD ? "USD" : get(row, "currency.code");

  return formatCurrencyWithTwoDecimals(
    (dat * rate),
    currencyCode
  );
};

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

export const getCoinvestColumns = (showUSD: boolean) => [
  {
    title: "Investment",
    fixed: "left",
    minWidth: 200,
    flexGrow: 1.3,
    dataKey: "fund_name",
    Cell: (row: any) => (
      <span style={isFooter(row) ? footerRowStyle : {}}>
        {get(row, "fund_name")}
      </span>
    ),
  },
  {
    title: "Equity Commitment Called to Date",
    dataKey: "equity_called",
    minWidth: 290,
    flexGrow: 1,
    Cell: (row: any) => (
      <span style={isFooter(row) ? footerRowStyle : {}}>
        {displayAmount(row, "equity_called", showUSD)}
      </span>
    ),
  },

  {
    title: "Distributions to Date",
    dataKey: "total_distributions",
    minWidth: 200,
    flexGrow: 1,
    Cell: (row: any) => (
      <span style={isFooter(row) ? footerRowStyle : {}}>
        {displayAmount(row, "total_distributions", showUSD)}
      </span>
    ),
  },
  {
    title: "Unrealized Gain/Loss",
    dataKey: "gain",
    minWidth: 200,
    flexGrow: 1,
    Cell: (row: any) => (
      <span style={isFooter(row) ? footerRowStyle : {}}>
        {displayAmount(row, "gain", showUSD)}
      </span>
    ),
  },
  {
    title: "Gross Share of NAV",
    dataKey: "nav_share",
    minWidth: 170,
    flexGrow: 1,
    Cell: (row: any) => (
      <span style={isFooter(row) ? footerRowStyle : {}}>
        {displayAmount(row, "nav_share", showUSD)}
      </span>
    ),
  },
  {
    title: "Net Equity",
    dataKey: "current_net_equity",
    minWidth: 150,
    flexGrow: 1,
    Cell: (row: any) => (
      <span style={isFooter(row) ? footerRowStyle : {}}>
        {displayAmount(row, "current_net_equity", showUSD)}
      </span>
    ),
  },
  {
    title: "Last NAV Update",
    dataKey: "latest_nav",
    minWidth: 150,
    flexGrow: 1,
    Cell: (row: any) => (
      <span
        style={isFooter(row) ? { ...footerRowStyle, ...hideTextStyle } : {}}
      >
        {get(row, "latest_nav") ? standardizeDate(get(row, "latest_nav")) : "-"}
      </span>
    ),
  },
  {
    title: "Currency",
    dataKey: "currency_code",
    minWidth: 100,
    flexGrow: 0.5,
    fixed: "right",
    Cell: (row: any) => (
      <span
        style={isFooter(row) ? { ...footerRowStyle, ...hideTextStyle } : {}}
      >
        {get(row, "currency_code")}
      </span>
    ),
  },
];

export const getCoinvestExportData = (data: any[], showUSD: boolean) => {
  return data.map((row) => ({
    ...row,
    equity_called: displayAmount(row, "equity_called", showUSD),
    total_distributions: displayAmount(row, "total_distributions", showUSD),
    gain: displayAmount(row, "gain", showUSD),
    nav_share: displayAmount(row, "nav_share", showUSD),
    current_net_equity: displayAmount(row, "current_net_equity", showUSD),
    latest_nav: get(row, "latest_nav") ? standardizeDate(get(row, "latest_nav")) : "-"
  }))
}
