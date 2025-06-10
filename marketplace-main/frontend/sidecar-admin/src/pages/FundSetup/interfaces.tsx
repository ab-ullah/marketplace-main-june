import { IFundDetail } from "../../interfaces/fundDetails";
import {IUser} from "../Users/interfaces";

interface TypeSelector {
  label: string;
  value: string | number;
}

export interface IFundDetailExtended extends IFundDetail {
  fund_type_selector?: TypeSelector
  business_line_selector?: TypeSelector
  currency_selector?: TypeSelector
}

export interface IApplicantManagementRow {
  first_name: string;
  last_name: string;
  investment_detail: any
  id: number
  user: IUser
  is_removable: boolean
}

export interface IApplicantStatuses {
  [key: number]: {
    kyc_aml: string,
    taxReview: string,
    internal_tax: string,
    legalDocs: string
  }
}