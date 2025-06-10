import FilePreviewModal from "../../../../../components/FilePreviewModal";
import {ColumnDiv} from "../styles";
import DocumentAction from "../DocumentAction";
import {IApplicationCompanyDocument} from "../../../../../interfaces/companyDocument";

export const getDocumentTableColumns = (updateDocument: (applicationDocumentId: number, payload: any) => void) => [
  {
    title: "Document Type",
    flexGrow: 1.5,
    minWidth: 100,
    Cell: (row: IApplicationCompanyDocument) => (
      <ColumnDiv>
        {row.company_document.name}
      </ColumnDiv>
    ),
  },
  {
    title: "Document Name",
    dataKey: "name",
    flexGrow: 1.5,
    minWidth: 250,
    Cell: (row: IApplicationCompanyDocument) => {
      if (!row.completed) {
        return <>(Pending) {row.company_document.name}</>
      }

      const previewDocument = row.signed_document ? row.signed_document : row.company_document.document

      return <ColumnDiv>
        <FilePreviewModal
          key={previewDocument.document_id}
          documentId={previewDocument.document_id}
          documentName={`${row.deleted ? '(Deleted) ' : ''}${row.company_document.name}`}
        />
      </ColumnDiv>
    },
  },
  {
    title: "Actions",
    dataKey: "actions",
    flexGrow: 1,
    Cell: (row: IApplicationCompanyDocument) => {
      return <DocumentAction
        title={row.company_document.name}
        deleted={row.deleted}
        updateDocument={(payload: any) => updateDocument(row.id, payload)}
      />
    },
  },
]

export const getCompanyDocumentOptions = (applicationProgramDocuments: IApplicationCompanyDocument[]) => {
  return applicationProgramDocuments.map(
    (applicationDocument) => {
      return {
        label: applicationDocument.company_document.name,
        value: applicationDocument.company_document.id.toString()
      }
    })
}