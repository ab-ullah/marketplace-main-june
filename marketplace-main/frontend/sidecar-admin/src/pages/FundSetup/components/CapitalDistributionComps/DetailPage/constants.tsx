import FormattedCurrency from "../../../../../utils/FormattedCurrency";
import { get } from "lodash";
import { CSSProperties } from "react";
import { DocTile } from "./styles";
import FilePreviewModal from "../../../../../components/FilePreviewModal";
import { TAB_NAME as capitalCallsSection } from "../../CapitalCallsSection/constants";
import { TAB_NAME as distributionNoticesSection } from "../../DistributionNoticesSection/constants";

const footerRowStyle = {
  borderTop: "1px solid black",
  position: "absolute",
  top: "0px",
  padding: "8px",
  width: "100%",
  fontWeight: 700,
  fontSize: "16px",
  lineHeight: "20px",
} as CSSProperties;

const isFooter = (row: any) => get(row, "isFooter") === true;

const formatCurrency = (row: any, column: string, symbol: string) => {
  const val = get(row, column, "");
  return (
    <span style={isFooter(row) ? footerRowStyle : {}}>
      {val ? <FormattedCurrency value={val} symbol={symbol} /> : <span>-</span>}
    </span>
  );
};

const DocLink = ({ doc }: any) => {
  return (
    <DocTile>
      <FilePreviewModal
        documentId={doc.document_id}
        documentName={doc.title}
        noCell={true}
      />
    </DocTile>
  );
};

export const capitalCallModalText = {
  title: {
    confirmed: "Capital calls notices have been sent to investors",
    notConfirmed: "Please Confirm",
  },
  description: {
    confirmed: "Investors will be notified to review.",
    notConfirmed:
      "You have reviewed the Capital Calls and are ready to issue the Capital Call Notices to investors.",
  },
};

export const distributionNoticesModalText = {
  title: {
    confirmed: "Distrubutions have been processed ",
    notConfirmed: "Please Confirm",
  },
  description: {
    confirmed: "Statements have been sent to investors.",
    notConfirmed:
      "You have reviewed all distributions and are ready to issue distributions to investors",
  },
};

export const ConfirmationModalText = {
  [capitalCallsSection]: capitalCallModalText,
  [distributionNoticesSection]: distributionNoticesModalText,
};

export const TOOLTIP =
  "The documents are being generated, please come back later to approve.";

