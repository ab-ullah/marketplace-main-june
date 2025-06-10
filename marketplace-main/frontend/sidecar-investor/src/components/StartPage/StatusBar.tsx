import {FunctionComponent} from "react";
import { OWNERSHIP_PATH } from "../Navbar/constants";
import {ContactWrapper, H1, H2, H3, StatusBarDiv} from "./styles";
import { useCompanyPrefix } from "../../utils/hooks";

interface StatusBarProps {
  activeApplicationCount: number
  opportunitiesCount: number
  investmentsCount: number
  scrollTo: (ref:string)=>void
  showActiveInvestments: boolean;
}

const StatusBar: FunctionComponent<StatusBarProps> = (
  {
    activeApplicationCount,
    opportunitiesCount,
    investmentsCount,
    scrollTo,
    showActiveInvestments
  }
) => {
  const {companyPrefix} =useCompanyPrefix()
  return (
    <StatusBarDiv>
      <div role='button' onClick={()=>scrollTo('refApp')} className={'right-border'}><span className={'counter'}>{activeApplicationCount}</span>{activeApplicationCount==1?'Application': 'Applications'}</div>
      <div role='button' onClick={()=>scrollTo('refOpp')} className={showActiveInvestments ? 'right-border' : ''}><span className={'counter'}>{opportunitiesCount}</span>{opportunitiesCount==1?'Opportunity':'Opportunities'} </div>
      {showActiveInvestments && <div role='button' onClick={()=>window.open(window.location.origin+companyPrefix+OWNERSHIP_PATH)}><span className={'counter'}>{investmentsCount}</span>{investmentsCount==1 ? 'Active Investment':'Active Investments'} </div>}
    </StatusBarDiv>
  );
};

export default StatusBar;
