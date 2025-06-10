import {IBlock} from "./blocks";
import {Option} from "react-select/src/filters";
import {IDocument} from "../FundMarketingPage/fundMarketingPage";
import {ISelectOption} from "../form";
import { ISmartBlock } from "../../interfaces/EligibilityCriteria/blocks";
import {IReactTag} from "../ReactTags";

interface ISelectedRegion {
  country_codes: string[]
}

interface ISelectedRegion {
  country_codes: string[]
}

export interface IEligibilityCriteria {
  id: number;
  selected_region_country_codes: ISelectedRegion;
  is_publishable: boolean;
  status: number;
  status_name: string;
  creator_name: string;
  last_modified: string;
  name: string;
}

export interface ICriteriaBlock {
  id: number;
  block: IBlock;
  position: number;
  criteria: number;
  is_final_step: boolean;
  is_user_documents_step: boolean;
  is_country_selector: boolean;
  is_custom_logic_block: boolean;
  is_intro_step?: boolean;
  is_investor_type_selector: boolean;
  block_connected_to: IConnector[];
  payload: any;
  criteria_block_documents: IDocument[]
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
  countries: Option[];
  fund: number;
  workflow: number;
  is_publishable: boolean;
  has_requested_review: boolean;
  is_published: boolean;
  has_requested_changes: boolean;
  is_creator: boolean;
  fund_name: string;
  fund_slug: string;
  fund_external_id: string;
  expression_override?: string
  custom_expression: null | IReactTag[]
  has_custom_logic_block?: boolean
  smart_canvas_payload: {
    nodes: [],
    edges: []
  }
  is_smart_criteria: boolean
}

export interface IApplicantInfo {
  firstName: string;
  lastName: string;
  jobTitle: string;
  department: null | ISelectOption;
  jobBand: null | ISelectOption;
  entityType: null | ISelectOption;
  officeLocation: null | ISelectOption;
}