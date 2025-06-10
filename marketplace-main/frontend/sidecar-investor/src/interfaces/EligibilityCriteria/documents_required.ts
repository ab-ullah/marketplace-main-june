export interface IDocumentOption {
  requirement_text: string;
  id: string;
}

export interface IUploadedDocument {
  document_name: string;
  document_id: string;
  extension: string;
  doc_id: number;
}

export interface IRequiredDocument {
  response_block_id: number;
  options: IDocumentOption[];
  documents: IUploadedDocument[];
}