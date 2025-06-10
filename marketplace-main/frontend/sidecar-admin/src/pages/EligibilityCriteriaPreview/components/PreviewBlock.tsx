import React, {FunctionComponent} from 'react';
import isNil from "lodash/isNil";
import CountrySelector from "./CountrySelector";
import FinalStep from "./FinalStep";
import KeyInvestorInformation from "./KeyInvestorInformation";
import ApprovalCheckboxes from "./ApprovalCheckboxes";
import {ICriteriaBlock} from "../../../interfaces/EligibilityCriteria/criteria";
import IntroBlock from "./IntroBlock";
import UserDocuments from "./UserDocuments";
import USAccreditedInvestorRules from "./USAccreditedInvestorRules";
import {
  APPROVAL_CHECKBOXES,
  CHECKBOX_BLOCKS,
  KEY_INVESTMENT_INFORMATION,
  PREVIEW_GENERIC_BLOCK_CODE,
  US_ACCREDITED_INVESTOR
} from "../../../constants/eligibility_block_codes";
import RadioButtonBlock from "./GenericBlock";
import CheckboxBlock from "./GenericBlock/CheckboxBlock";
import CustomSmartBlock from "./CustomSmartBlock"


interface CriteriaFormProps {
  criteriaBlock: ICriteriaBlock;
  nextFunction: () => void;
  isEligible: boolean;
}


const PreviewBlock: FunctionComponent<CriteriaFormProps> = ({criteriaBlock, nextFunction, isEligible}) => {
  const blockId = criteriaBlock.block?.block_id;
  return <>
    {criteriaBlock.is_country_selector && <CountrySelector criteriaBlock={criteriaBlock} nextFunction={nextFunction}/>}
    {criteriaBlock.is_intro_step && <IntroBlock nextFunction={nextFunction}/>}
    {criteriaBlock.is_final_step && <FinalStep criteriaBlock={criteriaBlock} isEligible={isEligible}/>}
    {!isNil(criteriaBlock.custom_block) && (
        <CustomSmartBlock criteriaBlock={criteriaBlock} nextFunction={nextFunction}/>
      )}
    {criteriaBlock.is_user_documents_step && <UserDocuments criteriaBlock={criteriaBlock} nextFunction={nextFunction}/>}
    {blockId === KEY_INVESTMENT_INFORMATION &&
      <KeyInvestorInformation criteriaBlock={criteriaBlock} nextFunction={nextFunction}/>}
    {blockId === US_ACCREDITED_INVESTOR &&
      <USAccreditedInvestorRules criteriaBlock={criteriaBlock} nextFunction={nextFunction}/>}
    {blockId === APPROVAL_CHECKBOXES &&
      <ApprovalCheckboxes criteriaBlock={criteriaBlock} nextFunction={nextFunction}/>}
    {PREVIEW_GENERIC_BLOCK_CODE.indexOf(blockId) > -1 &&
      <RadioButtonBlock criteriaBlock={criteriaBlock} nextFunction={nextFunction}/>}
    {CHECKBOX_BLOCKS.indexOf(blockId) > -1 &&
      <CheckboxBlock criteriaBlock={criteriaBlock} nextFunction={nextFunction}/>}
  </>
};

export default PreviewBlock;
