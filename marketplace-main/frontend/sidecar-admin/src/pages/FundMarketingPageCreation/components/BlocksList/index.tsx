import React, {FunctionComponent} from 'react';
import ListBlock from "../../../../components/CreationWizard/ListBlock";
import {MARKETING_PAGE_BLOCKS} from "./data";


interface FundPageBlockProps {

}


const FundPageBlock: FunctionComponent<FundPageBlockProps> = () => {

  return <>
    {MARKETING_PAGE_BLOCKS.map(block => <ListBlock
      canDelete={false}
      blockName={block.name}
      position={block.position}
      imgSrc={block.imgSrc}
      needBlueBackground={true}
    />)}
  </>
};

export default FundPageBlock;
