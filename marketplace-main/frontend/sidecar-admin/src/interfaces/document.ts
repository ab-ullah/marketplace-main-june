export interface IDocument {
  deleted: boolean;
  name: string;
  id: string;
  doc_id: string;
  document_type: string;
}

export interface IDocumentDetail {
  title: string;
  document_id: string;
}