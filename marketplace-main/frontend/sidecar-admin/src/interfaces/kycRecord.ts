import {IDocumentDetail} from "./document";

export interface IKycRecordDocument {
  id: number;
  document: IDocumentDetail
  kyc_record_file_id: string;
  deleted: boolean;
}

export interface IKycRecord {
  id: number;
  display_name: string;
  kyc_documents: IKycRecordDocument[];
  id_document_type: number;
  id_issuing_country: number;
  id_expiration_date: string;
  number_of_id: string;
  uuid: string;
}