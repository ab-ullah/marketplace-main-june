import {IEligibilityCriteriaDetail} from "../EligibilityCriteria/criteria";
import {IPaymentDetail} from "../paymentDetails";


export interface ITaskDocumentSigningInfo {
  document_type: 'agreement' | 'company_document';
  envelope_id: string;
  fund_external_id: string;
}

export interface ITask {
  carry_plan_id?: any;
  responsible: string;
  id: number;
  description: string;
  module: string;
  requestor: number;
  requestor_name: string;
  task_type_name: string;
  task_type: number;
  due_date: string;
  workflow: number;
  status: number;
  status_name: string;
  fund_slug: string;
  fund_name: string;
  investor_name: string;
  fund_external_id: string;
  completed: boolean;
  module_id: number;
  workflow_id: number;
  is_module_creator: boolean;
  workflow_type: number;
  document_signing_info: null | ITaskDocumentSigningInfo
  assigned_to: number | null;
  belongs_to_me: boolean;
  created_at: string;
}

export interface ITaskDetail {
  id: number;
  description: string;
  module: number;
  kyc_record_id: number | null;
  kyc_wf_slug: string | null;
  eligibility_response_id: number | null;
  application_id: number | null;
  tax_record_id: number | null;
  payment_detail: IPaymentDetail | null;
  fund_slug: string;
  fund_external_id: string;
  requestor: number;
  requestor_name: string;
  task_type_name: string;
  due_date: string;
  workflow: number;
  status: number;
  status_name: string;
  completed: boolean;
  eligibility_criteria: IEligibilityCriteriaDetail | null;
  workflow_type: number;
  has_pending_comment: boolean;
  name?: string
  capital_call_id?: number
  responsible?: string
  approver?: string
  approval_date?: string
  distribution_notice_id?: number
  carry_plan_id?: number
}