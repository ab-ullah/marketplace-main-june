import {IStatus} from "../pages/ApplicationView/Components/constants";

export interface IApplicationStatus {
  is_allocation_approved: boolean;
  is_aml_kyc_approved: boolean;
  is_tax_info_submitted: boolean;
  is_payment_info_submitted: boolean;
  is_application_approved: boolean;
  is_approved: boolean;
}

export interface IApplicationModuleStates {
  kyc_aml?: IStatus;
  taxReview?: IStatus;
  legalDocs?: IStatus;
  application_approval?: IStatus;
  eligibility_decision?: IStatus;
}

export interface IInvestedCount {
  invested_count: number
}

export interface IActiveApplicationFund {
  name: string;
  external_id: string;
  focus_region: string;
  application_link: string;
  application_status: string;
  continue_url: string;
  type: string;
  risk_profile: string;
}
