export interface ICompanyDocumentDocument {
  title: string;
  document_id: string;
  id: number;
}

export interface ICompanyDocument {
  id: number;
  document: ICompanyDocumentDocument;
  deleted: boolean;
  name: string;
  description: string;
  required_once: boolean;
  require_signature: boolean;
  require_wet_signature: boolean;
  require_gp_signature: boolean;
  company: number;

}

export interface IApplicationCompanyDocument {
  id: number;
  company_document: ICompanyDocument
  signed_document: ICompanyDocumentDocument;
  is_acknowledged: boolean;
  completed: boolean;
  gp_signing_complete: boolean;
  envelope_id: string;
  deleted: boolean;
  application: number;
}
