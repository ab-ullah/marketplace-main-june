import {IEligibilityCriteriaDetail} from "../../../interfaces/EligibilityCriteria/criteria";
import _ from "lodash";
import API from "../../../api";


export const calculateEligibility = (criteria: IEligibilityCriteriaDetail, logicValues: any) => {
  let currentDecision = true;
  let conditionToUse = '' as string;
  const sortedBlocks = _.sortBy(criteria.criteria_blocks, function (o) {
    return [o.is_final_step, o.position];
  });
  sortedBlocks.forEach((criteriaBlock) => {
    if (!criteriaBlock.block_connected_to || criteriaBlock.block_connected_to.length === 0) {
      return
    }
    if (criteriaBlock.is_final_step) return;
    if (criteriaBlock.block?.is_admin_only) return;
    if (criteriaBlock.is_user_documents_step) return;
    const value = logicValues[criteriaBlock.id]
    if (!conditionToUse) currentDecision = value;
    else if (conditionToUse === 'OR') currentDecision = currentDecision || value;
    else if (conditionToUse === 'AND') currentDecision = currentDecision && value;
    conditionToUse = criteriaBlock.block_connected_to[0].condition

  })
  return currentDecision
}


export const getDecisionByPosition = (criteria: IEligibilityCriteriaDetail, logicValues: any) => {
  const sortedBlocks = _.sortBy(criteria.criteria_blocks, function (o) {
    return [o.is_final_step, o.position];
  });
  const positionDecision = {} as any;
  sortedBlocks.forEach((criteriaBlock) => {
    if (!criteriaBlock.block_connected_to || criteriaBlock.block_connected_to.length === 0) {
      return
    }
    if (criteriaBlock.is_final_step) return;
    if (!criteriaBlock.block && !criteriaBlock.custom_block) return;
    if (criteriaBlock.block?.is_admin_only) return;
    if (criteriaBlock.is_user_documents_step) return;
    positionDecision[`${criteriaBlock.position}`] = logicValues[criteriaBlock.id]

  })
  return positionDecision
}

export const getDecisionById = async (criteria: IEligibilityCriteriaDetail, logicFlowValues: any) => {
  const response = await API.getEligibilityDecisionById(criteria.id, logicFlowValues)
  return response.is_eligible
}


export const getCriteriaEligibility = async (criteria: IEligibilityCriteriaDetail, logicFlowValues: any) => {
  if (criteria.has_custom_logic_block) {
    return getDecisionById(criteria, logicFlowValues)
  }
  if (criteria.expression_override) {
    const blockPositionValues = getDecisionByPosition(criteria, logicFlowValues)
    const response = await API.getEligibilityCriteriaDecision(criteria.id, blockPositionValues)
    return response.is_eligible
  }
  return calculateEligibility(criteria, logicFlowValues)
}