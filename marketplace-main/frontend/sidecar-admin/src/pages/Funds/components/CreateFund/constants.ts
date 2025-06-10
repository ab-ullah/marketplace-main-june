import * as Yup from "yup";
import { CLOSED_FUND, OPEN_FUND } from "../../../../constants/fundTypes";
import {
  AMERICAS_PRIVATE,
  ASIA_PACIFIC_PRIVATE,
  EUROPE_PRIVATE,
  GLOBAL_PARTNER_SOLUTIONS,
  GLOBAL_SECURITIES,
} from "../../../../constants/businessLines";

export const FUND_TYPE_OPTIONS = [
  { value: OPEN_FUND, label: "Open-end/perpetual fund" },
  { value: CLOSED_FUND, label: "Closed-end fund" },
];

export const INVITE_TYPE_OPTIONS = [
  { value: 0, label: "All" },
  { value: 1, label: "Invite only" },
];

export const LEVERAGE_TYPE_OPTIONS = [
  { value: 1, label: "Yes" },
  { value: 0, label: "No" },
];

export const BUSINESS_LINE_OPTIONS = [
  { value: AMERICAS_PRIVATE, label: "Americas Private" },
  { value: ASIA_PACIFIC_PRIVATE, label: "Asia Pacific Private" },
  { value: EUROPE_PRIVATE, label: "Europe Private" },
  { value: GLOBAL_PARTNER_SOLUTIONS, label: "Global Partner Solutions" },
  { value: GLOBAL_SECURITIES, label: "Global Securities" },
];

const re =
  /^(ftp|http|https|:\/\/|\.|@){2,}(localhost|\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}|\S*:\w*@)*([a-zA-Z]|(\d{1,3}|\.){7}){1,}(\w|\.{2,}|\.[a-zA-Z]{2,3}|\/|\?|&|:\d|@|=|\/|\(.*\)|#|-|%)*$/gmu;

export const VALIDATION_SCHEMA = Yup.object({
  name: Yup.string().required("Required"),
  county_code: Yup.object()
    .shape({
      value: Yup.string().required("Required"),
      label: Yup.string().required("Required"),
    })
    .nullable()
    .required("Required"),
  focus_region: Yup.string().nullable().required("Required"),
  type: Yup.string().nullable(),
  risk_profile: Yup.string().nullable(),
  investment_period: Yup.string().nullable(),
  fund_page: Yup.string().matches(re, "Enter a valid URL.").nullable(),
  minimum_investment: Yup.number().required("Required"),
  fund_type: Yup.object()
    .shape({
      value: Yup.number().required("Required"),
      label: Yup.string().required("Required"),
    })
    .nullable()
    .required("Required"),
  is_invite_only: Yup.object()
    .shape({
      value: Yup.number().required("Required"),
      label: Yup.string().required("Required"),
    })
    .nullable()
    .required("Required"),
  offer_leverage: Yup.object()
    .shape({
      value: Yup.number().required("Required"),
      label: Yup.string().required("Required"),
    })
    .nullable()
    .required("Required"),
  partner_id: Yup.string(),
  fund_currency: Yup.object()
    .shape({
      value: Yup.number().required("Required"),
      label: Yup.string().required("Required"),
    })
    .nullable()
    .required("Required"),
  target_fund_size: Yup.number().nullable(true),
  target_irr: Yup.number().max(100).nullable(true),
  firm_co_investment_commitment: Yup.number().nullable(true),
});

export const INITIAL_VALUES = {
  id: null,
  name: "",
  county_code: null,
  focus_region: "",
  type: "",
  risk_profile: "",
  investment_period: "",
  fund_page: "",
  minimum_investment: "",
  fund_type: FUND_TYPE_OPTIONS[0],
  is_invite_only: INVITE_TYPE_OPTIONS[1],
  offer_leverage: LEVERAGE_TYPE_OPTIONS[0],
  partner_id: "",
  fund_currency: null,
  domicile: null,
  target_fund_size: "",
  firm_co_investment_commitment: "",
  gp_signer: null,
  is_nav_disabled: false,
  skip_tax: false,
  enable_internal_tax_flow: true,
  wait_for_approval: true,
  employee_co_invest: true,
  skip_net_worth_question: false,
  tags: [],
  target_irr: "",
  strategy: "",
  investment_description: "",
  short_description: "",
  long_description: "",
  logo: "",
  banner_image: "",
  stats_json:[],
  external_onboarding_url: '',
  document_filter: '',
  dynamo_id: "",
  max_levered_commitment_amount:"",
  leverage_options: [{amount:0, description: ""}],
  cashless_commitment_enabled: 0,
  min_leverage_amount: ""
};

export const GP_SIGNER_GROUP = "General Partner Signer";

export const CASHLESS_COMMITMENT_OPTIONS = [
  { value: 1, label: "Yes" },
  { value: 0, label: "No" },
];
