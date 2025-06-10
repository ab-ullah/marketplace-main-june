import isNil from "lodash/isNil";
import {ICriteriaBlock} from "../../../../../interfaces/EligibilityCriteria/criteria";

export const getBlockName = (criteriaBlock: ICriteriaBlock) => {
  if (criteriaBlock.is_final_step) return 'Final Block';
  if (criteriaBlock.is_country_selector) return 'Investor Country';
  if (criteriaBlock.is_investor_type_selector) return 'Investor Type';
  if (criteriaBlock.is_user_documents_step) return 'User Documents';
  if (criteriaBlock.is_custom_logic_block) return 'Custom Logic';
  if (criteriaBlock.block) return criteriaBlock.block.heading;
  if (!isNil(criteriaBlock.custom_block)) return criteriaBlock.custom_block.title;
  return ''
}

export const canDeleteBlock = (criteriaBlock: ICriteriaBlock) => !(criteriaBlock.is_final_step || criteriaBlock.is_country_selector || criteriaBlock.is_user_documents_step);