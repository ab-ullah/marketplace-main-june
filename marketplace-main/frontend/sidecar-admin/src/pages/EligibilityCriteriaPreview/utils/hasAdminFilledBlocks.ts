import {IEligibilityCriteriaDetail} from "../../../interfaces/EligibilityCriteria/criteria";
import {
  APPROVAL_CHECKBOXES,
  KEY_INVESTMENT_INFORMATION,
} from "../../../constants/eligibility_block_codes";


export const hasAdminFilledBlocks = (criteria: IEligibilityCriteriaDetail) => {
  let isComplete = true;
  criteria.criteria_blocks.forEach(criteriaBlock => {
    if (!isComplete) return;
    const blockId = criteriaBlock.block?.block_id;
    if (!blockId) return;
    if (blockId === APPROVAL_CHECKBOXES) {
      isComplete = criteriaBlock.criteria_block_documents.length > 0
    }
    else if (blockId === KEY_INVESTMENT_INFORMATION) {
      isComplete = criteriaBlock.criteria_block_documents.length > 0
    }
  })
  return isComplete;
}