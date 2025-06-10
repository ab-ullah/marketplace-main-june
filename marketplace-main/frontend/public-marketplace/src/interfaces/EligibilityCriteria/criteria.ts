import {IBlock, ISmartBlock} from "./blocks";
import {Option} from "react-select/src/filters";


export interface IDocument {
  id?: number;
  document_name: string;
  document_id: string;
  extension: string;
  doc_id: number;
}

export interface IEligibilityCriteria {
  id: number;
  name: string;
  description: string;
  status_name: string;
  creator_name: string;
  last_modified: string;
}

export interface ICriteriaBlock {
  id: number;
  block: IBlock;
  position: number;
  criteria: number;
  is_final_step: boolean;
  is_user_documents_step: boolean;
  is_custom_logic_block: boolean;
  is_country_selector: boolean;
  is_intro_step?: boolean;
  is_investor_type_selector: boolean;
  block_connected_to: IConnector[];
  payload: any;
  criteria_block_documents: IDocument[];
  custom_block: null | ISmartBlock;
}

export interface IConnector {
  id: number;
  condition: string;
}

export interface IEligibilityCriteriaDetail {
  id: number;
  name: string;
  description: string;
  criteria_blocks: ICriteriaBlock[];
  selectedAnswer?: any;
  countries?: Option[];
  fund: number;
  workflow: number;
  is_publishable: boolean;
  has_requested_review: boolean;
  is_published: boolean;
  has_requested_changes: boolean;
  is_creator: boolean;
}