import find from "lodash/find";

export const TABS = {
  FUND_SETUP: 'fundSetup',
  INDICATION_OF_INTEREST: 'indicationOfInterest',
  ELIGIBILITY_CRITERIA: 'eligibilityCriteria',
  ACTIVITY_LOG: 'activityLog',
  APPLICANTS_MANAGEMENT: 'applicants',
  CAPITAL_CALLS: 'capitalCalls',
  DISTRIBUTION_NOTICES:'distributionNotices',
  CARRY_MANAGEMENT:'carryManagement'
}

export const LEVERAGE_OPTIONS = [
  { value: "", label: 'Not Started' },
  { value: '0:1', label: 'None' },
  { value: '2:1', label: '2:1' },
  { value: '3:1', label: '3:1' },
  { value: '4:1', label: '4:1' },
]

export const getLeverageOptionLabel = (value: string) => {
  try{
    const option = find(LEVERAGE_OPTIONS, (option: any) => option.value === value);
    return option ? option.label : 'Not Started';  
  }catch(e){
    console.log(e);
    return 'Not Started';  
  }
  
}

export const initFilter = {
  keyword: "",
  officeLocation: "",
  jobBandLevel: "",
  department: "",
  region: "",
  applicationApproval: "",
};

export const APPLICATIONS_NOT_REMOVABLE_MESSAGE = 'Only Applications that are not started or not eligible can be removed'
export const FUND_SETUP_INFORMATION_TEXTS = ["Edit fund details such as leverage options, share classes, advanced settings and invite investors."];
export const PUBLISH_INDICATION_OF_INTEREST_TEXTS = ["Use this optional step to gauge investor interest in a fund prior to opening applications for investment. When a fund is published with Indication of Interest turned on, investors will see an option to “Indicate Interest.” When you’ve completed your Indication of Interest period, simply turn off Indication of Interest and the published opportunity will show “Coming Soon.” Note that investment opportunities will not appear to the investor until Step 3 is complete."];
export const PUBLISH_OPPORTUNITY_TEXTS = ["Your fund will appear on the investor home page as an opportunity that is “Coming Soon.” Once published, investors will see a link to the fund page, region, type of fund, risk profile and application period. Note that investors cannot start applying to new opportunities until after Step 6 is complete."];
export const ELIGIBILITY_CRITERIA_TEXTS = ["Create eligibility rules for investors in various countries/jurisdictions to allow for dynamic onboarding. All eligibility rules must be submitted for review, approved and published in order to complete Step 6 - Accept Applications.", "Eligibility rules can be published once all eligibility rules have been reviewed and approved."]
export const FUND_DOCUMENTS_TEXTS = ["Upload fund specific documents for investors to review, acknowledge or sign during onboarding. Fund specific documents can optionally require simple digital acknowledgment, investor signature, wet signature or GP signature."];
export const ACCEPT_APPLICATIONS_TEXTS = ["Your fund will appear on the investor home page with the option to “Apply Now.” You can Close applications when the investment period closes."];
export const ACCEPT_APPLICATIONS_SUBTEXT = "This step can only be completed if Step 3 - Publish Opportunity and Step 4 - Eligibility Criteria are complete"
export const PUBLISH_INVESTMENT_DETAILS_TEXTS = ["Investors won’t see data regarding this fund until you have published investment details. Once it is published, investors will see their investment details. A published fund cannot be unpublished."];
export const PUBLISH_INVESTMENT_DETAILS_SUBTEXT = "Publishing Investment Details is available only after at least 1 investor has applied."