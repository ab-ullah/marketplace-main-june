import React, {FunctionComponent} from 'react';
import { useGetFundDetailsQuery } from "../../../../api/rtkQuery/fundsApi";
import {ActiveBlockContainer, PreviewContainer, LogoBlock} from "../../styles";
import CountryInvestorSelector from "./index";
import LogoLasalle from "../../../../components/Logo";


interface EligibilityCriteriaPreviewPageProps {
  externalId: string
}


const PreviewModeCountrySelector: FunctionComponent<EligibilityCriteriaPreviewPageProps> = ({externalId}) => {
  const {data: fundDetails} = useGetFundDetailsQuery(externalId);
  return <PreviewContainer fluid>
      <LogoBlock><LogoLasalle size="md" suffixText={fundDetails?.name} /></LogoBlock>
    <ActiveBlockContainer>
      <CountryInvestorSelector externalId={externalId}/>
    </ActiveBlockContainer>
  </PreviewContainer>
}

export default PreviewModeCountrySelector;
