import { carryPlanStatus } from "./components/CarryPlansPage/constants"

export const TABS = {
FUNDS:'funds',
DEALS:'deals',
INVESTMENT_TRANCHES:'investment_tranches',
CARRY_PLANS:'carryPlans',
PARTICIPANTS:'participants',
MANAGER:'manager',
DISTRIBUTIONS:'distributions',
VESTING:'vesting',
VEHICLES:'vehicles',
DOCUMENTS: 'documents',
SHARE_CLASSES: 'shareClasses',
COMMITMENTS:'commitments'
}

export const FUND_ID_PARAM = 'fund_id'
export const PLAN_ID_PARAM = "plan_id"
export const VEHICLE_ID_PARAM = "vehicle_id"
export const PARTICIPANT_ID_PARAM = 'user_id'
export const PARTICIPANT_NAME_PARAM = 'participant_name'
export const DEAL_ID_PARAM = 'deal_id'
export const DISTRIBUTION_ID_PARAM = 'distribution_id'
export const TRANCHE_ID_PARAM = 'tranche_id'
export const COMMITMENT_SOURCE_ID_PARAM = 'commit_source_id'
export const COMMITMENT_SOURCE_TYPE_PARAM = 'commit_source_type'

export const TABS_SEARCH_PARAMS={
  [TABS.FUNDS]:[FUND_ID_PARAM],
  [TABS.DEALS]:[DEAL_ID_PARAM],
  [TABS.CARRY_PLANS]:[PLAN_ID_PARAM],
  [TABS.PARTICIPANTS]:[PARTICIPANT_ID_PARAM, PARTICIPANT_NAME_PARAM],
  [TABS.DISTRIBUTIONS]:[DISTRIBUTION_ID_PARAM],
  [TABS.VESTING]:[VEHICLE_ID_PARAM],
  [TABS.VEHICLES]:[],
  [TABS.DOCUMENTS]:[],
  [TABS.INVESTMENT_TRANCHES]: [TRANCHE_ID_PARAM],
  [TABS.COMMITMENTS]: [COMMITMENT_SOURCE_ID_PARAM,COMMITMENT_SOURCE_TYPE_PARAM]
}

export const getPillColor = (status: string) => {
  let color = "";
  switch (status.toLowerCase()) {
    case "active":
      color = "#10AC84";
      break;
      case carryPlanStatus.PUBLISHED.toLowerCase():
        color = "#10AC84";
        break;
      case carryPlanStatus.APPROVED.toLowerCase():
        color = "#10AC84";
        break;    
      case carryPlanStatus.UNPUBLISHED_CHANGE.toLowerCase():
        color = "#FF8A00";
        break;
      case carryPlanStatus.PENDING_APPROVAL.toLowerCase():
        color = "#FF8A00";
        break;        
      case carryPlanStatus.UNAPPROVED.toLowerCase():
        color = "#FF5722";
        break; 
    case "unreleased":
      color = "#56615E";
      break;     
    case "draft":
      color = "#FF8A00";
      break;
    case "review":
      color = "#3A8DDF";
      break;
    case "inactive":
      color = "#FF5722";
      break;
    case "pending gp signature":
    case "pending acknowledgement":
    case "acknowledgement":
      color = "#2E86DE";
      break;
    case "signed":
    case "signature":
    case "acknowledgement complete":
      color = "#10AC84";
      break;
  }
  return color;
};

export const COMPENSATION_ADMIN_GROUP = 'Compensation Admin'
export const CARRY_MANAGER_GROUP = 'Carry Manager'

export const CARRY_VALUE_LABEL = {
  estimated_value: 'Estimated Value',
  fair_market_value: 'Fair Market Value',
  total_estimated_value: 'Total Estimated Carry Value',
  total_fair_market_value: 'Total Fair Market Value'
}