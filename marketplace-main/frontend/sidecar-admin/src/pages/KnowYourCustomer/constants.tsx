import AllComments from "./components/AllComments";
import { WorkFlow } from '../../interfaces/workflows'

import { ValueLookup } from './interfaces';
import { getCountries } from "./utils";

export const FLOW_TYPES = {
  KYC: 1,
  ELIGIBILITY: 2,
  INDICATION_OF_INTEREST: 3,
}

export const TAB_INFO = 'info'
export const TAB_DOCUMENTS = 'documents'

export const notificationConfig = {
  default: {
    show: false,
    title: "",
    msg: ""
  },
  approve: {
    show: true,
    title: "Approved",
    msg: `Congratulations! Application has been approved`
  },
  requestChanges: {
    show: true,
    title: "Changes Requested",
    msg: `Applicant has been notified about requested changes`
  },
  commentRequired: {
    show: true,
    title: "Feedback Required",
    msg: `Please flag a field and leave feedback before requesting revisions`
  },
  requests: {
    show: true,
    title: 'Requests',
    msg: <AllComments/>
  },
  approvalDisabled: {
    show: true,
    title: "Approval Disabled",
    msg: `Please sign the document before approving task`
  },
}
  
export const VALUE_TYPES: ValueLookup = {
  LOOKUP_VALUE: 'lookup_value',
  DIRECT_ANSWER: 'direct_answer',
  FILE: 'file',
  ELIGIBILITY_CRITERIA: 'eligibility_criteria_response',
  INVESTMENT_AMOUNT_RESPONSE: 'investment_amount_response',
  INVESTMENT_AMOUNT_RESPONSE_NO_FLAG: 'investment_amount_response_no_flag',
  SECTION_HEADER: 'none',
  CASHLESS_COMMITMENT: 'cashless_commitment',
  LEVERAGE_AMOUNT: 'leverage_amount'
}

export const LOOKUP_TYPES = {
  "custom-select": VALUE_TYPES.LOOKUP_VALUE,
  "radio-select": VALUE_TYPES.LOOKUP_VALUE,
  "checkbox": VALUE_TYPES.LOOKUP_VALUE,
  "select-country": VALUE_TYPES.LOOKUP_VALUE,
  "text": VALUE_TYPES.DIRECT_ANSWER,
  "number": VALUE_TYPES.DIRECT_ANSWER,
  "date": VALUE_TYPES.DIRECT_ANSWER,
  "file_upload": VALUE_TYPES.FILE,
  'eligibility_criteria_response': VALUE_TYPES.ELIGIBILITY_CRITERIA,
  'investment_amount_response': VALUE_TYPES.INVESTMENT_AMOUNT_RESPONSE,
  'investment_amount_response_no_flag': VALUE_TYPES.INVESTMENT_AMOUNT_RESPONSE_NO_FLAG,
  'section_header': VALUE_TYPES.SECTION_HEADER,
  'cashless_commitment': VALUE_TYPES.CASHLESS_COMMITMENT,
  'leverage_amount': VALUE_TYPES.LEVERAGE_AMOUNT
}

export const investor_types = ['Corporate Entity', 'Limited Partnership', 'Trust']

const KYC_AML_FLOW_SLUG_PREFIX = 'kyc-aml';

export const KYC_INDIVIDUAL_INVESTOR = "INDIVIDUAL";

export const KYC_PARTICIPANT_INVESTOR = "PARTICIPANT";

export const KYC_ENTITY = "ENTIRY"

export const KYC_PRIVATE_COMPANY_INVESTOR = "PRIVATE_COMPANY";

export const KYC_LIMITED_PARTNERSHIP_INVESTOR = "LIMITED_PARTNERSHIP";

export const KYC_TRUST_INVESTOR = "TRUST";

export const ENTITY_TYPE_MAPPINGS: { [key: string]: string } = {
  [KYC_PRIVATE_COMPANY_INVESTOR]: 'Private Company',
  [KYC_LIMITED_PARTNERSHIP_INVESTOR]: 'Limited Partnership',
  [KYC_TRUST_INVESTOR]: 'Trust'
}

export const KYC_ENTITY_TYPES = [KYC_PRIVATE_COMPANY_INVESTOR, KYC_LIMITED_PARTNERSHIP_INVESTOR, KYC_TRUST_INVESTOR]

export const AML_FLOW_SLUGS: { [key: string]: string } = {
  [KYC_INDIVIDUAL_INVESTOR]: `${KYC_AML_FLOW_SLUG_PREFIX}-individual`,
  ENTITY_SELECTION: `${KYC_AML_FLOW_SLUG_PREFIX}-entity`,
  [KYC_PRIVATE_COMPANY_INVESTOR]: `${KYC_AML_FLOW_SLUG_PREFIX}-private-company`,
  [KYC_LIMITED_PARTNERSHIP_INVESTOR]: `${KYC_AML_FLOW_SLUG_PREFIX}-limited-partnership`,
  [KYC_TRUST_INVESTOR]: `${KYC_AML_FLOW_SLUG_PREFIX}-trust`,
}

export const KYC_INVESTOR_TYPE: { [key: string]: number } = {
  [KYC_INDIVIDUAL_INVESTOR]: 1,
  [KYC_PARTICIPANT_INVESTOR]: 2,
  [KYC_ENTITY]: 3,
  [KYC_PRIVATE_COMPANY_INVESTOR]: 4,
  [KYC_LIMITED_PARTNERSHIP_INVESTOR]: 5,
  [KYC_TRUST_INVESTOR]: 6
}


export const AML_KYC_ENTITIES_WORKFLOW = (countries: any) => ({
  slug: AML_FLOW_SLUGS.ENTITY_SELECTION,
  type: FLOW_TYPES.KYC,
  name: 'KYC / AML Entities',
  cards: [
    {
      id: 'aml-kyc-entities-and-stuff-aml-entity-card',
      name: 'AML Entity Type Selection',
      order: 1,
      is_repeatable: false,
      schema: [ {
        id: 'kyc_investor_type_name',
        label: 'What is the type of your entity?',
        type: 'radio-select',
        required: true,
        is_repeatable: false,
        data: {
          options: [
            {
              label: 'Corporate Entity',
              value: 'PRIVATE_COMPANY',
            },
            {
              label: 'Partnership',
              value: 'LIMITED_PARTNERSHIP',
            },
            {
              label: 'Trust',
              value: 'TRUST',
            }
          ]
        }
      },
      {
        id: 'investor_location',
        label: 'Where were you when you decided to invest?',
        type: 'select-country',
        required: true,
        data: {
          options: getCountries(countries)
        }
        }
    ]
    },
  ]
});

export const ELIGIBIBLE_INVESTOR_FIELDS = [
  'Personal information',
  'Home address',
  'Upload documents',
  'Investment Amount'
]

export const ELIGIBILITY_CARD_TITLE = 'Eligibility Criteria'