import React, {FunctionComponent} from "react";
import nextStep from "../../../../assets/images/next-step-icon.svg"
import {ReadyForNextStepDiv} from "./styles";
import {getOnboardingURL} from "../../../../components/StartPage/utils";


interface ReadyForNextProps {
  nextUrl: string
  completed: boolean
}

const ReadyForNextStep: FunctionComponent<ReadyForNextProps> = ({nextUrl, completed}) => {
  const statusText = completed ? 'Fully Completed!' : 'Ready for next steps!'
  const onboardUrl = getOnboardingURL(nextUrl)
  return (
    <ReadyForNextStepDiv>
      <div className={'left-div'}>
        <div className={'label'}>Application Status:</div>
        <div className={'value'}>{statusText}</div>
      </div>
      <div>
        {!completed &&
          <a className={'action'} href={onboardUrl}>
            Continue your application
            <img src={nextStep}/>
          </a>}
      </div>
    </ReadyForNextStepDiv>
  );
};

export default ReadyForNextStep;