export const getCapitalCallColumns = () => [
  {
    title: "First Name",
    fixed: "left",
    dataKey: "user.first_name",
    minWidth: 130,
    flexGrow: 1,
    Cell: (row: any) => (
      <span style={isFooter(row) ? footerRowStyle : {}}>
        {get(row, "user.first_name")}
      </span>
    ),
  },
  {
    title: "Last Name",
    dataKey: "user.last_name",
    minWidth: 130,
    flexGrow: 1,
    Cell: (row: any) => (
      <span style={isFooter(row) ? footerRowStyle : {}}>
        {get(row, "user.last_name")}
      </span>
    ),
  },
  {
    title: "Capital Call Amount",
    dataKey: "amount",
    minWidth: 170,
    flexGrow: 1,
    Cell: (row: any) => formatCurrency(row, "amount", row?.currency?.symbol),
  },
  {
    title: "Investments",
    dataKey: "investment",
    minWidth: 150,
    flexGrow: 1,
    Cell: (row: any) =>
      formatCurrency(row, "investment", row?.currency?.symbol),
  },
  {
    title: "Management Fees",
    dataKey: "management_fees",
    minWidth: 160,
    flexGrow: 1,
    Cell: (row: any) =>
      formatCurrency(row, "management_fees", row?.currency?.symbol),
  },
  {
    title: "Organization Cost",
    dataKey: "organization_cost",
    minWidth: 160,
    flexGrow: 1,
    Cell: (row: any) =>
      formatCurrency(row, "organization_cost", row?.currency?.symbol),
  },
  {
    title: "Fund Expenses",
    dataKey: "fund_expenses",
    minWidth: 150,
    flexGrow: 1,
    Cell: (row: any) =>
      formatCurrency(row, "fund_expenses", row?.currency?.symbol),
  },
  {
    title: "Total Capital Called To Date",
    dataKey: "total_to_date",
    minWidth: 230,
    flexGrow: 1,
    Cell: (row: any) =>
      formatCurrency(row, "total_to_date", row?.currency?.symbol),
  },
  {
    title: "Amount Received",
    dataKey: "amount_received",
    minWidth: 150,
    flexGrow: 1,
    Cell: (row: any) =>
      formatCurrency(row, "amount_received", row?.currency?.symbol),
  },
  {
    title: "Capital Call Notice",
    dataKey: "docs",
    fixed: "right",
    minWidth: 200,
    flexGrow: 1,
    Cell: (row: any) =>
      isFooter(row) ? (
        <span style={footerRowStyle}></span>
      ) : get(row, "notice") ? (
        <DocLink
          style={isFooter(row) ? footerRowStyle : {}}
          docName={get(row, "notice.title")}
          doc={get(row, "notice")}
          // handleDownloadDoc={handleDownloadDoc}
        />
      ) : (
        <span>N/A</span>
      ),
  },
];
export const getDistributionNoticesColumns = () => [
  {
    title: "First Name",
    fixed: "left",
    dataKey: "user.first_name",
    minWidth: 130,
    flexGrow: 1,
    Cell: (row: any) => (
      <span style={isFooter(row) ? footerRowStyle : {}}>
        {get(row, "user.first_name")}
      </span>
    ),
  },
  {
    title: "Last Name",
    dataKey: "user.last_name",
    minWidth: 130,
    flexGrow: 1,
    Cell: (row: any) => (
      <span style={isFooter(row) ? footerRowStyle : {}}>
        {get(row, "user.last_name")}
      </span>
    ),
  },
  {
    title: "Gross Distribution",
    dataKey: "investments",
    minWidth: 170,
    flexGrow: 1,
    Cell: (row: any) =>
      formatCurrency(row, "investments", row?.currency?.symbol),
  },
  {
    title: "Ownership %",
    dataKey: "ownership",
    minWidth: 150,
    flexGrow: 1,
    Cell: (row: any) => (
      <span style={isFooter(row) ? footerRowStyle : {}}>
        {isFooter(row)
          ? ''
          : `${get(row, "ownership")} %`}
      </span>
    ),
  },
  {
    title: "Management Fees",
    dataKey: "management_fees",
    minWidth: 160,
    flexGrow: 1,
    Cell: (row: any) =>
      formatCurrency(row, "management_fees", row?.currency?.symbol),
  },
  {
    title: "Organization Cost",
    dataKey: "organization_cost",
    minWidth: 160,
    flexGrow: 1,
    Cell: (row: any) =>
      formatCurrency(row, "organization_cost", row?.currency?.symbol),
  },
  {
    title: "Fund Expenses",
    dataKey: "fund_expenses",
    minWidth: 150,
    flexGrow: 1,
    Cell: (row: any) =>
      formatCurrency(row, "fund_expenses", row?.currency?.symbol),
  },
  {
    title: "Distribution Amount",
    dataKey: "amount",
    minWidth: 150,
    flexGrow: 1,
    Cell: (row: any) => formatCurrency(row, "amount", row?.currency?.symbol),
  },
  {
    title: "Total Distributions To Date ",
    dataKey: "total_to_date",
    minWidth: 230,
    flexGrow: 1,
    Cell: (row: any) =>
      formatCurrency(row, "total_to_date", row?.currency?.symbol),
  },
  {
    title: "Distribution Notice",
    dataKey: "docs",
    fixed: "right",
    minWidth: 200,
    flexGrow: 1,
    Cell: (row: any) =>
      isFooter(row) ? (
        <span style={footerRowStyle}></span>
      ) : get(row, "document") ? (
        <DocLink
          style={isFooter(row) ? footerRowStyle : {}}
          docName={get(row, "document.title")}
          doc={get(row, "document")}
        />
      ) : (
        <span>N/A</span>
      ),
  },
];

export const getColumns = (section: string) => {
  switch (section) {
    case capitalCallsSection:
      return getCapitalCallColumns();
    case distributionNoticesSection:
      return getDistributionNoticesColumns();
    default:
      break;
  }
};
