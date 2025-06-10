import FilePreviewModal from "../../../../../components/FilePreviewModal";
import {ColumnDiv} from "../styles";
import DocumentAction from "../DocumentAction";
import {ITaxDocument, ITaxForm} from "../../../../../interfaces/tax";

export const getDocumentTableColumns = (updateDocument: (kycDocumentId: number, payload: any) => void) => [
  {
    title: "Document Type",
    flexGrow: 1.5,
    minWidth: 100,
    Cell: (row: ITaxDocument) => (
      <ColumnDiv>
        {row.form.form_id}
      </ColumnDiv>
    ),
  },
  {
    title: "Document Name",
    dataKey: "name",
    flexGrow: 1.5,
    minWidth: 250,
    Cell: (row: ITaxDocument) => (
      <ColumnDiv>
        {row.is_completed ? <FilePreviewModal
          key={row.document.document_id}
          documentId={row.document.document_id}
          documentName={`${row.deleted ? '(Deleted) ' : ''}${row.document.title}`}
        /> : <>(Pending) {row.document.title}</>}
      </ColumnDiv>
    ),
  },
  {
    title: "Actions",
    dataKey: "actions",
    flexGrow: 1,
    Cell: (row: ITaxDocument) => {
      return <DocumentAction
        title={row.document.title}
        deleted={row.deleted}
        updateDocument={(payload: any) => updateDocument(row.id, payload)}
      />
    },
  },
]


export const getTaxFormOptions = (taxForms: ITaxForm[]) => taxForms.map((taxForm) => ({
  label: taxForm.form_id,
  value: taxForm.form_id
}))