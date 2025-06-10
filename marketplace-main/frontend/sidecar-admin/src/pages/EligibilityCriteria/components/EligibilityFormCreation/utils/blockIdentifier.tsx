import {ICriteriaBlock} from "../../../../../interfaces/EligibilityCriteria/criteria";

export const getCriteriaBlockIdentifier = (criteriaBlock: ICriteriaBlock) => {
  return `${criteriaBlock.block.block_id}-${criteriaBlock.id}`
}