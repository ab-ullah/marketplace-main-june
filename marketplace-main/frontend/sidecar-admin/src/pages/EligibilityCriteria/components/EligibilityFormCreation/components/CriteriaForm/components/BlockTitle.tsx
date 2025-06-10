import { FunctionComponent } from 'react';
import { ICriteriaBlock } from "../../../../../../../interfaces/EligibilityCriteria/criteria";
import { getBlockName } from "../../../utils/blockName";
import { getCriteriaIcon } from "../../../../../../../utils/getCriteriaIcon";
import classNames from "classnames";
import { needBlueBackground } from "../../../../../../../utils/getCriteriaColor";

interface IBlockTitleProps {
  criteriaBlock: ICriteriaBlock;
  blockIndex?: number,
}

const BlockTitle: FunctionComponent<IBlockTitleProps> = ({ criteriaBlock, blockIndex }) => {
  return (
    <span className={
      classNames("block-tag", { 'blue-background': needBlueBackground(criteriaBlock) })}>
      {blockIndex}
      <img src={getCriteriaIcon(criteriaBlock)} alt="World icon" width={20} height={20} />
      <span>{getBlockName(criteriaBlock)}</span>
    </span>
  )
};

export default BlockTitle;
