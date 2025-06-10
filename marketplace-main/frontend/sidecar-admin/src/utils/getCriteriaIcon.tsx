import {ICriteriaBlock} from "../interfaces/EligibilityCriteria/criteria";
import fileIcon from "../assets/images/file-icon.svg";
import userIcon from "../assets/images/user-icon.svg";
import tickCircledIcon from "../assets/images/tick-circled-icon.svg";
import docIcon from "../assets/images/doc-icon.svg";
import docIconGrey from "../assets/images/doc-icon-grey.svg";
import worldIcon from "../assets/images/world-icon.svg";
import flagIcon from "../assets/images/flag-icon.svg";
import {
  APPROVAL_CHECKBOXES,
  KEY_INVESTMENT_INFORMATION,
  KNOWLEDGEABLE_EMPLOYEE,
  US_ACCREDITED_INVESTOR
} from "../constants/eligibility_block_codes";

export const getCriteriaIcon = (criteriaBlock: ICriteriaBlock) => {
  if (criteriaBlock.is_final_step) return flagIcon;
  if (criteriaBlock.is_country_selector) return worldIcon;
  if (criteriaBlock.is_user_documents_step) return docIconGrey;
  if (criteriaBlock.block) {
    const blockId = criteriaBlock.block.block_id;
    switch (blockId) {
      case US_ACCREDITED_INVESTOR: {
        return docIcon
      }
      case KNOWLEDGEABLE_EMPLOYEE: {
        return userIcon
      }
      case KEY_INVESTMENT_INFORMATION: {
        return fileIcon
      }
      case APPROVAL_CHECKBOXES: {
        return tickCircledIcon
      }
      default: {
        return docIcon
      }
    }
  }
  return docIcon;
}