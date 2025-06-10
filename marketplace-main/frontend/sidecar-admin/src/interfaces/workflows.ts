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

export type FieldDependencyValueType = {
  'equals': string | number;
  'not_equals': string | number;
  'less_than': number | string;
  'greater_than': number | string;
  'in': string[];
  'not_in': string[];
}

export type FieldDependency<T> = { [DependencyType in keyof T]: {
  field: string;
  relation: DependencyType;
  value: T[DependencyType]
} }[keyof T]

export type AnswerTypes = {
  'custom-select': CustomSelectTypeData;
  'radio-select': CustomSelectTypeData;
  'checkbox': CustomSelectTypeData;
  'select-country': SelectTypeData;
  'text': TextTypeData;
  'number': NumberTypeData;
  'date': DateTypeData;
  'file_upload': FileUploadTypeData;
  'section_header': {};
};

export type FieldDependencies = FieldDependency<FieldDependencyValueType>[];

export type Question<T> = { [AnswerType in keyof T]: {
  id: string;
  label: string;
  description: string;
  helpText?: string;
  required?: boolean;
  field_dependencies?: FieldDependencies;
  type: AnswerType;
  data: T[AnswerType];
  submitted_answer: any;
} }[keyof T]

export type Schema = Question<AnswerTypes>[];

export interface Card {
  id: string;
  name: string;
  order: number;
  schema: Schema;
  kyc_investor_type_name?: string;
  is_repeatable: boolean;
}

export interface WorkFlow {
  cards: Card[];
  fund: number;
  slug: string;
  name: string;
  type: number;
  id: number;
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

export type DocumentAnswer = {
  title: string; 
  document_id: string;
}

export type KYCRecordResponse = {
  id: number;
  status: number;
  user: any;
  workflow: any;
  risk_evaluation: number | null;
  kyc_participants: any;
  [key: string]: number | string | DocumentAnswer[] | null;
}

export interface Comment {
  id: number;
  question_text: string;
  created_at: string;
  text: string;
  status: number;
  module: number;
  module_id: number;
  question_identifier: string;
  document_identifier: string;
  company: number;
  commented_by: number;
  comment_for: number;
  comment_label: string;
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