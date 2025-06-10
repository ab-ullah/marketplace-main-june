import React, {FunctionComponent} from "react";
import arrowLeft from "../../../../assets/images/arrow-left-icon.svg"
import {BackLink} from "./styles";
import {useHistory} from "react-router";
import { useCompanyPrefix } from "../../../../utils/hooks";
import { getHomepageUrl } from "../../../../utils/routes";


interface BackToDashboardProps {
}

const BackToDashboard: FunctionComponent<BackToDashboardProps> = () => {
  const history = useHistory()
  const {companyPrefix} =useCompanyPrefix()
  const onClick = () => window.open(getHomepageUrl(companyPrefix),'_self')

  return (
    <BackLink onClick={onClick}>

      <img src={arrowLeft}/>
      Back to Dashboard
    </BackLink>
  );
};

export default BackToDashboard;
