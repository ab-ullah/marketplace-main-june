import React, {FunctionComponent} from "react";
import historyIcon from "../../../../assets/images/history_toggle_off.svg"
import {PendingReviewDiv} from "./styles";


interface PendingReviewStatusProps {
}

const PendingReviewStatus: FunctionComponent<PendingReviewStatusProps> = () => {
  return (
    <PendingReviewDiv>
      <div className={'left-div'}>
        <div className={'label'}>Application Status:</div>
        <div className={'value'}>Pending Review</div>
      </div>
      <div>
        <div className={'action'}>
          We will email you as soon as it's ready!
          <img src={historyIcon}/>
        </div>
      </div>
    </PendingReviewDiv>
  );
};

export default PendingReviewStatus;
