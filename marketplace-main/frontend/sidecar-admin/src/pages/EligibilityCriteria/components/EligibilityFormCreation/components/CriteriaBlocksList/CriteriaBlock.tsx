import React, {FunctionComponent} from 'react';
import {ICriteriaBlock} from "../../../../../../interfaces/EligibilityCriteria/criteria";
import {getBlockName, canDeleteBlock} from "../../utils/blockName";
import {getCriteriaIcon} from "../../../../../../utils/getCriteriaIcon";
import {needBlueBackground} from "../../../../../../utils/getCriteriaColor";
import ListBlock from "../../../../../../components/CreationWizard/ListBlock";

interface CriteriaBlockProps {
  criteriaBlock: ICriteriaBlock;
  blockIndex: number,
}


const CriteriaBlock: FunctionComponent<CriteriaBlockProps> = ({criteriaBlock, blockIndex}) => {
  const blockName = getBlockName(criteriaBlock);

  const canDelete = canDeleteBlock(criteriaBlock);

  return <ListBlock
    canDelete={canDelete}
    blockName={blockName}
    position={blockIndex}
    imgSrc={getCriteriaIcon(criteriaBlock)}
    needBlueBackground={needBlueBackground(criteriaBlock)}
    criteriaBlock={criteriaBlock}
  />
};

export default CriteriaBlock;
