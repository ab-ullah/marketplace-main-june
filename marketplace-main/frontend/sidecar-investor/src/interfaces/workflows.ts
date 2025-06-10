import {IDocument} from "./EligibilityCriteria/criteria";
import {IRequiredDocument, IUploadedDocument} from "./EligibilityCriteria/documents_required";
import {IInvestmentAmount} from "./EligibilityCriteria/criteriaResponse";
import {ToolTipText} from "../components/ToolTip/interfaces";

export interface WorkflowAnswerPayload {
  [key: string]: string | null;
}

export interface Option {
  label: string;
  value: string | number;
}

export interface SelectTypeData {
  options?: Option[];
}

export interface CustomSelectTypeData {
  options: Option[];
}

export interface TextTypeData {
  placeholder?: string;
  pattern?: string;
  minLength?: number;
  maxLength?: number;
  multiline?: boolean;
  notAllowed?: string[];
}

export interface NumberTypeData {
  minLength?: number;
  maxLength?: number;
  exactLength?: number;
  min?: number;
  max?: number;
  placeholder?: string;
}

export interface DateTypeData {
  min?: string;
  max?: string;
  afterToday?: boolean;
}

export interface FileUploadTypeData {
  file_types?: string[];
  max_file_size?: number;
  filesLimit?: number;
  url?: string;
}

export interface SectionHeaderData {
  size?: 'small' | 'medium' | 'large';
}

export type FieldDependencyValueType = {
  'equals': string | number;
  'not_equals': string | number;
  'less_than': number | string;
  'greater_than': number | string;
  'in': string[];
  'not_in': string[];
}

export type FieldDependency<T> = {
  [DependencyType in keyof T]: {
    field: string;
    relation: DependencyType;
    value: T[DependencyType]
  }
}[keyof T]

export type AnswerTypes = {
  'custom-select': CustomSelectTypeData;
  'radio-select': CustomSelectTypeData;
  'checkbox': CustomSelectTypeData;
  'select-country': SelectTypeData;
  'text': TextTypeData;
  'currency': TextTypeData,
  'number': NumberTypeData;
  'date': DateTypeData;
  'file_upload': FileUploadTypeData;
  'eligibility_criteria_response': any;
  'investment_amount_response': any;
  'section_header': SectionHeaderData;
};

export type FieldDependencies = FieldDependency<FieldDependencyValueType>[];

export interface IResponseBlockDocument extends IDocument {
  response_block: number
}

export interface ISubAnswers {
  label: string;
  value: string;
}

export interface IEligibilityCriteriaAnswer {
  answer_values: string[],
  documents: IRequiredDocument[],
  approval_documents?: IUploadedDocument[],
  sub_answer_details?: ISubAnswers[],
}


export type Question<T> = {
  [AnswerType in keyof T]: {
    id: string;
    label: string;
    helpText?: string | ToolTipText;
    required?: boolean;
    submitted_answer?: IEligibilityCriteriaAnswer;
    investmentDetail?: IInvestmentAmount;
    disabled?: boolean;
    field_dependencies?: FieldDependencies;
    type: AnswerType;
    data: T[AnswerType]
  }
}[keyof T]

export type Schema = Question<AnswerTypes>[];

export interface Card {
  id: string;
  name: string;
  order: number;
  schema: Schema;
  is_repeatable?: true;
  card_dependencies?: FieldDependencies;
  kyc_investor_type_name?: string
}

export interface WorkFlow {
  cards: Card[];
  slug: string;
  name: string;
  type: number;
}

export type WorkFlowStatusTypes<StatusIds> = {
  [StatusCode in keyof StatusIds]: {
    id: StatusIds[StatusCode];
    code: StatusCode;
    label: string;
  }
}[keyof StatusIds]

export type Status = {
  CREATED: 1,
  SUBMITTED: 2,
  CHANGE_REQUESTED: 3,
  APPROVED: 4,
}

export type User = {
  display_name: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  full_name: string | null;
}

export type KYCRecordResponse = {
  id: number;
  status: number;
  user: any | User;
  uuid: string;
  workflow: any;
  kyc_participants: any;
  [key: string]: number | string | null;
}


export interface Comment {
  id: number;
  question_text: string;
  created_at: string;
  text: string;
  status: 1 | 2 | 3;
  module: number;
  module_id: number;
  question_identifier: string;
  document_identifier: string;
  company: number;
  commented_by: number;
  comment_for: number;
}

export interface KYCDocument {
  record_id: number;
  field_id: string;
  document: {
    title: string;
    document_id: string;
  }
}

export type WorkFlowStatus = WorkFlowStatusTypes<Status>;