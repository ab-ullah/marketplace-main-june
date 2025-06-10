import {FunctionComponent} from 'react';
import {ICriteriaBlock} from "../../../../../../../interfaces/EligibilityCriteria/criteria";
import isNil from "lodash/isNil";
import FinalStep from "./FinalStep";
import KeyInvestorInformation from "./KeyInvestorInformation";
import ApprovalCheckboxes from "./ApprovalCheckboxes";
import {
  APPROVAL_CHECKBOXES, HK_ELIGIBILITY_BLOCK,
  KEY_INVESTMENT_INFORMATION,
  KNOWLEDGEABLE_EMPLOYEE,
} from "../../../../../../../constants/eligibility_block_codes";
import KnowledgeEmployeeBlock from "./KnowledgeEmployee";
import CountrySelector from "./InvestorCountrySelector";
import BlockActions from "../../../../../../../components/CreationWizard/BlockActions";
import HongKongBlock from "./HongKongBlock";
import CustomSmartBlock from "./CustomSmartBlock";
import BlockTitle from "./BlockTitle";
import CustomLogicBlock from "./CustomLogicBlock";

interface IFormBlockProps {
  criteriaBlock: ICriteriaBlock;
  blockIndex?: number,
  showTitle?: boolean;
  showActionsMenu?: boolean;
}


const FormBlock: FunctionComponent<IFormBlockProps> = ({criteriaBlock, showTitle, showActionsMenu, blockIndex}) => {
  const blockId = criteriaBlock.block?.block_id;

  return (
    <div className="create-form-card">
      {showActionsMenu && (<BlockActions criteriaBlock={criteriaBlock} />)}
      {showTitle && (
        <BlockTitle criteriaBlock={criteriaBlock} />
      )}
      {criteriaBlock.is_final_step && <FinalStep criteriaBlock={criteriaBlock}/>}
      {criteriaBlock.is_custom_logic_block && <CustomLogicBlock criteriaBlock={criteriaBlock}/>}
      {criteriaBlock.is_country_selector && (
        <CountrySelector />
      )}
      {!isNil(criteriaBlock.custom_block) && (<>
        <CustomSmartBlock criteriaBlock={criteriaBlock.custom_block}/>
        </>
      )}
      {blockId === KEY_INVESTMENT_INFORMATION &&
        <KeyInvestorInformation criteriaBlock={criteriaBlock}/>}
      {blockId === APPROVAL_CHECKBOXES &&
        <ApprovalCheckboxes criteriaBlock={criteriaBlock}/>}
      {blockId === HK_ELIGIBILITY_BLOCK &&
        <HongKongBlock criteriaBlock={criteriaBlock}/>}
      {blockId === KNOWLEDGEABLE_EMPLOYEE &&
        <KnowledgeEmployeeBlock criteriaBlock={criteriaBlock}/>}
        
    </div>)
};

FormBlock.defaultProps = {
  showTitle: true,
  showActionsMenu: true,
}

export default FormBlock;
