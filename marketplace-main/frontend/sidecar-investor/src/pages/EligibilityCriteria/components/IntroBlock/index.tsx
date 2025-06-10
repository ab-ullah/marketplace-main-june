import React, {FunctionComponent} from 'react';
import {useAppSelector} from "../../../../app/hooks";
import {selectFundCriteriaPreview} from "../../selectors";
import Button from "react-bootstrap/Button";


interface FinalStepProps {
  nextFunction: () => void;
}


const IntroBlock: FunctionComponent<FinalStepProps> = ({nextFunction}) => {
  const fundCriteriaPreview = useAppSelector(selectFundCriteriaPreview);

  if (!fundCriteriaPreview) return <></>

  return <>
    <h1 className="preview-card-title">
      {fundCriteriaPreview.name}
      <Button variant="outline-primary btn-share float-end">Share</Button>
    </h1>
    <Button variant="primary" size="lg" onClick={nextFunction}>Start</Button>
  </>
};

export default IntroBlock;
