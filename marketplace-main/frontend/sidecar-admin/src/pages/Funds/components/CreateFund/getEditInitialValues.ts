import pick from "lodash/pick";
import get from "lodash/get";
import { IFund } from "../../interfaces";

export const getFundInitialValues = (fund: IFund) => {
  return {
    ...pick(fund, [
      "id",
      "name",
      "county_code",
      "focus_region",
      "type",
      "risk_profile",
      "investment_period",
      "fund_page",
      "target_fund_size",
      "firm_co_investment_commitment",
      "is_invite_only",
      "offer_leverage",
      "partner_id",
      "currency",
      "minimum_investment",
      "fund_currency",
      "domicile",
      "is_nav_disabled",
      "skip_tax",
      "employee_co_invest",
      "skip_net_worth_question",
      "enable_internal_tax_flow",
      "target_irr",
      "strategy",
      "investment_description",
      "logo",
      "banner_image",
      "managers",
      "external_onboarding_url",
      "document_filter",
      "dynamo_id",
      "leverage_options",
      "max_levered_commitment_amount",
    ]),
    fund_type: get(fund, "fund_type_selector", get(fund, "fund_type")),
  };
};
