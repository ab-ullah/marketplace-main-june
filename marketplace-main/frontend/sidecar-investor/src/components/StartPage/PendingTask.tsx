import React, {FunctionComponent} from "react";
import {ActiveApplicationCardDiv, Button, H3, H4} from "./styles";
import {IActiveApplicationFund} from "../../interfaces/applicationStatus";
import {useHistory} from "react-router-dom";
import arrowRight from "../../assets/images/white-arrow-right.svg"
import toLower from "lodash/toLower";
import { useCompanyPrefix } from "../../utils/hooks";
import map from "lodash/map";
import Col from "react-bootstrap/Col";
import RightArrow from "../../assets/react-icons/RightArrow";

interface ActiveApplicationCardProps {
  header: string
  subtexts: string[]
  action_required: boolean
  onClick: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void
  simpleButton?: boolean
}


const CONTINUE_STATUS = ['continue', 'approved']

const PendingTask: FunctionComponent<ActiveApplicationCardProps> = (
  {
    header,
    subtexts,
    action_required,
    onClick,
    simpleButton
  }
) => {

  return (
    <ActiveApplicationCardDiv>
      <div className={'fund-name'}><H3>{header}</H3></div>
      {action_required && <div>
        <span className={'changes-requested'}>Action Required</span>
      </div>}
      <div className={'lower-div'}>
        <div className={'info-div'}>
          {map(subtexts, (subtext: string) => <p className={'m-0'}>{subtext}</p>)}
        </div>
        <div className={'button-div'}>
          {simpleButton?
          <button style={{backgroundColor: "transparent", borderColor: "transparent"}} onClick={onClick}>
          <div className={'ms-2'}><RightArrow color="#776697"/></div>
          </button>
          :
          <Button onClick={onClick} style={{display:'flex',alignItems:'center'}}>
            View Application <div className={'ms-2'}><RightArrow color="#ffff"/></div>
          </Button>
}
        </div>
      </div>
    </ActiveApplicationCardDiv>
  );
};

export default PendingTask;
