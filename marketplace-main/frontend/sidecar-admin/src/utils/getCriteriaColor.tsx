import isNil from "lodash/isNil";
import {ICriteriaBlock} from "../interfaces/EligibilityCriteria/criteria";

export const needBlueBackground = (criteriaBlock: ICriteriaBlock) => {
  return Boolean(criteriaBlock.block) || !isNil(criteriaBlock.custom_block)
}