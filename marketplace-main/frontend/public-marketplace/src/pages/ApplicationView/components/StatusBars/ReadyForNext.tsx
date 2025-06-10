import React, {FunctionComponent, useMemo} from "react";
import nextStep from "../../../../assets/images/next-step-icon.svg"
import {ReadyForNextStepDiv} from "./styles";
import get from "lodash/get";
import { useParams } from "react-router-dom";


const getOnboardingURL = (link: string, company?: string) => {
  const params = new URL(link);
  let pathName = get(params, 'pathname', link);
  pathName = pathName.replace('/investor',`/${company}`)

  if(pathName.includes('/onboarding')){
    pathName = pathName.replace('/funds','/opportunity')
  }
  
  return pathName
}


interface ReadyForNextProps {
  nextUrl: string;
  completed: boolean;
}

const ReadyForNextStep: FunctionComponent<ReadyForNextProps> = ({nextUrl, completed}) => {
  const {company} = useParams<{company:string}>()
  const statusText = completed ? 'Fully Completed!' : 'Ready for next steps!'
  const onboardUrl = useMemo(
		() => getOnboardingURL(nextUrl, company),
		[nextUrl, company],
  ) 


  return (
    <ReadyForNextStepDiv>
      <div className={'left-div'}>
        <div className={'label'}>Application Status:</div>
        <div className={'value'}>{statusText}</div>
      </div>
      <div>
        {!completed && <a className={'action'} href={onboardUrl}>
          Continue your application
          <img src={nextStep}/>
        </a>}
      </div>
    </ReadyForNextStepDiv>
  );
};

export default ReadyForNextStep;
