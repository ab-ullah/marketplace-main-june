export interface ICategory {
  name: string;
}

export interface IBlock {
  id: number;
  block_id: string;
  heading: string;
  title: string;
  description: string;
  require_file: boolean;
  allow_multiple_files: string;
  admin_uploaded_files: string;
  has_checkboxes: string;
  options: any;
  category: ICategory;
  is_admin_only: boolean;
}

export interface IBlockCategory {
  name: string;
  position: number;
  category_blocks: IBlock[];
}

export interface IRequiredDocuments {
  title: string;
  description: string;
}

export interface ICustomField {
  block: number;
  created_at: Date;
  id: number;
  marks_as_eligible: boolean;
  modified_at: Date;
  required_documents: IRequiredDocuments;
  reviewers_required: string[];
  title: string;
}

export interface ISmartBlock {
  company: number;
  created_at: Date;
  created_by: number;
  custom_fields: ICustomField[];
  description?: any;
  eligibility_criteria: number;
  fund: number;
  id: number;
  modified_at: Date;
  title: string;
}

