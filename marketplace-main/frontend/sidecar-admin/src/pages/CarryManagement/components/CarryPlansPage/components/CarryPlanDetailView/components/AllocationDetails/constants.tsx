import {standardizeDate} from "../../../../../../../../utils/dateFormatting";
import {formatCurrencyWithTwoDecimals} from "../../../../../../../../utils/currency";
import { limitCarryDecimalPlaces } from "../../../../../../../../utils/getValue";
import {TotalDiv} from "../../../CarryPlanModal/styles";
import { ICarryAllocationDocument } from "./types";
import FilePreviewModal from "../../../../../../../../components/FilePreviewModal";
import { StatusPill } from "../../../../../styles";
import { getPillColor } from "../../../../../../constants";
import get from "lodash/get";

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
        minWidth: 150,
        flexGrow: 1,
        Cell: (row: any) => <span>{formatCurrencyWithTwoDecimals(row.amount)}</span>,
    },
    {
        title: "Escrow",
        minWidth: 150,
        flexGrow: 1,
        Cell: (row: any) => <span>{formatCurrencyWithTwoDecimals(row.escrow)}</span>,
    },
    {
        title: "Escrow %",
        dataKey: "escrow_percentage",
        minWidth: 150,
        flexGrow: 1,
        Cell: (row: any) => <>{`${row.escrow_percentage}%`}</>,
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
                return <TotalDiv>{row.event_type}</TotalDiv>
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
            const change = get(row,'change')

            if (row.is_total_row) {
                return <TotalDiv>{limitCarryDecimalPlaces(change)}</TotalDiv>
            }
            return <>
                {limitCarryDecimalPlaces(change)}
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
        Cell: (row: ICarryAllocationDocument) => (
            <span
                style={{
                    cursor: "pointer",
                    fontWeight: 900,
                    textDecoration: "underline",
                }}
            >
              <FilePreviewModal
                  documentId={`${row.document.document_id}`}
                  documentName={row.document.title}
                  showPreviewIcon={false}
                  callbackPreviewFile={() => {}}
                  callbackDownloadFile={() => {}}
                  customDisplayButton={row.document.title}
              />
            </span>
        ),
    },
    {
        title: "Recipient",
        minWidth: 170,
        flexGrow: 1.25,
        Cell: (row: ICarryAllocationDocument) => (
            <span>{row.display_name}</span>
        ),
    },
    {
        title: "Description",
        minWidth: 170,
        flexGrow: 1.25,
        Cell: (row: ICarryAllocationDocument) => (
            <span>{row.carry_document_description}</span>
        ),
    },
    {
        title: "Requirements",
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
        minWidth: 150,
        flexGrow: .8,
        Cell: (row: ICarryAllocationDocument) => <span>{row.document_type_display}</span>,
    },
];

