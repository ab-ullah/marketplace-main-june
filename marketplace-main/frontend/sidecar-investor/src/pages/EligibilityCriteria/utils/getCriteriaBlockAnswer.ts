import {ICriteriaBlock} from "../../../interfaces/EligibilityCriteria/criteria";
import {IEligibilityCriteriaResponse} from "../../../interfaces/EligibilityCriteria/criteriaResponse";

export const getCriteriaBlockAnswer = (criteriaBlock: ICriteriaBlock, fundCriteriaResponse: IEligibilityCriteriaResponse | null) => {
  return fundCriteriaResponse?.user_block_responses?.find(
    (block) => block.block_id === criteriaBlock.id
  )
}