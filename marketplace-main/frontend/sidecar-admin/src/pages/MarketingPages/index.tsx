import React, {FunctionComponent} from 'react';
import FundMarketingPagesTable from "./components/FundMarketingPagesTable";
import Container from "react-bootstrap/Container";
import { IFundDetail } from "../../interfaces/fundDetails";
import { MarketingPageHeading } from "./styles";
import CreateMarketingPageButton from "./components/CreateMarketingPageModal";

interface EligibilityCriteriaPageProps {
  fund: IFundDetail
}


const MarketingPages: FunctionComponent<EligibilityCriteriaPageProps> = ({fund}) => {


  return <Container fluid>
    <MarketingPageHeading>
      Marketing Pages
      <CreateMarketingPageButton fund={fund} />
    </MarketingPageHeading>
    <FundMarketingPagesTable fund={fund}/>
  </Container>
};

export default MarketingPages;
