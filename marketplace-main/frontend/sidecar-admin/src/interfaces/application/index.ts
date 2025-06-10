export interface IInvestmentDetail {
  final_cashless_commitment: number;
  requested_leverage?: string;
  max_leverage?: string;
  final_leverage?: any;
  requested_entity?: string | number;
  final_entity?: null | number;
  total_investment?: string | number;
  eligibility_decision?: string;
  final_leverage_ratio?: null | string;
  eligibility_type?: string;
  id?: number;
  is_eligible?: boolean;
  leverage_option_description?: string | null;
  cashless_commitment: number;
  final_leverage_option_description?: string | null;
}

export interface IApplicationStatusData {
  withdrawn_comment: string;
}

export interface IPaymentDetail {
  id: number;
  created_at: Date;
  modified_at: Date;
  bank_name: string;
  street_address: string;
  city: string;
  state: string;
  province: string;
  postal_code: string;
  account_name: string;
  account_number: string;
  routing_number: string;
  swift_code: string;
  iban_number: string;
  credit_account_name: string;
  credit_account_number: string;
  reference: string;
  have_intermediary_bank: boolean;
  intermediary_bank_name: string;
  intermediary_bank_swift_code: string;
  user: number;
  bank_country: number;
  currency: number;
}

export interface IUser {
  id: number;
  display_name: string;
  password: string;
  last_login?: any;
  is_superuser: boolean;
  username: string;
  email: string;
  full_name?: any;
  first_name: string;
  last_name: string;
  bio?: any;
  is_staff: boolean;
  is_sidecar_admin: boolean;
  is_active: boolean;
  last_active?: any;
  date_joined: Date;
  first_login_at: Date;
  is_invited: boolean;
  groups: number[];
  user_permissions: any[];
}

export interface IPOADoc {
  title: string;
  document_id: string;
  id: number;
}

export interface IPowerOfAttorney {
  template: IPOADoc;
  user_document: IPOADoc;
}

export interface IBaseApplication {
  first_name: string;
  last_name: string;
  id: number;
  job_band: string;
  fund_external_id: string;
  kyc_wf_slug: string;
  department: string;
  office_location: string;
  investment_detail: IInvestmentDetail;
  payment_detail: IPaymentDetail;
  power_of_attorney_documents: IPowerOfAttorney;
  user: IUser;
  created_at: Date;
  modified_at: Date;
  uuid: string;
  status: number;
  max_leverage_ratio: any;
  eligibility_response_data_migration: boolean;
  company: number;
  fund: number;
  tax_record: number;
  kyc_record: number;
  eligibility_response: number;
  workflow: number;
  share_class: any;
  vehicle?: number;
  investor_account_code?: string;
  has_custom_leverage: boolean;
  has_custom_equity: boolean;
  has_custom_total_investment: boolean;
  transfers: any;
  is_transferred: boolean;
  disable_cashless_commitment: boolean | null
  status_detail?: any;
}
