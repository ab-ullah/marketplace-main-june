import {IKycRecordDocument} from "../../../../../interfaces/kycRecord";
import FilePreviewModal from "../../../../../components/FilePreviewModal";
import {ColumnDiv} from "../styles";
import get from "lodash/get";
import DocumentAction from "../DocumentAction";

export const getDocumentTableColumns = (updateDocument: (kycDocumentId: number, payload: any) => void, mapping: any) => [
  {
    title: "Document Type",
    dataKey: "kyc_record_file_id",
    flexGrow: 1.5,
    minWidth: 100,
    Cell: (row: IKycRecordDocument) => (
      <ColumnDiv>
        {get(mapping, row.kyc_record_file_id)}
      </ColumnDiv>
    ),
  },
  {
    title: "Document Name",
    dataKey: "name",
    flexGrow: 1.5,
    minWidth: 250,
    Cell: (row: IKycRecordDocument) => (
      <ColumnDiv>
        <FilePreviewModal
          documentId={row.document.document_id}
          documentName={`${row.deleted ? '(Deleted) ' : ''}${row.document.title}`}
        />
      </ColumnDiv>
    ),
  },
  {
    title: "Actions",
    dataKey: "actions",
    flexGrow: 1,
    Cell: (row: IKycRecordDocument) => {
      return <DocumentAction
        title={row.document.title}
        deleted={row.deleted}
        updateDocument={(payload: any) => updateDocument(row.id, payload)}
      />
    },
  },
]