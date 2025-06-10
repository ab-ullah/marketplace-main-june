import {standardizeDate} from "../../../utils/dateFormatting";
import {formatCurrencyWithTwoDecimals, limitCarryDecimalPlaces} from "../../../utils/currency";
import { ICarryAllocationDocument } from "./types";
import FilePreviewModal from "../../../components/FilePreviewModal";
import { StatusPill } from "../styles";
import { getPillColor } from "../constants";

export const DISTRIBUTION_COLUMNS = [
  {
    title: "Date",
    fixed: "left",
    dataKey: "date",
    Cell: (row: any) => (
      <>
        {standardizeDate(row.date)}
      </>
    ),
    minWidth: 150,
    flexGrow: 1,
  },
  {
    title: "Source",
    dataKey: "source",
    minWidth: 150,
    flexGrow: 1,
  },
  {
    title: "Amount",
    dataKey: "amount",
    minWidth: 150,
    flexGrow: 1,
    Cell: (row: any) => <span>{formatCurrencyWithTwoDecimals(row.amount)}</span>,
  },
  {
    title: "Escrow",
    dataKey: "escrow",
    minWidth: 150,
    flexGrow: 1,
    Cell: (row: any) => <span>{formatCurrencyWithTwoDecimals(row.escrow)}</span>,
  },
  {
    title: "Escrow %",
    dataKey: "escrow_percentage",
    minWidth: 150,
    flexGrow: 1,
    Cell: (row: any) => <>{`${limitCarryDecimalPlaces(row.escrow_percentage)}%`}</>,
  }
]


export const ACTION_COLUMNS = [
  {
    title: "Date",
    fixed: "left",
    dataKey: "date",
    Cell: (row: any) => (
      <>
        {standardizeDate(row.date)}
      </>
    ),
    minWidth: 150,
    flexGrow: 1,
  },
  {
    title: "Event Type",
    dataKey: "event_type",
    minWidth: 150,
    flexGrow: 1,
    Cell: (row: any) => {
      if (row.is_total_row) {
        return <b>{row.event_type}</b>
      }
      return <>
        {row.event_type}
      </>
    },
  },
  {
    title: "Change in Points",
    dataKey: "change",
    minWidth: 150,
    flexGrow: 1,
    Cell: (row: any) => {
      if (row.is_total_row) {
        return <b>{limitCarryDecimalPlaces(row.change)}</b>
      }
      return <>
        {limitCarryDecimalPlaces(row.change)}
      </>
    },
  },
  {
    title: "Total Points",
    dataKey: "total",
    minWidth: 150,
    flexGrow: 1,
    Cell: (row: any) => {
      return <>
        {row.total ? limitCarryDecimalPlaces(row.total) : ''}
      </>
    },
  },
]

export const getDocumentsColumns = () => [
  {
    title: "Document",
    fixed: "left",
    dataKey: "name",
    minWidth: 200,
    flexGrow: 1,
    isSortable: true,
    Cell: (row: ICarryAllocationDocument) => (
      <span
        style={{
          cursor: "pointer",
          textDecoration: "underline",
        }}
      >
        <FilePreviewModal
          documentId={`${row.document.document_id}`}
          documentName={row.document.title}
          showPreviewIcon={false}
          callbackPreviewFile={() => { }}
          callbackDownloadFile={() => { }}
          showAsButton={false}
          showDownloadIcon={false}
          dotted={false}
        />
      </span>
    ),
  },
  {
    title: "Recipient",
    dataKey: "display_name",
    minWidth: 170,
    flexGrow: 1.25,
    Cell: (row: ICarryAllocationDocument) => (
      <span>{row.display_name}</span>
    ),
  },
  {
    title: "Description",
    dataKey: "carry_document_description",
    minWidth: 170,
    flexGrow: 1.25,
    Cell: (row: ICarryAllocationDocument) => (
      <span>{row.carry_document_description}</span>
    ),
  },
  {
    title: "Requirements",
    dataKey: "status",
    minWidth: 150,
    flexGrow: .8,
    Cell: (row: ICarryAllocationDocument) => (
      <StatusPill color={getPillColor(row.status)}>
        {row.status}
      </StatusPill>
    ),
  },
  {
    title: "Type",
    dataKey: "document_type_display",
    minWidth: 150,
    flexGrow: .8,
    Cell: (row: ICarryAllocationDocument) => <span>{row.document_type_display}</span>,
  },
];