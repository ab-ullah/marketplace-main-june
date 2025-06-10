import {IEligibilityCriteriaDetail} from "../../../interfaces/EligibilityCriteria/criteria";
import _ from "lodash";


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
    if (criteriaBlock.is_custom_logic_block) return;
    if (criteriaBlock.is_user_documents_step) return;
    const value = logicValues[criteriaBlock.id]
    if (!conditionToUse) currentDecision = value;
    else if (conditionToUse === 'OR') currentDecision = currentDecision || value;
    else if (conditionToUse === 'AND') currentDecision = currentDecision && value;
    conditionToUse = criteriaBlock.block_connected_to[0].condition

  })
  return currentDecision
}