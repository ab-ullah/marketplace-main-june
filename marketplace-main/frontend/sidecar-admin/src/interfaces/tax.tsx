import {IDocumentDetail} from "./document";

export interface ITaxForm {
  form_id: string
  version: string
  file_name: string
  company: number
}

export interface ITaxDocument {
  id: number;
  tax_record: number;
  document: IDocumentDetail;
  deleted: boolean;
  completed: string;
  is_completed: boolean;
  form: ITaxForm;
}