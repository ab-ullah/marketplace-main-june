import React, {FunctionComponent} from "react";
import flagIcon from "../../../../assets/images/flag.svg"
import {ChangesRequestedDiv} from "./styles";

import toLower from "lodash/toLower";
import replace from "lodash/replace";
import get from "lodash/get";

const getSectionId = (label: string) => {
  return toLower(replace(label, /\s/g, "_"));
}

export const moduleToSectionNameMapping = {
  eligibility: getSectionId('Eligibility Criteria'),
  taxReview: getSectionId('Tax Forms'),
  kyc_aml: getSectionId('Personal information'),
  legalDocs: getSectionId('Fund Documents'),
  internal_tax: getSectionId('Fund Documents'),
}


interface ChangesRequestedProps {
  changesRequestedModule: string
}

const ChangesRequested: FunctionComponent<ChangesRequestedProps> = ({changesRequestedModule}) => {

  const handleScrollToFirstComment=()=>{
    const elems = document.getElementsByClassName("comment-wrapper")
      if(elems[0]){
        elems[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
  }
  return (
    <ChangesRequestedDiv>
      <div className={'left-div'}>
        <div className={'label'}>Application Status:</div>
        <div className={'value'}>Changes requested</div>
      </div>
      <div>
          <div className={'action'} onClick={handleScrollToFirstComment}>
            See what needs your input
            <img src={flagIcon} alt=''/>
          </div>
      </div>
    </ChangesRequestedDiv>
  );
};

export default ChangesRequested;
