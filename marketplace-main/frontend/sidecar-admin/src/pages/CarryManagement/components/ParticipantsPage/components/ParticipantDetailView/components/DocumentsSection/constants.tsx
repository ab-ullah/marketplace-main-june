import FilePreviewModal from "../../../../../../../../components/FilePreviewModal";
import { ICarryDocument } from "../../../../../../../../interfaces/carryManagement";
import { getPillColor } from "../../../../../../constants";
import { StatusPill } from "../../../../../styles";
import truncate from "lodash/truncate";

export const getDocumentsColumns = (hasEntity: boolean) => {
    let columns = [
        {
            title: "Document",
            fixed: "left",
            dataKey: "name",
            minWidth: 200,
            flexGrow: 1,
            isSortable: true,
            Cell: (row: ICarryDocument) => (
                <span
                    style={{
                        cursor: "pointer",
                        fontWeight: 900,
                        textDecoration: "underline",
                    }}
                >
            <FilePreviewModal
                documentId={row.completed ? `${row.signed_document?.document_id}` : `${row.document.document_id}`}
                documentName={row.document.title}
                showPreviewIcon={false}
                callbackPreviewFile={() => {
                }}
                callbackDownloadFile={() => {
                }}
                customDisplayButton={<div style={{cursor: 'pointer'}}>{truncate(row.document.title)}</div>}
            />
          </span>
            ),
        },
        {
            title: "Description",
            minWidth: 170,
            flexGrow: 1.25,
            Cell: (row: ICarryDocument) => (
                <span>{row.carry_document_description}</span>
            ),
        },
        {
            title: "Requirements",
            minWidth: 150,
            flexGrow: .8,
            Cell: (row: ICarryDocument) => (
                <StatusPill color={getPillColor(row.status)}>
                    {row.status}
                </StatusPill>
            ),
        },
        {
            title: "Type",
            minWidth: 150,
            flexGrow: .8,
            Cell: (row: ICarryDocument) => <span>{row.document_type_display}</span>,
        },
    ]
    if(hasEntity){
        columns.splice(0, 0,
            {
                title: "Entity",
                fixed: "left",
                minWidth: 150,
                dataKey: "display_name",
                flexGrow: .8,
                isSortable: true,
                Cell: (row: any) => <span>{row.display_name}</span>,
            },)
    }
    return columns
};
