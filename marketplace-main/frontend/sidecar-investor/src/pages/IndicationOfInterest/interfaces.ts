import { ISelectOption } from "../../interfaces/form";

export interface IFund {
    id: number;
    name: string;
    country: ISelectOption;
    symbol: string;
    external_id: string,
    partner_id: string;
    investment_product_code: string;
    slug: string;
    fund_type_selector: ISelectOption;
    business_line_selector: ISelectOption;
    currency_selector: ISelectOption;
    fund_type_name: string;
    target_fund_size: string,
    firm_co_investment_commitment: string,
    demand: number;
    unsold: number;
    sold: number;
    total: number;
    existing_investors: number;
    company: number;
    created_at?: string;
    application_period_start_date: string;
    application_period_end_date: string;
    confirmation_date: string;
    anticipated_first_call_date: string;
    is_published: boolean;
    is_finalized: boolean;
    focus_region: string;
    type: string;
    county_code: ISelectOption;
    risk_profile: string;
    investment_period: string;
    fund_page: string;
    fund_type: ISelectOption;
    is_invite_only: ISelectOption;
    offer_leverage: ISelectOption;
    partnerId: string;
    fund_currency: ISelectOption;
    minimum_investment: string;
    domicile: ISelectOption;
    has_eligibility_criteria: boolean;
    status: string;
    publish_investment_details: boolean;
    accept_applications: boolean;
    can_finalize: boolean;
    gp_signer: number;
    close_applications: boolean;
    is_nav_disabled: boolean
  }

  export interface IIndicationOfInterestState {
    fundDetails: IFund | null
  }